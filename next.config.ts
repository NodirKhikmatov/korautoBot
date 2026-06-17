import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

function getR2ImageHostname(): string | undefined {
  const publicUrl = process.env.R2_PUBLIC_URL;

  if (!publicUrl) {
    return undefined;
  }

  try {
    return new URL(publicUrl).hostname;
  } catch {
    return undefined;
  }
}

const r2Hostname = getR2ImageHostname();

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: process.cwd(),
  serverExternalPackages: ["sharp", "pg"],
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.r2.cloudflarestorage.com",
      },
      {
        protocol: "https",
        hostname: "**.r2.dev",
      },
      ...(r2Hostname
        ? [{ protocol: "https" as const, hostname: r2Hostname }]
        : []),
      {
        protocol: "https",
        hostname: "t.me",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
