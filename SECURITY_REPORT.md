# Security Report

## Verified controls

- ✅ Helmet is enabled.
- ✅ CORS has an explicit frontend origin default.
- ✅ API rate limiting is enabled.
- ✅ Zod validates booking and order payload shapes.
- ✅ Prisma schema is intended to provide parameterized queries.
- ✅ `npm audit` currently reports 0 vulnerabilities.
- ✅ Admin session gate now uses an HttpOnly, SameSite cookie with expiry and a server-side login endpoint.
- ⚠️ Error masking is incomplete; persistence errors are logged server-side but need a structured production logger.

## Findings

| Severity | Finding | Required remediation |
|---|---|---|
| High | Admin currently has a SUPER_ADMIN bootstrap gate only | Add database-backed users, password hashing, role permissions and account recovery |
| Critical | No verified database connection/migration | Run Prisma generate/migrate against PostgreSQL and test restart persistence |
| High | No CSRF/session protection | Use same-site cookies plus CSRF protection for cookie-authenticated mutations |
| High | File uploads are browser FileReader data URLs | Replace with signed Cloudinary/S3 upload; validate MIME, size and dimensions server-side |
| High | Orders do not verify prices or stock server-side | Resolve products/prices from DB in a transaction and prevent negative stock |
| Medium | No request correlation/audit logging | Add structured logger, request ID and ActivityLog writes |
| Medium | CORS default is development localhost | Fail closed in production and allow an explicit origin list |

No evidence of SQL injection was found in the current code path; this is not a substitute for integration tests.
