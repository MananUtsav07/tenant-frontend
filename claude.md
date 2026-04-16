# Prophives - Tenant Frontend

## Project Overview
Prophives is a premium AI-powered property management platform for global real estate. This is the frontend SPA built with Vite + React 19 + TypeScript.

## Tech Stack
- **Framework**: Vite 7.3.1 + React 19.2.0
- **Routing**: React Router DOM 7.13.1 (lazy-loaded pages)
- **Language**: TypeScript 5.9.3 (strict)
- **Styling**: Tailwind CSS v4.2.1 (via @tailwindcss/vite plugin)
- **Animation**: Framer Motion 12.35.1
- **Icons**: Lucide React 0.577.0
- **Utilities**: clsx, react-markdown, react-select, react-country-flag

## Directory Structure
```
src/
├── app/App.tsx                  # Main router with lazy loading
├── layouts/
│   ├── PublicLayout.tsx         # Marketing site wrapper (Navbar + Footer)
│   ├── AdminLayout.tsx
│   ├── OwnerLayout.tsx
│   ├── TenantLayout.tsx
│   └── DashboardLayout.tsx
├── pages/
│   ├── public/                  # Marketing pages
│   │   ├── LandingPage.tsx      # Homepage / landing
│   │   ├── FeaturesPage.tsx
│   │   ├── HowItWorksPage.tsx
│   │   ├── PricingPage.tsx
│   │   ├── ContactPage.tsx
│   │   ├── BlogPage.tsx
│   │   └── BlogPostPage.tsx
│   ├── docs/                    # Documentation pages
│   ├── auth/                    # Login pages
│   ├── admin/                   # Admin dashboard pages
│   ├── owner/                   # Owner dashboard pages
│   └── tenant/                  # Tenant dashboard pages
├── components/
│   ├── common/                  # Reusable UI primitives
│   │   ├── Button.tsx           # 6 variants (primary, secondary, outline, ghost, whatsapp, telegram)
│   │   ├── HeroSection.tsx      # Full-width hero with optional side panel
│   │   ├── CTASection.tsx       # Call-to-action banner
│   │   ├── FeatureCard.tsx      # Feature card with icon + badge
│   │   ├── FormInput.tsx        # Controlled input with label/error
│   │   ├── PricingCard.tsx
│   │   ├── DashboardCard.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── SectionContainer.tsx # Section wrapper with tones (cream, ivory, gold, panel, navy)
│   │   └── [state components]   # LoadingState, ErrorState, EmptyState
│   ├── public/                  # Nav & footer
│   │   ├── Navbar.tsx           # Sticky header, glass morphism, auth-aware
│   │   └── Footer.tsx
│   ├── admin/
│   └── docs/
├── sections/
│   └── landing/                 # Landing page sections
│       ├── FaqSection.tsx
│       ├── FeatureHighlightsSection.tsx
│       ├── HowItWorksSection.tsx
│       ├── ProductBenefitsSection.tsx
│       └── TestimonialSection.tsx
├── routes/
│   ├── constants.ts             # All route paths (ROUTES object)
│   ├── AdminProtectedRoute.tsx
│   ├── OwnerProtectedRoute.tsx
│   └── TenantProtectedRoute.tsx
├── hooks/
│   ├── useAdminAuth.tsx
│   ├── useOwnerAuth.tsx
│   ├── useTenantAuth.tsx
│   ├── usePageAnalytics.ts
│   └── usePageSeo.ts
├── services/
│   └── api.ts                   # API integration (VITE_API_BASE_URL)
├── styles/
│   ├── marketing.css            # .saas-grid-bg, .glass-card, .premium-border
│   └── index.css                # Global theme (also at src/index.css)
├── utils/
│   ├── motion.ts                # Framer Motion presets (fadeIn, revealUp, revealScale, staggerParent)
│   ├── analytics.ts
│   ├── date.ts
│   └── storage.ts
├── types/
│   └── api.ts                   # TypeScript API types
├── constants/
│   └── countryCurrency.ts
├── index.css                    # CSS custom properties (--ph-* variables), Tailwind base
└── main.tsx                     # Entry point with auth providers
```

## Routing
- **Public**: `/`, `/features`, `/how-it-works`, `/pricing`, `/contact`, `/blog`, `/blog/:slug`, `/docs/*`
- **Auth**: `/login-owner`, `/login-tenant`, `/admin/login`
- **Owner**: `/owner/dashboard`, `/owner/properties`, `/owner/tenants`, `/owner/tickets`, `/owner/notifications`, `/owner/ai-settings`
- **Tenant**: `/tenant/dashboard`, `/tenant/tickets`, `/tenant/support`
- **Admin**: `/admin/dashboard`, `/admin/organizations`, `/admin/owners`, `/admin/tenants`, `/admin/properties`, `/admin/tickets`, `/admin/contact-messages`, `/admin/blog`

