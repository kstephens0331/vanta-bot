# syntax=docker/dockerfile:1

# ---- build stage ----
FROM node:20-alpine AS build
WORKDIR /app

# Copy package metadata (works with or without package-lock.json)
COPY server/package*.json ./

# If there is a lockfile, use npm ci; otherwise npm install
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copy source and build
COPY server/ ./
RUN npm run build && npm prune --omit=dev

# ---- runtime stage ----
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Bring only what we need to run
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./

EXPOSE 3000
# if your server/package.json has "start": "node -r dotenv/config dist/index.js"
CMD ["npm","start"]
