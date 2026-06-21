# syntax=docker/dockerfile:1
# Korea Auto Market — production multi-stage image (Next.js standalone)

FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat wget
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_APP_URL=https://example.com
ARG NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=${NEXT_PUBLIC_TELEGRAM_BOT_USERNAME}
ENV NEXT_TELEMETRY_DISABLED=1
# Build-time placeholders — real values are injected at runtime via .env.production on VPS.
ENV DATABASE_URL=postgresql://build:build@127.0.0.1:5432/build

RUN npm run build

FROM base AS migrator
LABEL org.opencontainers.image.title="korea-auto-market-migrate"
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY drizzle ./drizzle
COPY scripts/lib ./scripts/lib
COPY scripts/run-migrations.mjs ./scripts/run-migrations.mjs
ENV NODE_ENV=production
CMD ["node", "scripts/run-migrations.mjs"]

FROM base AS runner
LABEL org.opencontainers.image.title="korea-auto-market"

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/sharp ./node_modules/sharp
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@img ./node_modules/@img

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=15s --timeout=5s --start-period=45s --retries=5 \
  CMD wget -q --spider http://127.0.0.1:3000/api/health || exit 1

CMD ["node", "server.js"]
