"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { ImageUploader } from "@/components/cars/image-uploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAdminMutations } from "@/hooks/use-admin";
import { useTranslatedFormat } from "@/hooks/use-translated-format";
import {
  CAR_BRANDS,
  FUEL_TYPES,
  TRANSMISSION_TYPES,
} from "@/lib/constants";
import { adminCreateCarSchema } from "@/schemas/admin";
import type { UploadedCarImage } from "@/types";

export function AdminCreateListingForm() {
  const router = useRouter();
  const { createCar } = useAdminMutations();
  const { formatFuelType, formatTransmission } = useTranslatedFormat();
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<UploadedCarImage[]>([]);

  const [sellerDisplayName, setSellerDisplayName] = useState("");
  const [sellerUsername, setSellerUsername] = useState("");
  const [sellerTelegramId, setSellerTelegramId] = useState("");
  const [sellerPhone, setSellerPhone] = useState("");

  const [title, setTitle] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [price, setPrice] = useState("");
  const [mileage, setMileage] = useState("");
  const [fuelType, setFuelType] = useState<string>(FUEL_TYPES[0]);
  const [transmission, setTransmission] = useState<string>(
    TRANSMISSION_TYPES[0],
  );
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (images.length === 0) {
      setError("Add at least one photo");
      return;
    }

    const payload = {
      title,
      brand,
      model,
      year: Number(year),
      price: Number(price),
      mileage: Number(mileage),
      fuel_type: fuelType as typeof FUEL_TYPES[number],
      transmission: transmission as typeof TRANSMISSION_TYPES[number],
      description: description || undefined,
      location: location || undefined,
      isActive,
      isFeatured,
      seller_display_name: sellerDisplayName || null,
      seller_username: sellerUsername || null,
      seller_telegram_id: sellerTelegramId ? Number(sellerTelegramId) : null,
      seller_phone: sellerPhone || null,
      images: images.map((img) => ({
        url: img.url,
        thumbnailUrl: img.thumbnailUrl,
      })),
    };

    const parsed = adminCreateCarSchema.safeParse(payload);

    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? "Invalid form data");
      return;
    }

    try {
      const { car } = await createCar.mutateAsync(parsed.data);
      router.push(`/admin/listings/${car.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create listing");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4 rounded-2xl border border-primary/20 bg-primary/5 p-4">
        <div>
          <h3 className="font-semibold">Seller contact</h3>
          <p className="text-sm text-muted-foreground">
            From the original listing. Buyers will see this seller, not your admin account.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="sellerDisplayName">Seller name</Label>
          <Input
            id="sellerDisplayName"
            placeholder="Ali / Car dealer name"
            value={sellerDisplayName}
            onChange={(e) => setSellerDisplayName(e.target.value)}
            className="h-11 rounded-xl bg-card/50"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="sellerUsername">Telegram username</Label>
            <Input
              id="sellerUsername"
              placeholder="@seller_username"
              value={sellerUsername}
              onChange={(e) => setSellerUsername(e.target.value)}
              className="h-11 rounded-xl bg-card/50"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sellerTelegramId">Telegram ID</Label>
            <Input
              id="sellerTelegramId"
              type="number"
              placeholder="123456789"
              value={sellerTelegramId}
              onChange={(e) => setSellerTelegramId(e.target.value)}
              className="h-11 rounded-xl bg-card/50"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="sellerPhone">Phone</Label>
          <Input
            id="sellerPhone"
            placeholder="+998 90 123 45 67"
            value={sellerPhone}
            onChange={(e) => setSellerPhone(e.target.value)}
            className="h-11 rounded-xl bg-card/50"
          />
        </div>

        <p className="text-xs text-muted-foreground">
          At least one of Telegram username, Telegram ID, or phone is required.
        </p>
      </div>

      <div className="space-y-2">
        <Label>Photos</Label>
        <ImageUploader images={images} onChange={setImages} />
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            placeholder="2022 Hyundai Sonata DN8"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-11 rounded-xl bg-card/50"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Brand</Label>
            <Select
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              required
            >
              <option value="" disabled>Select brand</option>
              {CAR_BRANDS.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="model">Model</Label>
            <Input
              id="model"
              placeholder="Sonata"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="h-11 rounded-xl bg-card/50"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="year">Year</Label>
            <Input
              id="year"
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="h-11 rounded-xl bg-card/50"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="price">Price (₩)</Label>
            <Input
              id="price"
              type="number"
              placeholder="25000000"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="h-11 rounded-xl bg-card/50"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="mileage">Mileage (km)</Label>
            <Input
              id="mileage"
              type="number"
              placeholder="45000"
              value={mileage}
              onChange={(e) => setMileage(e.target.value)}
              className="h-11 rounded-xl bg-card/50"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>Location</Label>
            <Input
              placeholder="Seoul"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="h-11 rounded-xl bg-card/50"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Fuel type</Label>
            <Select
              value={fuelType}
              onChange={(e) => setFuelType(e.target.value)}
            >
              {FUEL_TYPES.map((fuel) => (
                <option key={fuel} value={fuel}>
                  {formatFuelType(fuel)}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Transmission</Label>
            <Select
              value={transmission}
              onChange={(e) => setTransmission(e.target.value)}
            >
              {TRANSMISSION_TYPES.map((t) => (
                <option key={t} value={t}>
                  {formatTransmission(t)}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Condition, features, history..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex items-center gap-2 rounded-xl border border-border/60 bg-card/50 px-3 py-3 text-sm">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            Active listing
          </label>
          <label className="flex items-center gap-2 rounded-xl border border-border/60 bg-card/50 px-3 py-3 text-sm">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            Featured
          </label>
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <Button
        type="submit"
        size="lg"
        className="h-12 w-full rounded-xl text-base font-semibold"
        disabled={createCar.isPending}
      >
        {createCar.isPending ? "Publishing…" : "Import listing"}
      </Button>
    </form>
  );
}
