# -------------------------------
# Development dependencies
# -------------------------------
FROM node:24-alpine AS development-dependencies-env

WORKDIR /app

# Copy only what npm install needs
COPY package.json package-lock.json ./

# Prisma schema must exist BEFORE npm ci
COPY prisma ./prisma

RUN npm ci


# -------------------------------
# Production dependencies
# -------------------------------
FROM node:24-alpine AS production-dependencies-env

WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma

RUN npm ci --omit=dev


# -------------------------------
# Build stage
# -------------------------------
FROM node:24-alpine AS build-env

WORKDIR /app

COPY . .
COPY --from=development-dependencies-env /app/node_modules ./node_modules

RUN npm run build


# -------------------------------
# Runtime
# -------------------------------
FROM node:24-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY --from=production-dependencies-env /app/node_modules ./node_modules
COPY --from=build-env /app/build ./build

CMD ["npm", "run", "start"]
