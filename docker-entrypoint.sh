#!/bin/sh
set -e

echo "🏃 Running database migrations..."

# Generate migrations if needed (optional - only if you want to auto-generate)
# pnpm drizzle-kit generate

# Apply migrations to database
pnpm drizzle-kit migrate

echo "✅ Migrations complete!"

# Start the application
exec node .output/server/index.mjs
