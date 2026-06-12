export const SEARCH_PAGE_SIZE = 20;

/** TanStack Query stale time for car listings (ms). */
export const CARS_STALE_TIME_MS = 2 * 60 * 1000;

/** TanStack Query garbage-collection time for car listings (ms). */
export const CARS_GC_TIME_MS = 10 * 60 * 1000;

export const KOREA_REGIONS = [
  "Seoul",
  "Busan",
  "Incheon",
  "Daegu",
  "Daejeon",
  "Gwangju",
  "Ulsan",
  "Sejong",
  "Gyeonggi",
  "Gangwon",
  "Chungcheong",
  "Jeolla",
  "Gyeongsang",
  "Jeju",
] as const;
