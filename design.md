# Prophives Design System

## Brand Identity
Prophives is a premium AI-powered property management platform for Dubai real estate. The design should feel **minimalistic, interactive, eye-catching, and eye-pleasing**.

## Color Palette

### Primary Colors
| Token | Hex | Usage |
|-------|-----|-------|
| Primary Gold | `#FED609` | CTAs, primary buttons, highlights, active states, icon backgrounds |
| Primary Hover | `#FFD70B` | Hover states, accent borders, secondary actions |
| Deep Gold | `#D4A800` | Premium text accents, gold text highlights |
| Bronze | `#92700A` | Kicker text, subtle gold labels |

### Background Colors
| Token | Hex | Usage |
|-------|-----|-------|
| Warm Cream | `#FEFAEF` | Page backgrounds, card inner backgrounds |
| Soft Ivory | `#FFFAE2` | Secondary section backgrounds, feature highlights |
| White | `#FFFFFF` | Card surfaces, modals, feature section backgrounds |

### Text Colors
| Token | Hex | Usage |
|-------|-----|-------|
| Dark Text | `#1A1A1A` | Primary text, headings |
| Muted Text | `#6B7280` | Secondary/description text |
| Soft Text | `#4B5563` | Tertiary text, list items |

### Accent Colors
| Token | Hex | Usage |
|-------|-----|-------|
| Danger | `#EF4444` | Error states, destructive actions |
| Success | `#10B981` | Success states, positive indicators |
| Info | `#3B82F6` | Informational badges |
| WhatsApp | `#25D366` | WhatsApp integration buttons/icons |
| Telegram | `#0088cc` | Telegram integration buttons/icons |

### Border & Shadow
| Token | Value | Usage |
|-------|-------|-------|
| Subtle Border | `rgba(0, 0, 0, 0.08)` | Card borders, dividers |
| Gold Border | `#FED609/10` or `#FED609/30` | Hover borders, accent borders |
| Card Shadow | `shadow-sm` to `shadow-xl` | Elevation hierarchy |
| Gold Glow | `shadow-[#FED609]/20` | Active/focus states on gold elements |

## Typography

### Font Families
| Role | Font | Weight Range | Usage |
|------|------|-------------|-------|
| Headlines | **Sora** | 600-800 | Page titles, section headings, hero text |
| Body | **Manrope** | 400-600 | Paragraphs, descriptions, general content |
| Labels | **DM Sans** | 400-700 | Buttons, badges, navigation, form labels |

### Type Scale
| Element | Size | Weight | Font |
|---------|------|--------|------|
| Hero H1 | `text-5xl` to `text-7xl` | `font-extrabold` | Sora |
| Section H2 | `text-3xl` to `text-4xl` | `font-bold` | Sora |
| Card H3/H4 | `text-xl` | `font-bold` | Sora |
| Body Large | `text-lg` to `text-xl` | `font-normal` | Manrope |
| Body | `text-base` | `font-normal` | Manrope |
| Small/Labels | `text-sm` | `font-medium` | DM Sans |
| Kicker | `text-xs` | `font-bold uppercase tracking-widest` | DM Sans |

### Custom CSS Classes
- `.ph-title` — Sora font with tight letter-spacing for headings
- `.ph-kicker` — Uppercase gold kicker label (bronze text, gold dot)
- `.ph-badge` — Small pill badge
- `.ph-badge-gold` — Gold-tinted badge variant

## Layout & Spacing

### Container Widths
| Size | Max Width | Usage |
|------|-----------|-------|
| Narrow | `max-w-[1120px]` | Focused content (FAQ, forms) |
| Default | `max-w-[1280px]` | Standard pages |
| Wide | `max-w-[1400px]` | Landing page sections |
| Full-width card | `max-w-5xl` | Floating stats card |
| Content | `max-w-7xl` | Hero, features, how-it-works |

### Section Padding
- Standard sections: `py-24 px-4 sm:px-6 lg:px-10`
- Hero section: `pt-28 pb-20` (accounts for fixed navbar)
- CTA section: `py-20 px-4 sm:px-6 lg:px-10`

### Section Backgrounds (Tones)
| Tone | Background | Usage |
|------|-----------|-------|
| `cream` | `#FEFAEF` | Hero, FAQ sections |
| `ivory` | `#FFFAE2` | How-it-works, secondary sections |
| `panel` / white | `#FFFFFF` | Features, content sections |
| `gold` | `#FED609` | CTA banners |
| `navy` | `#1A1A1A` | Footer, dark sections |

## Component Patterns

