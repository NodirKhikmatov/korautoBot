export function isListingSold(car: {
  soldAt: Date | string | null;
}): boolean {
  return Boolean(car.soldAt);
}

/** Active listings and sold listings (marketing) are publicly visible. */
export function isPublicListing(car: {
  isActive: boolean;
  soldAt: Date | string | null;
  deletedAt?: Date | string | null;
}): boolean {
  if (car.deletedAt) {
    return false;
  }

  return car.isActive || isListingSold(car);
}

/** Only active, unsold listings can receive new buyer contact. */
export function canContactListing(car: {
  isActive: boolean;
  soldAt: Date | string | null;
}): boolean {
  return car.isActive && !isListingSold(car);
}