## Design System
See `design.md` for the complete design system reference.

### Key CSS Custom Properties (--ph-*)
Defined in `src/index.css`:
- `--ph-bg`: #FEFAEF (warm cream background)
- `--ph-accent`: #FED609 (primary gold)
- `--ph-text`: #1A1A1A (dark text)
- Custom utility classes: `.ph-title`, `.ph-kicker`, `.ph-badge`, `.ph-badge-gold`, `.ph-surface-card`

### Typography
- **Headlines**: Sora (bold, clean)
- **Body**: Manrope (readable, modern)
- **Labels**: DM Sans (compact, clear)

### Color Palette
- Primary Gold: #FED609
- Warm Cream: #FEFAEF
- Soft Ivory: #FFFAE2
- Deep Gold: #FFD70B / #D4A800
- Dark Text: #1A1A1A
- Muted Text: #6B7280
- WhatsApp: #25D366
- Telegram: #0088cc

## Auth System
Three separate auth providers nested in main.tsx:
- AdminAuthProvider → useAdminAuth hook
- OwnerAuthProvider → useOwnerAuth hook
- TenantAuthProvider → useTenantAuth hook

Protected routes redirect to login if not authenticated.

## API
- Base URL from `VITE_API_BASE_URL` env var
- API service in `src/services/api.ts`
- Key endpoints: getPublicOperationsSnapshot, getOwnerSummary, etc.

## Key Patterns
- Lazy loading via `lazyNamedPage` utility for code splitting
- SectionContainer component for consistent section layouts with tone variants
- Motion utilities respect `prefers-reduced-motion` accessibility setting
- Analytics tracking via `usePageAnalytics` hook
- SEO via `usePageSeo` hook (title, description, structured data)

## Branches
- `main` — production
- `staging` — current active branch

## Commands
```bash
npm run dev        # Start dev server
npm run build      # Production build
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

## Deployment
- **Hosting**: AWS Lightsail (`65.2.108.154`) — served by Nginx from `/var/www/prophives`
- **Domain**: `https://prophives.com` + `https://www.prophives.com` (SSL via Let's Encrypt)
- **CI/CD**: GitHub Actions on push to `main` (`.github/workflows/deploy.yml`)
  - `npm ci` → `npm run build` (with `VITE_API_BASE_URL` injected) → SCP `dist/` → Nginx reload
- **Secrets required** in GitHub repo: `LIGHTSAIL_HOST`, `LIGHTSAIL_SSH_KEY`, `VITE_API_BASE_URL`
- **Production API URL**: `https://prophives.com/api` (set as `VITE_API_BASE_URL` GitHub secret)

## Related Backend
Backend at `c:\Users\asus\Desktop\tenant-backend` — Node.js/Express + Prisma ORM, running on same Lightsail instance on port 3001. See its `CLAUDE.md` for full details.

## WhatsApp Integration

### Owner-side configuration
| File | What it does |
|------|-------------|
| `src/pages/owner/OwnerProfilePage.tsx` | Phone input field saves `support_whatsapp` via `patchOwnerMe()` |
| `src/pages/owner/OwnerNotificationsPage.tsx` | Alternative input for WhatsApp number (E.164: +9198XXXXXXX). Help text: owner must send `help` to the Meta test number to verify bot replies |
| `src/pages/owner/OwnerIntegrationsPage.tsx` | Status card: if not configured → "Setup Required" button; if configured but not linked → navigates to `ROUTES.ownerProfile`; if linked → shows green "Connected (number)" |

### Tenant-side
| File | What it does |
|------|-------------|
| `src/pages/tenant/TenantSupportPage.tsx` | Lines 121–198: fetches `getTenantOwnerContact()`, generates `wa.me/{digits}` URL, renders "Chat on WhatsApp" green button |

### API
- `patchOwnerMe({ support_whatsapp })` in `src/services/api.ts` — saves owner's WhatsApp number
- `getTenantOwnerContact(token)` in `src/services/api.ts` — returns `support_whatsapp` for tenant to dial
- Type: `TenantOwnerContact.support_whatsapp: string | null` in `src/types/api.ts`

### Integration status object (from backend)
```ts
whatsapp: {
  configured: boolean        // Backend has Meta credentials set
  provider: string | null    // "meta" | "stub"
  live: boolean              // live vs test mode
  linked: boolean            // Owner has a support_whatsapp set
  linked_number: string | null
}
```

## Telegram Integration

