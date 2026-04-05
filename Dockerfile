# -------------------------------
# Base image (shared)
# -------------------------------
FROM node:lts-alpine AS base

WORKDIR /app

# -------------------------------
# Dependencies (dev + build)
# -------------------------------
FROM base AS dev-deps

COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./prisma.config.ts

RUN npm ci

# -------------------------------
# Build stage
# -------------------------------
FROM base AS build

COPY . .
COPY --from=dev-deps /app/node_modules ./node_modules

# Generate Prisma client at build time
RUN echo "Skipping prisma generate at build"

# Build your app (React Router / server build)
RUN npm run build

# -------------------------------
# Production dependencies only
# -------------------------------
FROM base AS prod-deps

COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./prisma.config.ts

RUN npm ci --omit=dev

# -------------------------------
# Runtime (final image)
# -------------------------------
FROM node:lts-alpine

WORKDIR /app
ENV NODE_ENV=production

# Only copy what is needed
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/build ./build
COPY prisma ./prisma
COPY package.json ./
COPY prisma.config.ts ./prisma.config.ts

# Add this so Prisma knows DATABASE_URL will come from runtime env
ENV DATABASE_URL=${DATABASE_URL}

# Run migrations only at startup (NOT generate)
CMD ["sh", "-c", "npm run db:deploy && npm run start"]