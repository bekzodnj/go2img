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

# --ignore-scripts: the postinstall hook runs `prisma generate`, which loads
# prisma.config.ts and requires DATABASE_URL. .env is dockerignored, so there is
# no DATABASE_URL here. The build stage generates explicitly instead.
RUN npm ci --ignore-scripts

# -------------------------------
# Build stage
# -------------------------------
FROM base AS build

COPY . .
COPY --from=dev-deps /app/node_modules ./node_modules

# Prisma client is gitignored, so generate it here. prisma.config.ts resolves
# DATABASE_URL at load time, but generate never connects, so a placeholder is
# enough -- the real URL is injected at runtime.
RUN DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder" \
    npx prisma generate

# Build your app (React Router / server build)
RUN npm run build

# -------------------------------
# Production dependencies only
# -------------------------------
FROM base AS prod-deps

COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./prisma.config.ts

# --ignore-scripts: same reason as above -- postinstall's `prisma generate` needs
# DATABASE_URL, and generating here is pointless anyway since the client is
# already baked into build/server at build time.
RUN npm ci --omit=dev --ignore-scripts

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

# The app listens on 3000 (react-router-serve default, honors PORT).
EXPOSE 3000

# Run migrations only at startup (NOT generate)
CMD ["sh", "-c", "npm run db:deploy && npm run start"]