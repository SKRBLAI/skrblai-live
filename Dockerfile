# ---- deps ----
FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package*.json ./
RUN npm ci

# ---- build ----
FROM node:20-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---- runtime (standalone) ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# Railway injects PORT (e.g., 8080). Default 3000 for local.
ENV PORT=3000
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

# Copy standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static

# Create cache directory with proper permissions
RUN mkdir -p .next/cache && chown -R nextjs:nodejs .next/cache

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=20s --timeout=3s --retries=5 \
  CMD wget -qO- http://127.0.0.1:${PORT}/api/health || exit 1

CMD ["node","server.js"]