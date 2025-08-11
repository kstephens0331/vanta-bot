# syntax=docker/dockerfile:1

# ---- deps (dev) ----
FROM node:20-bookworm-slim AS deps
WORKDIR /app
# tolerate missing lockfile
COPY server/package*.json ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# ---- build ----
FROM node:20-bookworm-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY server/ ./
# call tsc directly (bypass .bin shim)
RUN node node_modules/typescript/bin/tsc -p tsconfig.json

# ---- deps (prod only) ----
FROM node:20-bookworm-slim AS prod-deps
WORKDIR /app
COPY server/package*.json ./
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi

# ---- runtime ----
FROM node:20-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY server/package*.json ./
EXPOSE 3000
CMD ["npm","start"]
