# Dependency Report

Command executed: `npm audit --json`

Result: **0 info, 0 low, 0 moderate, 0 high, 0 critical** across 262 installed dependency entries.

Notes:

- `latest` ranges are used for several core packages; pin tested versions before production for reproducible builds.
- `prisma` is declared, but Prisma Client generation was not verified in this environment.
- `axios`, `bcryptjs`, `jsonwebtoken`, `react-router-dom` are declared but not all are currently wired into application flows.
- Add `npm run lint`, `npm run test`, and dependency update automation before release.

