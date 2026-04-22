import "server-only";

const STOREFRONT_READ_TIMEOUT_MS =
  process.env.NODE_ENV === "production" ? 4000 : 30000;
const STOREFRONT_READ_BACKOFF_MS = 30000;

const storefrontReadBackoffUntilByKey = new Map<string, number>();

class StorefrontReadTimeoutError extends Error {
  constructor(label: string) {
    super(`Storefront read timed out: ${label}`);
    this.name = "StorefrontReadTimeoutError";
  }
}

function shouldBypassStorefrontReads(backoffKey: string) {
  const backoffUntil = storefrontReadBackoffUntilByKey.get(backoffKey) ?? 0;

  if (Date.now() >= backoffUntil) {
    storefrontReadBackoffUntilByKey.delete(backoffKey);
    return false;
  }

  return true;
}

function markStorefrontReadFailure(backoffKey: string) {
  storefrontReadBackoffUntilByKey.set(
    backoffKey,
    Date.now() + STOREFRONT_READ_BACKOFF_MS,
  );
}

function markStorefrontReadSuccess(backoffKey: string) {
  storefrontReadBackoffUntilByKey.delete(backoffKey);
}

function isRecoverableStorefrontError(error: unknown) {
  if (error instanceof StorefrontReadTimeoutError) {
    return true;
  }

  if (!(error instanceof Error)) {
    return false;
  }

  const haystack = `${error.name} ${error.message}`.toLowerCase();

  return [
    "etimedout",
    "timeout",
    "p1001",
    "can't reach database server",
    "cant reach database server",
    "connection terminated",
    "connection error",
    "socket",
  ].some((token) => haystack.includes(token));
}

export async function runStorefrontReadWithFallback<T>(
  label: string,
  query: () => Promise<T>,
  fallback: () => T | Promise<T>,
  options?: {
    backoffKey?: string;
  },
): Promise<T> {
  const backoffKey = options?.backoffKey ?? label;

  if (shouldBypassStorefrontReads(backoffKey)) {
    return fallback();
  }

  let timeoutHandle: ReturnType<typeof setTimeout> | undefined;

  try {
    const queryPromise = query();

    queryPromise.catch(() => undefined);

    const result = await Promise.race([
      queryPromise,
      new Promise<never>((_, reject) => {
        timeoutHandle = setTimeout(() => {
          reject(new StorefrontReadTimeoutError(label));
        }, STOREFRONT_READ_TIMEOUT_MS);
      }),
    ]);

    markStorefrontReadSuccess(backoffKey);
    return result;
  } catch (error) {
    if (!isRecoverableStorefrontError(error)) {
      throw error;
    }

    markStorefrontReadFailure(backoffKey);
    const logRecoverableStorefrontError =
      process.env.NODE_ENV === "production" ? console.error : console.warn;

    logRecoverableStorefrontError(
      `[storefront] Falling back after recoverable read failure in ${label}.`,
      error,
    );

    return fallback();
  } finally {
    if (timeoutHandle) {
      clearTimeout(timeoutHandle);
    }
  }
}