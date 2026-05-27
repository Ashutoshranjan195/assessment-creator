FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /repo

FROM base AS deps
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./
COPY packages/shared/package.json packages/shared/
COPY apps/frontend/package.json apps/frontend/
RUN pnpm install --frozen-lockfile=false

FROM base AS build
ARG NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
ARG NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
ENV NEXT_PUBLIC_BACKEND_URL=${NEXT_PUBLIC_BACKEND_URL}
ENV NEXT_PUBLIC_SOCKET_URL=${NEXT_PUBLIC_SOCKET_URL}
COPY --from=deps /repo/node_modules ./node_modules
COPY --from=deps /repo/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=deps /repo/apps/frontend/node_modules ./apps/frontend/node_modules
COPY tsconfig.base.json ./
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./
COPY packages/shared ./packages/shared
COPY apps/frontend ./apps/frontend
RUN pnpm install --frozen-lockfile=false
RUN pnpm -w build

FROM base AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=build /repo/package.json ./
COPY --from=build /repo/pnpm-lock.yaml* ./
COPY --from=build /repo/pnpm-workspace.yaml ./
COPY --from=build /repo/node_modules ./node_modules
COPY --from=build /repo/packages/shared ./packages/shared
COPY --from=build /repo/apps/frontend ./apps/frontend
EXPOSE 3000
CMD ["pnpm", "--filter", "@vedaai/frontend", "start"]
