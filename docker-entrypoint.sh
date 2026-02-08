#!/bin/sh
set -e

echo "🏃 Running database migrations..."

# Apply migrations to database
pnpm drizzle-kit migrate

echo "✅ Migrations complete!"

# Start the application with WebSocket support
echo "🚀 Starting server with WebSocket support..."
exec node server.mjs
