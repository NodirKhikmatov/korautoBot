export const SESSION_COOKIE = "kam_session";

export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

/** API routes that require a valid session cookie (middleware). */
export const PROTECTED_API_ROUTES: {
  pattern: RegExp;
  methods: string[];
}[] = [
  { pattern: /^\/api\/upload$/, methods: ["POST", "DELETE"] },
  { pattern: /^\/api\/favorites$/, methods: ["GET", "POST", "DELETE"] },
  { pattern: /^\/api\/favorites\/check$/, methods: ["GET"] },
  { pattern: /^\/api\/cars$/, methods: ["POST"] },
  { pattern: /^\/api\/cars\/mine$/, methods: ["GET"] },
  { pattern: /^\/api\/cars\/[^/]+$/, methods: ["DELETE"] },
];

/** Page routes that require authentication (middleware). */
export const PROTECTED_PAGE_ROUTES: RegExp[] = [/^\/create$/];
