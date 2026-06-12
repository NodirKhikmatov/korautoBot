export class FavoriteError extends Error {
  readonly status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "FavoriteError";
    this.status = status;
  }
}
