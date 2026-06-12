export class AuthError extends Error {
  readonly status = 401;

  constructor(message = "Unauthorized") {
    super(message);
    this.name = "AuthError";
  }
}

export class AuthConfigError extends Error {
  readonly status = 500;

  constructor(message = "Authentication is not configured") {
    super(message);
    this.name = "AuthConfigError";
  }
}
