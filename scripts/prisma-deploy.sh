#!/usr/bin/env bash
# CI-friendly Prisma deploy script
# Usage: run from project root in CI with DATABASE_URL set
set -euo pipefail

echo "Running prisma migrate deploy"
npx prisma migrate deploy --schema=prisma/schema.prisma

echo "Generating Prisma client (production mode)"
npx prisma generate --no-engine --schema=prisma/schema.prisma

echo "Prisma deploy complete"
