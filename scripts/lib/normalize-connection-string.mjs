const LEGACY_SSL_MODE = /([?&])sslmode=(require|prefer|verify-ca)(&|$)/i;

/** pg v8 treats require/prefer/verify-ca as verify-full; normalize to silence the warning. */
export function normalizePgConnectionString(connectionString) {
  return connectionString.replace(LEGACY_SSL_MODE, "$1sslmode=verify-full$3");
}

export function pgConnectionStringUsesSsl(connectionString) {
  return /sslmode=(require|verify-full|verify-ca|prefer)/i.test(connectionString);
}
