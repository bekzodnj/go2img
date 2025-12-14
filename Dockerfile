# --------------------------------------------------
# Base image
# --------------------------------------------------
FROM node:24-bullseye-slim AS base

ENV NODE_ENV=production
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# System deps for Prisma + SQLite
RUN apt-get update \
  && apt-get install -y openssl sqlite3 \
  && rm -rf /var/lib/apt/lists/*

# Enable pnpm via Corepack
RUN corepack enable

WORKDIR /myapp


# --------------------------------------------------
# Install dependencies (dev + prod)
# --------------------------------------------------
FROM base AS deps

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile


# --------------------------------------------------
# Production-only dependencies
# --------------------------------------------------
FROM base AS production-deps

COPY --from=deps /myapp/node_modules /myapp/node_modules
COPY package.json pnpm-lock.yaml ./

# Remove devDependencies
RUN pnpm prune --prod


# --------------------------------------------------
# Build stage
# --------------------------------------------------
FROM base AS build

# We NEED devDependencies here (react-router, prisma, etc.)
COPY --from=deps /myapp/node_modules /myapp/node_modules

# Prisma schema first (cache-friendly)
COPY prisma ./prisma
RUN pnpm exec prisma generate

# App source
COPY . .

# IMPORTANT: run script, not binary
RUN pnpm run build


# --------------------------------------------------
# Final runtime image
# --------------------------------------------------
FROM base

ENV DATABASE_URL="file:/data/sqlite.db"
ENV PORT=8080
ENV NODE_ENV=production

# SQLite helper
RUN echo '#!/bin/sh\nset -x\nsqlite3 /data/sqlite.db' \
  > /usr/local/bin/database-cli \
  && chmod +x /usr/local/bin/database-cli

WORKDIR /myapp

# Only production deps in final image
COPY --from=production-deps /myapp/node_modules /myapp/node_modules

# Prisma engine + generated client
COPY --from=build /myapp/node_modules/.prisma /myapp/node_modules/.prisma

# Built app + runtime files
COPY --from=build /myapp/build ./build
COPY --from=build /myapp/public ./public
COPY --from=build /myapp/package.json ./package.json
COPY --from=build /myapp/start.sh ./start.sh
COPY --from=build /myapp/prisma ./prisma

RUN chmod +x ./start.sh

CMD ["./start.sh"]
