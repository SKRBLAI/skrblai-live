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
# Railway provides PORT; default to 3000 for local runs
ENV PORT=3000

# Run as non-root
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

# Copy standalone output
# This puts server.js at /app/server.js
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

# Basic healthcheck hitting our health route
HEALTHCHECK --interval=20s --timeout=3s --retries=5 CMD wget -qO- http://127.0.0.1:${PORT}/api/health || exit 1

# Next standalone respects PORT and binds 0.0.0.0
CMD ["node","server.js"]