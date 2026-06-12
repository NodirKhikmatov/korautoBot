"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { ImageUploader } from "@/components/cars/image-uploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateCar } from "@/hooks/use-create-car";
import { useTranslatedFormat } from "@/hooks/use-translated-format";
import {
  CAR_BRANDS,
  FUEL_TYPES,
  TRANSMISSION_TYPES,
} from "@/lib/constants";
import { createCarSchema } from "@/schemas/car";
import type { UploadedCarImage } from "@/types";

export function CreateListingForm() {
  const t = useTranslations("listing");
  const { formatFuelType, formatTransmission } = useTranslatedFormat();
  const router = useRouter();
  const createCar = useCreateCar();
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<UploadedCarImage[]>([]);

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (images.length === 0) {
      setError(t("addPhotoRequired"));
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
      images: images.map((img) => ({
        url: img.url,
        thumbnailUrl: img.thumbnailUrl,
      })),
    };

    const parsed = createCarSchema.safeParse(payload);

    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? t("invalidFormData"));
      return;
    }

    try {
      const { car } = await createCar.mutateAsync(parsed.data);
      router.push(`/car/${car.id}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("createFailed"),
      );
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label>{t("photos")}</Label>
        <ImageUploader images={images} onChange={setImages} />
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="title">{t("title")}</Label>
          <Input
            id="title"
            placeholder={t("titlePlaceholder")}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-11 rounded-xl bg-card/50"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>{t("brand")}</Label>
            <Select
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              required
            >
              <option value="" disabled>{t("selectBrand")}</option>
              {CAR_BRANDS.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="model">{t("model")}</Label>
            <Input
              id="model"
              placeholder={t("modelPlaceholder")}
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="h-11 rounded-xl bg-card/50"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="year">{t("year")}</Label>
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
            <Label htmlFor="price">{t("priceWithCurrency")}</Label>
            <Input
              id="price"
              type="number"
              placeholder={t("pricePlaceholder")}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="h-11 rounded-xl bg-card/50"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="mileage">{t("mileageWithUnit")}</Label>
            <Input
              id="mileage"
              type="number"
              placeholder={t("mileagePlaceholder")}
              value={mileage}
              onChange={(e) => setMileage(e.target.value)}
              className="h-11 rounded-xl bg-card/50"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t("location")}</Label>
            <Input
              placeholder={t("locationPlaceholder")}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="h-11 rounded-xl bg-card/50"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>{t("fuelType")}</Label>
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
            <Label>{t("transmission")}</Label>
            <Select
              value={transmission}
              onChange={(e) => setTransmission(e.target.value)}
            >
              {TRANSMISSION_TYPES.map((trans) => (
                <option key={trans} value={trans}>
                  {formatTransmission(trans)}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">{t("description")}</Label>
          <Textarea
            id="description"
            placeholder={t("descriptionPlaceholder")}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />
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
        {createCar.isPending ? t("publishing") : t("publish")}
      </Button>
    </form>
  );
}
