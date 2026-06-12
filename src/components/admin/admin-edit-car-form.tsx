"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAdminMutations } from "@/hooks/use-admin";
import {
  CAR_BRANDS,
  FUEL_TYPES,
  TRANSMISSION_TYPES,
} from "@/lib/constants";
import { formatFuelType, formatTransmission } from "@/lib/format";
import { adminUpdateCarSchema } from "@/schemas/admin";
import type { CarWithSeller } from "@/types";

export function AdminEditCarForm({ car }: { car: CarWithSeller }) {
  const router = useRouter();
  const { updateCar } = useAdminMutations();
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(car.title);
  const [brand, setBrand] = useState(car.brand);
  const [model, setModel] = useState(car.model);
  const [year, setYear] = useState(String(car.year));
  const [price, setPrice] = useState(String(car.price));
  const [mileage, setMileage] = useState(String(car.mileage));
  const [fuelType, setFuelType] = useState(car.fuelType);
  const [transmission, setTransmission] = useState(car.transmission);
  const [description, setDescription] = useState(car.description ?? "");
  const [location, setLocation] = useState(car.location ?? "");
  const [isActive, setIsActive] = useState(car.isActive);
  const [isFeatured, setIsFeatured] = useState(car.isFeatured);

  useEffect(() => {
    setTitle(car.title);
    setBrand(car.brand);
    setModel(car.model);
    setYear(String(car.year));
    setPrice(String(car.price));
    setMileage(String(car.mileage));
    setFuelType(car.fuelType);
    setTransmission(car.transmission);
    setDescription(car.description ?? "");
    setLocation(car.location ?? "");
    setIsActive(car.isActive);
    setIsFeatured(car.isFeatured);
  }, [car]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const payload = {
      title,
      brand,
      model,
      year: Number(year),
      price: Number(price),
      mileage: Number(mileage),
      fuel_type: fuelType,
      transmission,
      description: description || null,
      location: location || null,
      isActive,
      isFeatured,
    };

    const parsed = adminUpdateCarSchema.safeParse(payload);

    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? "Invalid form data");
      return;
    }

    try {
      await updateCar.mutateAsync({ carId: car.id, data: parsed.data });
      router.push("/admin/listings");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update listing");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
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
            {CAR_BRANDS.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="model">Model</Label>
          <Input
            id="model"
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
            value={mileage}
            onChange={(e) => setMileage(e.target.value)}
            className="h-11 rounded-xl bg-card/50"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label>Fuel</Label>
          <Select
            value={fuelType}
            onChange={(e) => setFuelType(e.target.value as typeof fuelType)}
          >
            {FUEL_TYPES.map((f) => (
              <option key={f} value={f}>{formatFuelType(f)}</option>
            ))}
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Transmission</Label>
        <Select
          value={transmission}
          onChange={(e) =>
            setTransmission(e.target.value as typeof transmission)
          }
        >
          {TRANSMISSION_TYPES.map((t) => (
            <option key={t} value={t}>{formatTransmission(t)}</option>
          ))}
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="h-11 rounded-xl bg-card/50"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-24 rounded-xl bg-card/50"
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

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <div className="grid grid-cols-2 gap-2">
        <Button
          type="button"
          variant="outline"
          className="h-11 rounded-xl"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="h-11 rounded-xl"
          disabled={updateCar.isPending}
        >
          {updateCar.isPending ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
