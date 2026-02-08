# Base stage with pnpm
FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@latest --activate

# Dependencies stage
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Build stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# Production stage - minimal runtime image
FROM base AS runner
WORKDIR /app

# Install dumb-init and clean up in single layer
RUN apk add --no-cache dumb-init && \
    rm -rf /var/cache/apk/*

# Copy built application
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/server.mjs ./server.mjs
COPY --from=builder /app/package.json ./package.json

# Install production dependencies for custom server (ws package)
RUN npm install --omit=dev --ignore-scripts ws && \
    npm cache clean --force && \
    rm -rf /root/.npm

# Set environment and expose port
ENV NODE_ENV=production
EXPOSE 3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--", "node", "server.mjs"]
