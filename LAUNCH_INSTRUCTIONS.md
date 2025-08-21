Shankarmala Gemstone Store — Launch Instructions

Overview
This document shows production-ready steps to build, migrate, seed, and deploy the Shankarmala Gemstone Store. It also documents how to avoid local Prisma engine issues and a safe CI flow.

Required environment variables (production)
- DATABASE_URL: PostgreSQL connection string (recommended) or file-based SQLite for demos
- NEXTAUTH_URL: https://yourdomain.com
- NEXTAUTH_SECRET: strong random secret
- JWT_SECRET: (optional) if used
- ADMIN_PASSWORD: password for the seeded admin (used with ALLOW_PROD_SEED)
- STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET
- SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
- GOOGLE_ANALYTICS_ID (optional)

Recommended production steps (Vercel/GitHub Actions/Railway)
1. Set all required environment variables in your host (Vercel/Cloud). Do NOT commit secrets.
2. On build server, generate Prisma client suitable for production (no engine) to avoid shipping native engines in the build artifact:

   npx prisma generate --no-engine

3. Run database migrations against production DB:

   npx prisma migrate deploy

4. Seed production data (guarded):

   ADMIN_PASSWORD="<strong-password>" ALLOW_PROD_SEED=1 NODE_ENV=production node prisma/seed.js

   The seed script refuses to run without ALLOW_PROD_SEED=1 in production.

5. Build and start:

   npm run build
   npm start

CI (GitHub Actions) example
- See `.github/workflows/deploy.yml` (optional). Key steps:
  - checkout
  - install deps
  - npx prisma generate --no-engine
  - npx prisma migrate deploy
  - seed (ONLY when running manual production deploy with ALLOW_PROD_SEED=1 and protected secrets)
  - npm run build

Local development notes & debugging Prisma engine failures
- On macOS arm64, Prisma ships a native library under `node_modules/.prisma/client/libquery_engine-darwin-arm64.dylib.node`.
- If Prisma complains `Cannot fetch data from service: fetch failed`, try forcing the library engine:

  PRISMA_CLIENT_ENGINE_TYPE=library \
  PRISMA_FORCE_NAPI=1 \
  PRISMA_QUERY_ENGINE_LIBRARY=$(pwd)/node_modules/.prisma/client/libquery_engine-darwin-arm64.dylib.node \
  node prisma/seed.js

- If you still see errors, ensure `npx prisma generate` completed successfully and `node_modules/.prisma` contains engine files. Re-run `npm ci` or `npm install` and `npx prisma generate`.
- As a fallback, you can seed directly into the SQLite `prisma/dev.db` using the `sqlite3` CLI or a simple node script that uses `better-sqlite3` to insert rows. This avoids Prisma entirely for initial demo data.

Security notes
- Do not store secrets in the repository.
- When seeding production, provide a strong `ADMIN_PASSWORD` and rotate it after initial use.
- For NextAuth, set `NEXTAUTH_SECRET` and `NEXTAUTH_URL` correctly.

If you want, I can add a GitHub Actions workflow and a direct-sqlite fallback seeder script now.
