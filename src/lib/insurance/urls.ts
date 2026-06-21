export function buildInsuranceCalculatorPath(params?: {
  price?: number;
  year?: number;
  mileage?: number;
}): string {
  const search = new URLSearchParams();

  if (params?.price !== undefined) {
    search.set("price", String(params.price));
  }
  if (params?.year !== undefined) {
    search.set("year", String(params.year));
  }
  if (params?.mileage !== undefined) {
    search.set("mileage", String(params.mileage));
  }

  const query = search.toString();
  return query ? `/tools/insurance?${query}` : "/tools/insurance";
}

export function getInsuranceWebAppUrl(): string {
  const base = process.env.NEXT_PUBLIC_APP_URL?.trim() || "https://t.me";
  return `${base.replace(/\/$/, "")}/tools/insurance`;
}
