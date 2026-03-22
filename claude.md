# Prophives — Frontend Reference (claude.md)

> **Purpose**: Living reference for any AI agent (Antigravity, Codex, Gemini) working on tenant-frontend. Read this first.

---

## Stack

| Layer       | Tech                                                       |
|-------------|------------------------------------------------------------|
| Build       | Vite 6 + React 19 + TypeScript                            |
| Styling     | Tailwind 4 + CSS custom properties (`--ph-*` tokens)      |
| Fonts       | Sora (headings), Manrope (body) — Google Fonts             |
| Motion      | Framer Motion (with `useMotionEnabled` guard)              |
| Routing     | React Router 6 (lazy named imports)                        |
| API client  | Single `api.ts` module (~80 methods), reads `VITE_API_BASE_URL`, sends Bearer tokens |
| Icons       | lucide-react                                               |

---

## Folder Map

```
src/
├── app/           App.tsx (main router shell)
├── assets/        Static assets
├── components/
│   ├── common/    Button, DataTable, StatusBadge, DashboardCard, EmptyState, ErrorState,...
│   ├── owner/     OwnerNotificationBell
│   ├── automation/
│   ├── maintenance/
│   ├── tickets/   TicketReplyComposer, TicketThreadTimeline
│   ├── properties/
│   └── public/    Navbar, HeroSection, etc.
├── constants/
├── hooks/         useOwnerAuth, useOwnerNotifications, useAdminAuth, usePageAnalytics,...
├── layouts/       DashboardLayout, OwnerLayout, TenantLayout, AdminLayout, PublicLayout
├── pages/
│   ├── owner/     11 pages (Dashboard, Properties, Brokers, Tenants, TenantDetail, Tickets, Maintenance, Notifications, Automation, AutomationActivity, AiSettings)
│   ├── tenant/    3 pages (Dashboard, Tickets, Support)
│   ├── admin/     9 pages
│   ├── auth/      Owner/Tenant/Admin login + password reset
│   ├── public/    Landing, Features, HowItWorks, Pricing, Contact, Blog, BlogPost
│   └── docs/      DocsHome, GettingStarted, TenantLogin, OwnerDashboard, SupportTickets
├── routes/        ProtectedRoute wrappers + ROUTES constants
├── sections/      Marketing page sections
├── services/      api.ts (single REST client)
├── styles/        marketing.css
├── types/         api.ts (all TS types for API responses)
└── utils/         date, analytics, motion helpers
```

---

## Design System — Core Tokens

All defined in `src/index.css`:

| Token                    | Value                         | Usage                     |
|--------------------------|-------------------------------|---------------------------|
| `--ph-bg`                | `#121520`                     | Main bg                   |
| `--ph-bg-deep`           | `#0d1220`                     | Deep bg                   |
| `--ph-bg-navy`           | `#0b1633`                     | Navy bg                   |
| `--ph-surface`           | `rgba(19,24,38,0.94)`        | Card surface              |
| `--ph-surface-elevated`  | `rgba(26,34,56,0.94)`        | Elevated surface          |
| `--ph-text`              | `#eeeff0`                     | Primary text              |
| `--ph-text-muted`        | `#97999e`                     | Muted text                |
| `--ph-text-soft`         | `#b8bcc3`                     | Soft text                 |
| `--ph-border`            | `rgba(83,88,100,0.56)`       | Default border            |
| `--ph-accent`            | `#f0a323`                     | Gold accent               |
| `--ph-accent-strong`     | `#f6b544`                     | Brighter gold             |
| `--ph-danger`            | `#f4a3a3`                     | Error/danger              |
| `--ph-success`           | `#8bd0b5`                     | Success green             |
| `--ph-info`              | `#9fc2ff`                     | Info blue                 |

### Surface Classes (CSS)

- `.ph-surface-card` / `.tf-panel` — standard dark card with border, gradient bg, backdrop-blur, gold radial gradient overlay
- `.ph-surface-card-soft` / `.tf-panel-soft` — lighter version
- `.ph-surface-card-strong` — premium gold-accented card (used for page hero sections)
- `.ph-surface-panel` — inner panel with inset shadow
- `.ph-surface-navy` — navy-toned panel
- `.ph-surface-hero` — hero section background

### Form Classes

- `.ph-form-control` / `.tf-field` — text inputs
- `.ph-form-select` — selects
- `.ph-form-textarea` — textareas
- All have hover, focus, disabled states with gold accent

---

## Layout Architecture

### DashboardLayout (shared sidebar layout)

```
┌─────────────────────────────────────────────┐
│  [Navbar] (public top navbar, optional)     │
├──────────┬──────────────────────────────────┤
│ Sidebar  │  Main Content Area              │
│ 296-316px│  max-w-[1480px], padded          │
│          │  ┌─ headerActions (optional) ─┐  │
│ [Brand]  │  │ "Workspace snapshot" bar   │  │
│ [Nav]    │  └────────────────────────────┘  │
│ [Logout] │  <Outlet /> (page content)      │
├──────────┴──────────────────────────────────┤
```

### Nav Items (Owner)

