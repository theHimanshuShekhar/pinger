#!/bin/sh
set -e

echo "🏃 Running database migrations..."

# Run migrations
pnpm drizzle-kit migrate

echo "✅ Migrations complete!"

# Start the application
exec node server/index.mjs
