ARG NODE_VERSION=24.12.0-slim
FROM node:${NODE_VERSION} AS builder
WORKDIR /app
# Copy package files first for optimal caching
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./
# Install dependencies with cache mounts for speed
RUN --mount=type=cache,target=/root/.npm \
    --mount=type=cache,target=/usr/local/share/.cache/yarn \
    --mount=type=cache,target=/root/.local/share/pnpm/store \
  if [ -f package-lock.json ]; then \
    npm ci --no-audit --no-fund; \
  elif [ -f yarn.lock ]; then \
    corepack enable yarn && yarn install --frozen-lockfile --production=false; \
  elif [ -f pnpm-lock.yaml ]; then \
    corepack enable pnpm && pnpm install --frozen-lockfile; \
  else \
    echo "No lockfile found." && exit 1; \
  fi
COPY . .
# Build with node-server preset for standalone execution
ENV NITRO_PRESET=node-server
# Build with cache mount for .vinxi artifacts
RUN --mount=type=cache,target=/app/.vinxi/cache \
  if [ -f package-lock.json ]; then \
    npm run build; \
  elif [ -f yarn.lock ]; then \
    yarn build; \
  elif [ -f pnpm-lock.yaml ]; then \
    pnpm build; \
  else \
    echo "No lockfile found." && exit 1; \
  fi
# =========================================
# Stage 2: Run the TanStack Start Server
# =========================================
FROM node:${NODE_VERSION} AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Install pnpm for running migrations
RUN npm install -g pnpm

# Copy the built application
COPY --from=builder /app/.output ./

# Copy migration files and drizzle config from builder
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder /app/auth-schema.ts ./auth-schema.ts
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml

# Install drizzle-kit for migrations (dev dependency)
RUN pnpm add -g drizzle-kit

# Copy and set up entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]