Dashboard → Properties → Brokers → Tenants → Tickets → Maintenance → Notifications → Automation → AI Settings

---

## Component Patterns

### Button (4 variants)
- `primary` — gold gradient, dark text, used for main CTAs
- `secondary` — dark navy gradient, light text, subtle border
- `outline` — gold-tinted outline, gold text
- `ghost` — transparent, muted text

### DataTable
- Full-width table in a rounded card container
- Uppercase tracked thead, hover rows
- Used by: Properties, Tenants, Dashboard approvals

### StatusBadge
- 30+ status mappings across 5 color families (gold, slate, green, gray, red)
- Pill shape with colored dot

### DashboardCard / SummaryCard
- Used for KPI metrics (Active Residents, Open Tickets, etc.)
- Framer Motion reveal animation + hover lift
- Large number + label + optional hint

### EmptyState
- Centered card with icon, title, description, optional CTA

---

## Route Map (Owner)

| Route                      | Page Component              |
|----------------------------|-----------------------------|
| `/owner/dashboard`         | OwnerDashboardPage          |
| `/owner/properties`        | OwnerPropertiesPage         |
| `/owner/brokers`           | OwnerBrokersPage            |
| `/owner/tenants`           | OwnerTenantsPage            |
| `/owner/tenants/:id`       | OwnerTenantDetailPage       |
| `/owner/tickets`           | OwnerTicketsPage            |
| `/owner/maintenance`       | OwnerMaintenancePage        |
| `/owner/notifications`     | OwnerNotificationsPage      |
| `/owner/automation`        | OwnerAutomationPage         |
| `/owner/automation/activity` | OwnerAutomationActivityPage |
| `/owner/ai-settings`       | OwnerAiSettingsPage         |

---

## API Client Pattern

All calls go through `src/services/api.ts`:
- Single `request<T>(path, options)` helper with Bearer auth
- Error handling extracts structured error from `{ error, details, issues }`
- Pagination via `toQueryString({ page, page_size, search, sort_by, ... })`

### Key Owner Endpoints

| Frontend method                        | Backend route                       |
|----------------------------------------|-------------------------------------|
| `getOwnerSummary`                      | GET `/api/owners/dashboard-summary` |
| `getOwnerProperties`                   | GET `/api/owners/properties`        |
| `getOwnerTenants`                      | GET `/api/owners/tenants`           |
| `getOwnerTickets`                      | GET `/api/owners/tickets`           |
| `getOwnerNotifications`                | GET `/api/owners/notifications`     |
| `getOwnerAutomationSettings`           | GET `/api/owners/automation/settings` |
| `getOwnerAutomationPortfolioVisibility`| GET `/api/owners/automation/portfolio-visibility` |
| `processOwnerReminders`                | POST `/api/owners/process-reminders` |
| `getOwnerRentPaymentApprovals`         | GET `/api/owners/rent-payment-approvals` |

---

## Current UI Clutter Problems (Identified)

1. **Dashboard density** — 6 summary cards + portfolio radar (6 sub-cards) + alerts panel + approvals table all rendered vertically without tabs or progressive disclosure
2. **Heavy surface layering** — Every card has border + gradient bg + backdrop-blur + shadow + inset glow. Creates visual noise when 10+ cards are on screen
3. **Repeated eyebrow labels** — "Owner Command Center" appears in sidebar, header bar, AND page hero section
4. **Oversized border-radius** — `1.4rem` to `1.7rem` on cards makes everything look blobby at scale
5. **No whitespace hierarchy** — Pages jump from hero banner → summary cards → data tables without breathing room
6. **Form panels inline** — Create/edit forms are always visible on CRUD pages (Properties, Tenants, Brokers) instead of being in modals or collapsible sections
7. **Status badges overused** — 30+ status colors create rainbow noise in tables
8. **No progressive disclosure** — Everything loads at once; no tabs, no collapsible sections, no "show more"

---

## Design Direction (Target)

Reference: Base44-style minimalism

- **Clean, airy layouts** with generous whitespace
- **Flat surfaces** — reduce gradient layers and backdrop-blur usage
- **Tighter border-radius** — `0.75rem` to `1rem` instead of `1.4rem+`
- **Quieter borders** — use `1px solid rgba(...)` sparingly, prefer spacing to separate sections
- **Typography hierarchy** — let font weight and size do the work, not card decorations
- **Progressive disclosure** — tabs, collapsible panels, modals for create/edit flows
- **Keep existing color palette** — but use gold accent more sparingly as highlight, not everywhere

---

## Rules for Agents

1. **Never change `--ph-accent`, `--ph-bg`, or the core color palette** — those are brand identity
2. **Always use existing components** (Button, DataTable, StatusBadge, etc.) — don't create new ones without discussing
3. **Test with `npm run dev`** — Vite dev server
4. **API changes go in `api.ts`** only — never call fetch directly from pages
5. **Use the `ph-` / `tf-` CSS class system** for surfaces and forms
6. **Keep Tailwind 4 classes** — no custom CSS unless extending the design system
7. **All owner pages follow the `ph-page-shell` → `ph-page-header` → content pattern**
