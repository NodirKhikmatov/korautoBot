import { normalizeTelegramUsername } from "@/lib/telegram/contact";
import type { Car, SellerProfile } from "@/types";

export type EffectiveSeller = SellerProfile & {
  phone: string | null;
  telegramId: number | null;
  isExternal: boolean;
};

type CarWithUser = Car & {
  user: Pick<SellerProfile, "id"> & Partial<Omit<SellerProfile, "id">>;
};

export function hasSellerOverride(car: Car): boolean {
  return Boolean(
    car.sellerDisplayName?.trim() ||
      car.sellerUsername?.trim() ||
      car.sellerTelegramId ||
      car.sellerPhone?.trim(),
  );
}

export function getEffectiveSeller(car: CarWithUser): EffectiveSeller {
  if (!hasSellerOverride(car)) {
    return {
      id: car.user.id,
      username: car.user.username ?? null,
      firstName: car.user.firstName ?? null,
      lastName: car.user.lastName ?? null,
      photoUrl: car.user.photoUrl ?? null,
      phone: null,
      telegramId: null,
      isExternal: false,
    };
  }

  const username = car.sellerUsername
    ? normalizeTelegramUsername(car.sellerUsername)
    : null;
  const displayName =
    car.sellerDisplayName?.trim() ||
    (username ? `@${username}` : null) ||
    (car.sellerTelegramId ? `Telegram ${car.sellerTelegramId}` : null) ||
    car.sellerPhone?.trim() ||
    "Seller";

  return {
    id: car.user.id,
    username,
    firstName: displayName,
    lastName: null,
    photoUrl: null,
    phone: car.sellerPhone?.trim() ?? null,
    telegramId: car.sellerTelegramId ?? null,
    isExternal: true,
  };
}
