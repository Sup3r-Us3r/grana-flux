# ---------------------------------------------------
# STAGE 1: Base (Common dependencies)
# ---------------------------------------------------
FROM node:20-alpine AS base

RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

COPY package*.json ./
COPY src/infrastructure/database/prisma ./src/infrastructure/database/prisma/

# ---------------------------------------------------
# STAGE 2: Dependencies
# ---------------------------------------------------
FROM base AS deps

RUN npm ci

# ---------------------------------------------------
# STAGE 3: Development
# ---------------------------------------------------
FROM base AS development

ENV NODE_ENV=development

EXPOSE 3000

CMD ["/bin/sh", "/app/docker/entrypoint-development.sh"]

# ---------------------------------------------------
# STAGE 4: Build for production
# ---------------------------------------------------
FROM base AS build

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG DATABASE_URL="postgresql://build:build@localhost:5432/build"
RUN npx prisma generate

RUN npm run build

RUN npm prune --production

# ---------------------------------------------------
# STAGE 5: Final image for production
# ---------------------------------------------------
FROM node:20-alpine AS production

WORKDIR /app

RUN apk add --no-cache openssl libc6-compat

ENV NODE_ENV=production

# Non-root user
RUN addgroup -g 1001 -S nodejs && \
  adduser -S nestjs -u 1001

COPY --from=build --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nestjs:nodejs /app/dist ./dist
COPY --from=build --chown=nestjs:nodejs /app/package.json ./package.json
COPY --from=build --chown=nestjs:nodejs /app/prisma.config.ts ./prisma.config.ts
COPY --from=build --chown=nestjs:nodejs /app/src/infrastructure/database/prisma ./src/infrastructure/database/prisma

USER nestjs

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main.js"]
