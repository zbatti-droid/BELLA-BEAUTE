# BELLA BEAUTÉ — Audit Fix Plan

## Current state

The project is a strong premium React/Vite prototype with an Express validation boundary and a Prisma schema. The visual language is preserved as the refactoring baseline.

## Critical gaps

- Admin is exposed through `#admin` and has no authentication or RBAC.
- Products are stored in browser localStorage; API and PostgreSQL are not connected.
- Booking/order endpoints validate and log payloads but do not persist data.
- No Prisma client, migrations, seed, repository or transaction layer.
- n8n variables exist but no webhook dispatch is implemented.
- No automated unit, API, integration or E2E test suite.
- Images are demo Unsplash URLs, not CDN/WebP/AVIF production assets.

## Priority order

1. Establish typed application architecture and route boundaries.
2. Add Prisma client, migrations, seed data and repositories.
3. Add secure authentication, sessions and RBAC; remove hash Admin access.
4. Persist products, inventory, customers, appointments and orders.
5. Connect Admin screens to protected APIs.
6. Add n8n webhook adapters with retries and consent-safe notifications.
7. Add media CDN upload pipeline and responsive image variants.
8. Add SEO routes, accessibility focus management and performance budgets.
9. Add automated tests and deployment configuration.

## Acceptance gates

- `npm run build` succeeds with strict TypeScript.
- `npm run test` covers commerce helpers and API validation.
- Admin cannot render without an authenticated role.
- Booking/order data survives a restart through PostgreSQL.
- Stock updates are transactional and cannot become negative.
- Production environment has no hard-coded secrets or demo media.

## Current implementation boundary

This iteration creates the plan and foundational structure. It also adds the Prisma domain schema, optional Prisma runtime adapter, booking repository, seed script, database scripts and environment template. The API health and booking smoke tests pass; persistence remains disabled until a generated Prisma client and real `DATABASE_URL` are supplied. PostgreSQL credentials, production domain, Cloudinary/S3 account and WhatsApp/n8n credentials are deployment inputs and must be supplied before claiming full production readiness.

The next P0 increment adds a server-side admin session gate with HttpOnly/SameSite cookie login, `/api/auth/me`, logout and a protected admin check. It is a bootstrap gate, not yet database-backed multi-role RBAC.
