# --------------------------------------------------
# Base image
# --------------------------------------------------
FROM node:22-bullseye-slim AS base

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

RUN pnpm prune --prod


# --------------------------------------------------
# Build stage
# --------------------------------------------------
FROM base AS build
WORKDIR /myapp

COPY package.json pnpm-lock.yaml ./

COPY --from=deps /myapp/node_modules /myapp/node_modules


# Prisma schema first (cache-friendly)
COPY prisma ./prisma
RUN pnpm prisma generate

# App source
COPY . .
RUN pnpm build


# --------------------------------------------------
# Final runtime image
# --------------------------------------------------
FROM base

ENV DATABASE_URL="file:/data/sqlite.db"
ENV PORT=8080
ENV NODE_ENV=production

# SQLite helper (Prisma uses file:, sqlite does not)
RUN echo '#!/bin/sh\nset -x\nsqlite3 /data/sqlite.db' \
  > /usr/local/bin/database-cli \
  && chmod +x /usr/local/bin/database-cli

WORKDIR /myapp

COPY --from=production-deps /myapp/node_modules /myapp/node_modules
COPY --from=build /myapp/node_modules/.prisma /myapp/node_modules/.prisma

COPY --from=build /myapp/build ./build
COPY --from=build /myapp/public ./public
COPY --from=build /myapp/package.json ./package.json
COPY --from=build /myapp/start.sh ./start.sh
COPY --from=build /myapp/prisma ./prisma

RUN chmod +x ./start.sh

CMD ["./start.sh"]
