# Kult Creator — AI Reference

## Project Identity
**CreatorOS** (project: kult-creator) — a dark, premium creator management platform for managing influencer campaigns, tiers, and performance tracking. Target users: brand managers, Picture Coordinators (PICs), admin teams.

---

## Color Palette

### Brand
- Primary: `#6C5CE7` (violet)
- Secondary: `#8B7CF8` (light purple)
- Glow: `rgba(108,92,231,0.25)`

### Dark Backgrounds
| Token | Hex | Use |
|---|---|---|
| `--bg` | `#0D0D10` | Page background |
| `--bg2` | `#111116` | Topbar / sidebar |
| `--bg3` | `#16161C` | Secondary layer |
| `--bg4` | `#1C1C24` | Tertiary layer |
| `--surface` | `#1E1E28` | Card backgrounds (most common) |
| `--surface2` | `#242430` | Alt surface |

### Text
- Primary: `#F0EFF8` / Secondary: `#9896A8` / Tertiary: `#56556A`

### Semantic Colors (backgrounds at 12% opacity)
- Success: `#34D399` / Danger: `#F87171` / Warning: `#FBBF24` / Info: `#60A5FA` / Teal: `#2DD4BF`

### Borders
- Default: `rgba(255,255,255,0.07)` / Hover: `rgba(255,255,255,0.12)`

### Tier Colors (coin-based ranking)
- 🥉 Bronze (0–499): rose gradients `from-rose-700 to-rose-300`
- 🥈 Silver (500–1499): gray gradients `from-gray-500 to-gray-300`
- 🥇 Gold (1500–3999): amber gradients `from-amber-600 to-amber-300`
- 💎 Diamond (4000–7999): blue gradients `from-blue-700 to-blue-300`
- 👑 Platinum (8000+): purple gradients `from-purple-700 to-purple-300`

---

## Typography
- **Primary font**: Inter (aliased as `font-syne`, `font-figtree`)
- **Monospace**: JetBrains Mono (`font-mono`) — data, timestamps, section labels
- **Size scale**: 8px–14px for UI; 22px–32px for headings/metrics
- **Small labels**: `text-[9px] uppercase tracking-[.1em]` in monospace

---

## Component Patterns

### Cards
```
bg-[#1E1E28] border border-white/7 rounded-[14px]
hover:-translate-y-0.5 hover:border-white/12 transition-all
```

### Buttons — Primary
```
bg-violet-600 hover:bg-violet-500 text-white text-[13px] font-semibold px-4 py-[7px] rounded-lg
shadow-[0_0_20px_rgba(108,92,231,.3)] hover:shadow-[0_0_28px_rgba(108,92,231,.4)] hover:-translate-y-px transition-all
```

### Buttons — Secondary
```
bg-white/5 border border-white/7 text-white/50 hover:text-white/80 hover:bg-white/10 rounded-lg transition-all
```

### Form Inputs
```
bg-[#1A1A22] border border-white/[0.07] rounded-lg px-3 py-2.5 text-[13px] text-white placeholder:text-white/20
focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all
```

### Badges
```
inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap
```
Color pairs use ~12% opacity bg + matching text (e.g. `bg-emerald-400/12 text-emerald-400`)

### Modals / Dialogs
- Overlay: `fixed inset-0 z-40 bg-black/60 backdrop-blur-sm`
- Content: `bg-[#111116] border border-white/[0.07] rounded-2xl shadow-2xl`

### Sidebar — Active Nav Item
```
bg-violet-600/15 text-violet-300 font-medium
before: 3px violet left-border accent with glow shadow-[0_0_8px_rgba(108,92,231,.8)]
```

### Search / Input Containers
```
flex items-center gap-2 bg-[#1E1E28] border border-white/7 rounded-lg px-3 py-[7px]
focus-within:border-violet-500/40 focus-within:ring-1 focus-within:ring-violet-500/15
```

---

## Visual Language

- **Grain texture**: SVG fractal noise on `body::before` at ~3.5% opacity
- **Glow effects**: Violet box-shadows on primary actions, sidebar logo, active nav items
- **Micro-animations**: Scale+fade modals (`cubic-bezier(0.16,1,0.3,1)`), `hover:-translate-y-0.5` card lifts, 150–200ms transitions
- **Scrollbars**: 3px thumb, transparent track
- **Border radius scale**: 6px → 8px (buttons/inputs) → 14px (cards) → 22px (modals) → full (avatars)
- **Opacity ladder**: `/5` `/7` `/12` `/15` for subtle layering (never hard fills on dark surfaces)
- **No hard drop shadows**: prefer violet glow or minimal elevation

---

## Layout Dimensions
- Sidebar expanded: 228px / collapsed: 64px
- Topbar height: 58px
- Dashboard grid: `grid-cols-[1fr_300px]`
- Metrics row: `grid-cols-5`

---

## Avatar Color System (7 gradient options for initials)
`v` violet · `b` blue · `g` emerald · `a` amber · `r` rose · `t` teal · `i` purple/indigo

---

## Content & Terminology
- **Task states**: Not Started / In Progress / Under Review / Completed / Overdue
- **Creator status**: Active / Pending to sign / Suspended / Rejected
- **Campaign status**: Planning / Active / Completed
- **Coins**: Performance currency earned per completed task → determines tier

---

## Tech Stack
- React 18 + Vite
- Tailwind CSS v3 (`darkMode: 'class'`)
- Radix UI (dialogs, dropdowns, tooltips)
- Lucide React (icons, ~16px)
- Zustand (state)
- React Hook Form + Zod (forms)

## Key Files
- `tailwind.config.js` — theme config & custom colors
- `src/index.css` — CSS variables & base styles
- `src/lib/tierUtils.js` — tier/coin logic
- `src/lib/data.js` — constants
- `src/components/shared/Avatar.jsx` — avatar color system
- `src/components/shared/Badge.jsx` — badge variants
- `src/components/layout/Sidebar.jsx` — navigation styling
