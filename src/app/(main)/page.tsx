import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { HomePageClient } from "@/app/(main)/home-page-client";
import { getQueryClient } from "@/lib/query/get-query-client";
import { getCars, getFeaturedCars } from "@/services/cars";

const HOME_LIST_FILTERS = { limit: 12 } as const;

export default async function HomePage() {
  const queryClient = getQueryClient();

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["cars", HOME_LIST_FILTERS],
      queryFn: () => getCars({}, 1, HOME_LIST_FILTERS.limit),
    }),
    queryClient.prefetchQuery({
      queryKey: ["cars", "featured"],
      queryFn: async () => {
        const cars = await getFeaturedCars(6);
        return { cars };
      },
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HomePageClient />
    </HydrationBoundary>
  );
}
