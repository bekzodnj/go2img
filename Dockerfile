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

# TODO(prisma-generate): stop committing prisma/generated/ to git.
# Prisma recommends generating on install/build instead -- a committed client
# can silently drift from schema.prisma and from the @prisma/client runtime.
# Handover:
#   1. gitignore + untrack prisma/generated/
#   2. add "postinstall": "prisma generate" to package.json (the dev-deps stage
#      already copies prisma/ before npm ci, so it has the schema)
#   3. prod-deps stage MUST become `npm ci --omit=dev --ignore-scripts`, else
#      postinstall runs there without the prisma CLI (devDep) and the build fails
#   4. drop `prisma generate` from the runtime CMD below -- it cannot help, the
#      client is already inlined into build/server at build time
# Open decision: CMD's `migrate deploy` still needs the prisma CLI at runtime,
# but prisma is a devDependency, so npx fetches it over the network on boot.
# Either move prisma to dependencies, or run migrations as a separate release step.
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