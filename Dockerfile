# -------------------------------
# Development dependencies
# -------------------------------
FROM node:24-bullseye AS development-dependencies-env

WORKDIR /app

# Copy only what npm install needs
COPY package.json package-lock.json ./

# Prisma schema must exist BEFORE npm ci
COPY prisma.config.ts .
COPY prisma ./prisma

RUN npm ci


# -------------------------------
# Production dependencies
# -------------------------------
FROM node:24-bullseye AS production-dependencies-env

WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma.config.ts .
COPY prisma ./prisma

RUN npm ci --omit=dev


# -------------------------------
# Build stage
# -------------------------------
FROM node:24-bullseye AS build-env

WORKDIR /app

COPY . .
COPY --from=development-dependencies-env /app/node_modules ./node_modules

RUN npm run build


# -------------------------------
# Runtime
# -------------------------------
FROM node:24-bullseye

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY prisma.config.ts .
COPY prisma ./prisma

COPY --from=production-dependencies-env /app/node_modules ./node_modules
COPY --from=build-env /app/build ./build

CMD ["sh", "-c", "npx prisma generate && npx prisma migrate deploy && npm run start"]
