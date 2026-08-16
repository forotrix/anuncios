# syntax=docker/dockerfile:1
#
# Build from the repo root:
#   docker build -f apps/api/Dockerfile -t anuncios-api .
#
# This is a pnpm workspace, so @anuncios/api depends on @anuncios/shared via
# "workspace:*". Each stage copies only the package.json files pnpm needs to
# resolve the workspace graph against pnpm-lock.yaml, not the full source of
# every app, to keep the build context and final image small.

FROM node:24-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
WORKDIR /app

# ---- deps: resolve the pnpm workspace, install only what @anuncios/api needs ----
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY apps/desktop-web/package.json apps/desktop-web/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN pnpm install --frozen-lockfile --filter @anuncios/api...

# ---- build: compile @anuncios/shared then @anuncios/api ----
FROM deps AS build
COPY packages/tsconfig ./packages/tsconfig
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api
RUN pnpm --filter @anuncios/shared build
RUN pnpm --filter @anuncios/api build

# ---- runner: minimal image, production deps only ----
FROM base AS runner
RUN addgroup -S nodejs && adduser -S nodejs -G nodejs
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY apps/desktop-web/package.json apps/desktop-web/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN pnpm install --frozen-lockfile --prod --filter @anuncios/api...
COPY --from=build /app/packages/shared/dist packages/shared/dist
COPY --from=build /app/apps/api/dist apps/api/dist

ENV NODE_ENV=production
EXPOSE 8080
USER nodejs
WORKDIR /app/apps/api
CMD ["node", "dist/server.js"]
