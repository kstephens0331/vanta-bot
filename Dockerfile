# syntax=docker/dockerfile:1

FROM node:20-alpine as base
WORKDIR /app

# Install deps for the server package
# Use npm ci if lockfile exists, otherwise fall back to npm install
COPY server/package.json ./package.json
COPY server/package-lock.json ./package-lock.json
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copy source and build
COPY server/ ./
RUN npm run build

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
CMD ["npm","start"]
