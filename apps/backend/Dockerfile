FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /repo

FROM base AS deps
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./
COPY packages/shared/package.json packages/shared/
COPY apps/backend/package.json apps/backend/
RUN pnpm install --frozen-lockfile=false

FROM base AS build
COPY --from=deps /repo/node_modules ./node_modules
COPY --from=deps /repo/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=deps /repo/apps/backend/node_modules ./apps/backend/node_modules
COPY tsconfig.base.json ./
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./
COPY packages/shared ./packages/shared
COPY apps/backend ./apps/backend
RUN pnpm install --frozen-lockfile=false
RUN pnpm -w build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /repo/node_modules ./node_modules
COPY --from=build /repo/packages/shared ./packages/shared
COPY --from=build /repo/apps/backend ./apps/backend
EXPOSE 4000
CMD ["node", "apps/backend/dist/index.js"]
