# syntax=docker/dockerfile:1

# ---- deps (dev) ----
FROM node:20-alpine AS deps
WORKDIR /app
# copy package metadata; tolerate missing lockfile
COPY server/package*.json ./
# install with dev deps to build TypeScript
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# ---- build ----
FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY server/ ./
RUN npm run build

# ---- deps (prod only) ----
FROM node:20-alpine AS prod-deps
WORKDIR /app
COPY server/package*.json ./
# fresh prod-only install (no dev deps)
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi

# ---- runtime ----
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
# bring only what's needed to run
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY server/package*.json ./
EXPOSE 3000
CMD ["npm","start"]
