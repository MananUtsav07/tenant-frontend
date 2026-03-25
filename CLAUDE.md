# Prophives - Tenant Frontend

## Project Overview
Prophives is a premium AI-powered property management platform for Dubai real estate. This is the frontend SPA built with Vite + React 19 + TypeScript.

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
