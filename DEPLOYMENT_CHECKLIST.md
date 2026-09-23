# Deployment Checklist

## Before deployment

- [ ] Generate Prisma Client and run reviewed migrations against managed PostgreSQL.
- [ ] Seed only non-sensitive demo data; create the first admin through a secure bootstrap flow.
- [ ] Configure `DATABASE_URL`, `JWT_SECRET`, frontend origin and n8n URLs in the host secret manager.
- [ ] Configure `AUTH_SECRET`, `ADMIN_EMAIL` and a strong `ADMIN_PASSWORD`; production now fails closed when these are missing.
- [ ] Implement authentication, RBAC and protected admin routes.
- [ ] Add production start/health/readiness checks and structured logs.
- [ ] Add Docker or Render/Vercel configuration and CI build/test checks.
- [ ] Replace demo media with optimized owned assets and CDN upload.
- [ ] Run unit, API, integration and E2E tests.
- [ ] Run Lighthouse mobile/desktop and validate sitemap/schema.
- [ ] Configure HTTPS, backups, database migrations and rollback procedure.

## Current status

`npm run build` passes locally, but the application is **not deployment-ready** because the database, auth, tests and deployment pipeline are not verified.

Local verification command: `npm run verify` (dependency audit + Vitest + production frontend build).
