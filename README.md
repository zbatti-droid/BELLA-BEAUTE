# BELLA BEAUTÉ

A premium bilingual-ready foundation for a women’s beauty salon and fashion boutique in Ait Melloul, Morocco.

## Run locally

```bash
npm install
npm run dev
```

The Vite frontend runs on `http://localhost:5173`. The Express API runs separately with `npm run server` on port `4000`; `npm run dev:all` starts both.

## Architecture

- `src/App.tsx`: conversion-focused single-page experience with responsive sections, booking modal, WhatsApp bridge and cart interaction.
- `src/data/content.ts`: content and catalog data, ready to replace with API responses.
- `server/index.ts`: validation-first booking/order API boundary using Zod.
- `prisma/schema.prisma`: PostgreSQL domain model for services, products, appointments, customers and orders.
- `public/robots.txt`, `public/sitemap.xml`: technical SEO baseline.

## Production next steps

1. Add Prisma client/repository adapters and migrations.
2. Protect admin routes with short-lived sessions, RBAC and rate limiting.
3. Store images in an image CDN (WebP/AVIF derivatives, responsive sizes, signed uploads).
4. Set `N8N_*_WEBHOOK_URL` and forward accepted booking/order events to n8n.
5. Deploy frontend to Vercel, API to Render/VPS and PostgreSQL to a managed provider.
6. Replace demo Unsplash media with licensed brand photography.

## n8n workflow contract

### Booking
`POST /api/bookings` → n8n Webhook → normalize/AI assistant → calendar availability → PostgreSQL → WhatsApp confirmation → admin notification.

### Order
`POST /api/orders` → n8n Webhook → stock check → order persistence → customer WhatsApp → admin alert → CRM tag.

### Marketing
Customer consented events → n8n schedule → segment by service/category → approve campaign → WhatsApp/email provider.

Do not send marketing messages without explicit opt-in. Keep health and payment data out of the AI prompt.
