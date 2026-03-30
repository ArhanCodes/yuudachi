FROM node:24-alpine AS builder

RUN corepack enable && corepack prepare pnpm@10.24.0 --activate

WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/ packages/
COPY apps/yuudachi/package.json apps/yuudachi/
RUN pnpm install --frozen-lockfile

COPY tsconfig.json ./
COPY packages/ packages/
COPY apps/yuudachi/ apps/yuudachi/

RUN pnpm --filter @yuudachi/framework build
RUN pnpm --filter yuudachi run build:clean && pnpm --filter yuudachi run build:esm && pnpm --filter yuudachi run build:copy-locales

FROM node:24-alpine

RUN corepack enable && corepack prepare pnpm@10.24.0 --activate
RUN apk add --no-cache python3 make g++

WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/ packages/
COPY apps/yuudachi/package.json apps/yuudachi/
RUN pnpm install --frozen-lockfile --prod --ignore-scripts

COPY --from=builder /app/packages/framework/dist/ packages/framework/dist/
COPY --from=builder /app/apps/yuudachi/dist/ apps/yuudachi/dist/
COPY --from=builder /app/apps/yuudachi/locales/ apps/yuudachi/dist/locales/
COPY apps/yuudachi/linkshorteners.json apps/yuudachi/
COPY apps/yuudachi/migrations/ apps/yuudachi/migrations/

WORKDIR /app/apps/yuudachi
CMD ["node", "--enable-source-maps", "dist/index.js"]
