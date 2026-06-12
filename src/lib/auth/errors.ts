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

export class ForbiddenError extends Error {
  readonly status = 403;

  constructor(message = "Forbidden") {
    super(message);
    this.name = "ForbiddenError";
  }
}
