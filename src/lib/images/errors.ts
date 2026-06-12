export class ImageUploadError extends Error {
  readonly status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "ImageUploadError";
    this.status = status;
  }
}
