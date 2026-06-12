import { CarDetailView } from "@/components/cars/car-detail-view";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CarDetailPage({ params }: PageProps) {
  const { id } = await params;

  return <CarDetailView carId={id} />;
}
