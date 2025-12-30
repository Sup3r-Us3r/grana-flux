#!/bin/sh
set -e

echo "🚀 Starting development environment..."

# Install dependencies
echo "📦 Installing dependencies..."
npm i

# Generate Prisma client (uses fake DATABASE_URL only for this command)
echo "🔧 Generating Prisma client..."
DATABASE_URL="postgresql://build:build@localhost:5432/build" npx prisma generate

# Run database migrations
echo "🗃️ Applying migrations (dev-safe)"
npx prisma migrate deploy

echo "✅ Environment ready!"
echo "🎯 Starting application..."

# Start the application
exec npm run start:dev
