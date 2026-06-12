import { QueryClient, isServer } from "@tanstack/react-query";

import {
  CARS_GC_TIME_MS,
  CARS_STALE_TIME_MS,
} from "@/lib/search/constants";

function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: CARS_STALE_TIME_MS,
        gcTime: CARS_GC_TIME_MS,
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

export function getQueryClient(): QueryClient {
  if (isServer) {
    return makeQueryClient();
  }

  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }

  return browserQueryClient;
}
