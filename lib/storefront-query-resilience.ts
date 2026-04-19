import "server-only";

const STOREFRONT_READ_TIMEOUT_MS = 4000;
const STOREFRONT_READ_BACKOFF_MS = 30000;

let storefrontReadBackoffUntil = 0;

class StorefrontReadTimeoutError extends Error {
  constructor(label: string) {
    super(`Storefront read timed out: ${label}`);
    this.name = "StorefrontReadTimeoutError";
  }
}

function shouldBypassStorefrontReads() {
  return Date.now() < storefrontReadBackoffUntil;
}

function markStorefrontReadFailure() {
  storefrontReadBackoffUntil = Date.now() + STOREFRONT_READ_BACKOFF_MS;
}

function markStorefrontReadSuccess() {
  storefrontReadBackoffUntil = 0;
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
): Promise<T> {
  if (shouldBypassStorefrontReads()) {
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

    markStorefrontReadSuccess();
    return result;
  } catch (error) {
    if (!isRecoverableStorefrontError(error)) {
      throw error;
    }

    markStorefrontReadFailure();
    console.error(
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