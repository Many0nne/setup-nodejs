# syntax=docker/dockerfile:1
ARG NODE_VERSION=24.0.0

# Build stage
FROM node:${NODE_VERSION}-alpine AS build
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
# Generate Prisma client during build to avoid runtime writes
RUN npx prisma generate --config ./prisma.config.ts
# Compile TypeScript
RUN npm run build

# Runtime stage
FROM node:${NODE_VERSION}-alpine AS final
ENV NODE_ENV=production
WORKDIR /usr/src/app

# Copy artifacts
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/prisma ./prisma
COPY --from=build /usr/src/app/prisma.config.ts ./prisma.config.ts
COPY package.json .

# Run as non-root
USER node

EXPOSE 3000

# Apply migrations then start
CMD sh -lc "npx prisma migrate deploy --config ./prisma.config.ts && node dist/server.js"
