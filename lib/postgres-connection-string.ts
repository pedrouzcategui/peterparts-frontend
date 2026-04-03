const SSL_MODES_TO_UPGRADE = new Set(["prefer", "require", "verify-ca"]);
const LIBPQ_COMPAT_ENABLED_VALUES = new Set(["1", "true"]);

export function normalizePostgresConnectionString(connectionString: string) {
  let url: URL;

  try {
    url = new URL(connectionString);
  } catch {
    return connectionString;
  }

  if (url.protocol !== "postgres:" && url.protocol !== "postgresql:") {
    return connectionString;
  }

  const usesLibpqCompat = LIBPQ_COMPAT_ENABLED_VALUES.has(
    url.searchParams.get("uselibpqcompat")?.toLowerCase() ?? "",
  );

  if (usesLibpqCompat) {
    return connectionString;
  }

  const sslMode = url.searchParams.get("sslmode")?.toLowerCase();

  if (!sslMode || !SSL_MODES_TO_UPGRADE.has(sslMode)) {
    return connectionString;
  }

  url.searchParams.set("sslmode", "verify-full");
  return url.toString();
}