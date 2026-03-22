# Tenant Frontend

Production-ready SaaS frontend for a property-management platform with a public marketing site plus owner and tenant dashboards.

## Stack
- Vite
- React 19
- TypeScript
- Tailwind CSS v4
- React Router
- Framer Motion
- Lucide React
- React Markdown

## Directory Structure
- `src/app`: app-level route composition.
- `src/layouts`: `PublicLayout`, `DashboardLayout`, `OwnerLayout`, `TenantLayout`, `AdminLayout`.
- `src/components/common`: reusable UI primitives (button, cards, form input, states, sections).
- `src/components/public`: public-site navigation and footer.
- `src/components/admin`: admin list controls and pagination components.
- `src/components/docs`: docs article wrapper.
- `src/sections`: landing-page specific sections.
- `src/pages/public`: marketing pages.
- `src/pages/docs`: documentation pages.
- `src/pages/auth`: owner and tenant login pages.
- `src/pages/admin`: admin dashboard pages.
- `src/pages/owner`: owner dashboard pages.
- `src/pages/tenant`: tenant dashboard pages.
- `src/hooks`: auth hooks and SEO metadata hook.
- `src/services`: API integration layer.
- `src/styles`: marketing-specific CSS effects.
- `src/utils` and `src/types`: shared helpers and API types.

## Routes
Public marketing:
- `/`
- `/features`
- `/how-it-works`
- `/pricing`
- `/contact`
- `/blog`
- `/blog/:slug`
- `/docs`
- `/docs/getting-started`
- `/docs/tenant-login`
- `/docs/owner-dashboard`
- `/docs/support-tickets`

Auth:
- `/login-owner`
- `/login-tenant`
- `/admin/login`
- Legacy redirects: `/owner/login`, `/tenant/login`

Admin dashboard:
- `/admin/dashboard`
- `/admin/organizations`
- `/admin/organizations/:id`
- `/admin/owners`
- `/admin/tenants`
- `/admin/properties`
- `/admin/tickets`
- `/admin/contact-messages`
- `/admin/blog`

Owner dashboard:
- `/owner/dashboard`
- `/owner/properties`
- `/owner/tenants`
- `/owner/tenants/:id`
- `/owner/tickets`
- `/owner/notifications`
- `/owner/ai-settings`

Tenant dashboard:
- `/tenant/dashboard`
- `/tenant/tickets`
- `/tenant/support`

## Environment
Create `.env` from `.env.example`:

```env
VITE_API_BASE_URL=http://localhost:8787
VITE_SITE_URL=http://localhost:5173
```

## Contact Form Integration
The contact page posts to backend:
- `POST /api/public/contact`

Analytics events are sent to:
- `POST /api/public/analytics`

## Setup
```bash
npm install
npm run dev
```

Build:
```bash
npm run build
```

## Deploy to Vercel
This frontend is configured for Vercel SPA routing.

1. Import the `tenant-frontend` repo in Vercel.
2. Framework Preset: `Vite`.
3. Add environment variables:
   - `VITE_API_BASE_URL=https://<your-backend-project>.vercel.app`
   - `VITE_SITE_URL=https://<your-frontend-project>.vercel.app`
4. Deploy.

## Notes
- Owner and tenant sessions remain isolated with separate token storage keys.
- Marketing pages and dashboards are connected through shared navbar/footer links.
- SEO metadata (title + description) is set per public/auth page using `usePageSeo`.
- Reusable SEO wrapper component is available at `src/components/common/SEO.tsx`.
- Shared motion presets live in `src/utils/motion.ts` and are reduced-motion aware.
- Shared dashboard/public UI primitives are in `src/components/common` and were designed to remain backward compatible.
- Page view and conversion tracking helpers are in `src/utils/analytics.ts`.
- Public crawl assets are generated in `public/sitemap.xml` and `public/robots.txt`.
- Theme preference (`light`, `dark`, `system`) is persisted in localStorage and controlled from navbar.
- Tenant sessions are redirected away from public marketing pages to the tenant dashboard.