Telegram uses an OAuth-style connect flow (unlike WhatsApp's simple phone number save).

### Integration status object (from backend)
```ts
telegram: {
  configured: boolean        // Backend has bot credentials set
  linked: boolean            // Owner has connected a Telegram chat
  bot_username: string | null
  connect_url: string | null // Owner-specific onboarding URL — open in new tab to link
  linked_chat: {
    chat_id: string
    username: string | null
    first_name: string | null
    last_name: string | null
    linked_at: string
  } | null
}
```

### OwnerIntegrationsPage behaviour
- If `telegram.linked` → show linked chat info
- If not linked but `connect_url` exists → `openTelegramConnect()` opens `connect_url` in new tab (`window.open(..., '_blank', 'noopener,noreferrer')`)

## Auth Pages

### OwnerLoginPage
- Registration form **no longer collects `support_whatsapp`** (removed from form and API payload)
- Left panel shows a rotating testimonial carousel (5 items, auto-advances every 3 s via `setInterval`)

## Shared Components

### `formTheme.ts` — `getProphivesReactSelectStyles`
Accepts an optional `theme: 'light' | 'dark'` parameter (default `'dark'`).
- `'dark'` → existing dark/cream background styles
- `'light'` → white background, `#1A1A1A` text, lighter borders — for use on white card surfaces

## AI Features

All AI features use `POST /api/owner/ai/*` routes (requireOwnerAuth). Backend uses `gpt-4o-mini` via `openai ^6.27.0`. Each feature returns `null` on failure (non-critical — UI hides/disables silently).

### Feature 1 — Urgent Ticket Auto-Flag
**File:** `src/pages/owner/OwnerTicketsPage.tsx`
- `URGENT_KEYWORDS` array + `isUrgent(ticket)` helper — keyword match on subject/message OR `ai_category === 'maintenance'` with `ai_confidence >= 0.85`
- Red `URGENT` pill badge shown next to status badge in both mobile cards and desktop table rows
- `filteredTickets` sorts urgent tickets to the top

### Feature 2 — AI Reply Draft
**File:** `src/pages/owner/OwnerTicketsPage.tsx`
**Backend:** `POST /api/owner/ai/draft-reply` → `src/services/ai/replyDrafter.ts`
- "✦ Draft with AI" button in the Reply modal above `TicketReplyComposer`
- Sends subject, original message, and full thread history to AI
- Pre-fills the reply textarea; shows "AI draft — review before sending" note (disappears on manual edit)

### Feature 3 — Broadcast Message Generator
**File:** `src/pages/owner/OwnerNotificationsPage.tsx`
**Backend:** `POST /api/owner/ai/draft-broadcast` → `src/services/ai/broadcastDrafter.ts`
- "Compose Broadcast" button in the page header
- Modal: **property selector** (All Properties or specific property) → topic input → "Generate with AI" → editable preview → channel pills (WhatsApp / Telegram / Email) → "Copy Message"
- Properties loaded on mount via `api.getOwnerProperties()`; property selection is informational (scopes the copy/send context)

### Feature 4 — WhatsApp & Telegram Message Composer
**File:** `src/pages/owner/OwnerTenantsPage.tsx`
**Backend:** `POST /api/owner/ai/draft-whatsapp` → `src/services/ai/whatsappDrafter.ts`
- **WhatsApp**: green `MessageCircle` button on each tenant row/card (only if `tenant.phone` set)
  - Modal: intent input → "✦ Draft with AI" → editable preview → Copy + `wa.me/{digits}?text=` deep link
- **Telegram**: blue `Send` button on each tenant row/card (only if `tenant.phone` set)
  - Same AI draft flow; deep link opens `https://t.me/+{digits}` (find by phone number)
  - Note shown: "Copy the message first, then paste it after opening"
- Both use the same `draftOwnerWhatsappMessage` API method

### Feature 5 — Lease Renewal Risk Digest
**File:** `src/pages/owner/OwnerDashboardPage.tsx`
**Backend:** `POST /api/owner/ai/lease-digest` → `src/services/ai/leaseDigest.ts`
- Amber-accented card below the 4-stat grid
- Shows live expiring-in-60-days count and overdue count derived from `dashboardTenants`
- "Generate AI Summary" button calls `getOwnerLeaseDigest()` with tenant array
- Tenant data fetched non-blocking in `loadDashboard()` via `api.getOwnerTenants()`

### Auth Pages
#### OwnerLoginPage
- Supports `?next=<path>` query param — after login/register redirects to `next` instead of dashboard
- Used by PricingPage CTA: unauthenticated users go to `/login-owner?next=/owner/billing`

## Related Backend
Backend at `c:\Users\asus\Desktop\tenant-backend` — see its `CLAUDE.md` for full WhatsApp/Telegram server-side details, env vars, and webhook setup checklist.
