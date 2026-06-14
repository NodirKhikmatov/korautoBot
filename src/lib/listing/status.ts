export function isListingSold(car: {
  soldAt: Date | string | null;
}): boolean {
  return Boolean(car.soldAt);
}