### Buttons
- **Primary**: `bg-[#FED609] text-[#1A1A1A] rounded-xl px-8 py-4 font-bold shadow-lg hover:bg-[#FFD70B] hover:shadow-xl active:scale-95`
- **Outline**: `border-2 border-[#FED609] text-[#1A1A1A] rounded-xl px-8 py-4 font-bold hover:bg-[#FED609]/5 active:scale-95`
- **Ghost**: Text-only with gold hover
- **CTA on Gold**: `bg-white text-[#1A1A1A] rounded-xl px-10 py-5 font-bold shadow-xl hover:shadow-2xl`
- **Nav Login**: `border border-[#FED609] rounded-lg px-5 py-2 text-sm font-bold hover:bg-[#FED609]/5`

### Cards
- **Feature Card**: `rounded-2xl bg-[#FEFAEF] p-8 border border-transparent hover:border-[#FED609] transition-all`
  - Icon box: `h-14 w-14 bg-[#FED609] rounded-xl flex items-center justify-center group-hover:scale-110`
- **Stats Card (Floating)**: `rounded-2xl bg-white p-8 md:p-12 shadow-xl border border-[#FED609]/10`
  - Overlaps hero with `-mt-16` and `z-20`
- **FAQ Accordion**: `rounded-xl border border-[rgba(0,0,0,0.06)] bg-white p-5 shadow-sm`
  - Chevron in gold circle: `bg-[rgba(254,214,9,0.12)] text-[#92700A]`

### How-It-Works Steps
- Numbered circle: `h-16 w-16 bg-[#FED609] rounded-full font-black text-2xl shadow-lg shadow-[#FED609]/20`
- Connector line: `border-t-2 border-dashed border-[#FED609]/40` (hidden on mobile)
- Layout: centered text, 3 columns on desktop

### Navigation
- Fixed top: `fixed top-0 z-50 bg-[#FEFAEF] border-b border-[#FED609]/10 shadow-sm`
- Glass morphism on scroll
- Logo: `text-2xl font-bold font-headline tracking-tight`
- Nav links: `text-sm font-label` with gold active state and bottom border

### CTA Banner
- Full-width gold: `rounded-3xl bg-[#FED609] p-12 md:p-20 text-center overflow-hidden`
- Decorative blur elements: `bg-white/20 rounded-full blur-3xl` positioned absolutely
- Large heading + description + white CTA button

### Hero Section
- Gradient background: `bg-gradient-to-br from-[#FFFAE2] to-[#FEFAEF]`
- Two-column grid: text left, decorative image right
- Image container: `rounded-3xl border-8 border-white shadow-2xl overflow-hidden`
- Abstract decorations: gold blur circles, geometric grid shapes at low opacity

## Animation & Motion

### Framework
Framer Motion with accessibility-first approach (respects `prefers-reduced-motion`).

### Presets (from `utils/motion.ts`)
| Preset | Effect |
|--------|--------|
| `fadeIn` | Opacity 0→1 |
| `revealUp` | Opacity 0→1 + translateY 24px→0 |
| `revealScale` | Opacity 0→1 + scale 0.95→1 |
| `staggerParent` | Container that staggers children |

### Usage Patterns
- Section headings: `revealUp` with `whileInView` + `viewportOnce`
- Card grids: `staggerParent` on container, `revealUp` on each card
- Hover effects: `group-hover:scale-110` on icons, `hover:border-[#FED609]` on cards
- Buttons: `active:scale-95` for press feedback
- Floating card: subtle `y: [0, -6, 0]` infinite animation (optional)

## Design Principles

1. **Minimalistic** — Clean layouts with generous whitespace, reduced content density
2. **Interactive** — Micro-animations, hover effects, smooth transitions
3. **Consistent** — Same visual language across all pages (public, dashboards, forms, modals)
4. **Card-based** — Cards with subtle shadows and rounded corners for content grouping
5. **Gold-accented** — #FED609 as the signature accent throughout, never overwhelming
6. **Accessible** — All animations respect reduced-motion preferences, sufficient color contrast

## Integrations to Feature Visually
- WhatsApp messaging (green `#25D366` icon/buttons)
- Telegram bot (blue `#0088cc` icon/buttons)
- AI-powered automation (Sparkles icon with gold accent)

## Image Assets
- Hero image: Modern luxury Dubai high-rise with glass facade and warm golden sunset
- Use high-quality property/real estate imagery that matches the warm gold color scheme
- Stitch-provided hero image URL: `https://lh3.googleusercontent.com/aida-public/AB6AXuDwGYvpeM85pwKFXm97S1TAATDSM4__Trygy2ql_yytBQ3PtwsoBr96--gxmJ1tNMfkJalxYzSIoxOG5TitKAI8TkAmCuh-HgVJ38g6tv4XlGNyPXwcGHVh7RvK5Ks-VxmOaevdxY3ls6cvgFdCLs-OYhCJoy5zWvuNQy-FHxiWD6PdkJIyIzAwaSdi3fyEPPzolc5u8TXThfIcwgElPPs8urnbO34Aq7_k4t9aCRyv_klF-0EOqdCSCXpXavAV4-aCl0F__5tH7H6N`
