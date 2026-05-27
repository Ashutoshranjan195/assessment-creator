FROM node:22-slim AS base
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates fonts-liberation libasound2 libatk-bridge2.0-0 libatk1.0-0 \
    libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgbm1 libgcc1 \
    libglib2.0-0 libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 libpangocairo-1.0-0 \
    libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 \
    libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 lsb-release \
  wget xdg-utils chromium \
  && rm -rf /var/lib/apt/lists/* \
  && corepack enable
WORKDIR /repo

FROM base AS deps
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./
COPY packages/shared/package.json packages/shared/
COPY apps/worker/package.json apps/worker/
ENV PUPPETEER_SKIP_DOWNLOAD=false
RUN pnpm install --frozen-lockfile=false

FROM base AS build
COPY --from=deps /repo/node_modules ./node_modules
COPY --from=deps /repo/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=deps /repo/apps/worker/node_modules ./apps/worker/node_modules
COPY tsconfig.base.json ./
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./
COPY packages/shared ./packages/shared
COPY apps/worker ./apps/worker
RUN pnpm install --frozen-lockfile=false
RUN pnpm -w build

FROM base AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /repo/node_modules ./node_modules
COPY --from=build /repo/packages/shared ./packages/shared
COPY --from=build /repo/apps/worker ./apps/worker
CMD ["node", "apps/worker/dist/index.js"]
