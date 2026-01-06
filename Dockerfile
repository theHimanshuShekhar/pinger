# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy source code
COPY . .

# Install all dependencies (including dev) with explicit rollup
RUN CI=true pnpm install --frozen-lockfile

# Build the application
RUN CI=true pnpm build

# Runtime stage
FROM node:22-alpine

WORKDIR /app

# Install pnpm in runtime image
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install production dependencies only
RUN CI=true pnpm install --frozen-lockfile --prod

# Copy built application from builder
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/dist ./.output/server
COPY --from=builder /app/dist ./.output/public

EXPOSE 3000

CMD ["pnpm", "start"]