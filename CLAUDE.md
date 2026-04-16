# PTO Planner App — Project Context

## Overview
A personal web app to help users plan and track PTO usage across multiple accrual buckets. Initially personal use with localStorage, designed to eventually be made public.

## Tech Stack
- **React + Vite**
- **Tailwind CSS** (v4)
- **shadcn/ui** (base-nova style, Radix/Base UI primitives + Tailwind, no TypeScript)
- **lucide-react** for icons
- **localStorage** for persistence
- **JSON export/import** for manual backup/restore
- No backend, no auth

## Core Data Models

### PTO Type (Bucket)
- `id` — uuid
- `name` — string
- `accrualRate` — number
- `accrualUnit` — `"hours"` | `"days"`
- `accrualPeriod` — `"weekly"` | `"monthly"` | `"annually"`
- `annualCap` — number | null (optional)
- `startingBalance` — number (as of current month)

### Event
- `id` — uuid
- `name` — string
- `month` — YYYY-MM
- `description` — string (optional)
- `budget` — number | null (optional)
- `withdrawals` — array of `{ ptoTypeId, days }` — always in days; engine converts to hours if bucket uses hours (8 hrs/day)

### Projection (computed, not stored)
- 24-month rolling projection from current month
- Month 0 = starting balance (no accrual)
- Month 1+ = previous closing balance + accrual (capped at annualCap) − withdrawals
- Withdrawals always in days; converted to hours (×8) for hour-based buckets
- `atCap` flag when balance hits annualCap

## Views
1. **Setup** — create/edit/delete PTO buckets (cards with badge pills)
2. **Timeline** — 24-month grid; balance per bucket per month; inline events per month; quick starting-balance editor at top
3. **About** — app description, export/import explainer, Ko-fi link, byline

## Key Design Decisions
- Accrual timing (start/end of period) was removed — has no practical effect at monthly granularity
- Period type (static/rolling) was removed — always uses calendar year for cap
- Withdrawals always in days regardless of bucket unit
- Balance shown = closing balance (opening + accrual − withdrawals) — intentional, shows remaining budget as events are added
- Red = negative balance; Amber + lock icon = at annual cap
- Desktop vs mobile: desktop uses dialogs + medium controls; mobile uses bottom drawers + large controls
- Responsive breakpoint: `sm` = 640px
- Export/Import: desktop header buttons; mobile "More" bottom sheet
- Event description + budget shown inline on desktop only (hidden on mobile)

## Build Phases

| Phase | Scope | Status |
|-------|-------|--------|
| 1 | Scaffold + setup UI + accrual engine | ✅ Done |
| 2 | Timeline view | ✅ Done |
| 3 | Events (merged into timeline) | ✅ Done |
| 4 | Alerts | ❌ Removed — visual cues in timeline are sufficient |
| 5 | JSON export / import for backup | ✅ Done |
| 6 | Polish + public-ready | ✅ Done |

## File Map
- `src/App.jsx` — tab shell (Setup, Timeline, About), export/import, RouletteWord component
- `src/hooks/useStorage.js` — localStorage under key `pto-planner-data`
- `src/engine/accrual.js` — `monthlyAccrual`, `projectBucket`, `projectAll`
- `src/lib/utils.js` — `cn()`, `formatBalance(value, unit)`
- `src/lib/uuid.js` — `generateId()` with `crypto.randomUUID` fallback for older iOS
- `src/components/SetupView.jsx` — PTO bucket list/add/edit/delete
- `src/components/PtoTypeForm.jsx` — bucket form
- `src/components/TimelineView.jsx` — 24-month table + inline events + quick balance editor
- `src/components/EventForm.jsx` — event form (month dropdowns restricted to 24-month window)
- `src/components/PlaneAnimation.jsx` — animated plane/smiley in header (state-driven CSS transitions)
- `src/components/ResponsiveDialog.jsx` — dialog on desktop, bottom drawer on mobile
- `src/components/Tip.jsx` — tooltip helper wrapper
- `src/components/ui/` — shadcn components (button, card, badge, dialog, input, label, select, tooltip, drawer)
- `src/assets/` — plane.svg, ground.svg, smile.svg, bubble.svg (inline SVG sources)
- `public/favicon.svg` — plane icon in primary blue
- `public/manifest.json` — PWA manifest
- `TEST_PLAN.md` — bug bash checklist

## iOS Quirks (already fixed)
- `crypto.randomUUID()` not available on older iOS — use `generateId()` from `src/lib/uuid.js`
- Input zoom: `text-base sm:text-sm` on inputs/selects/textarea (must be ≥16px)
- Dark mode overrides: `color-scheme: light` on `:root`, `-webkit-appearance: none`, autofill box-shadow override
- Save button: use `type="button" onClick={handleSubmit}` instead of `type="submit"`

## Setup Notes
- Always use `--legacy-peer-deps` for npm installs (Vite 8 peer conflict with @tailwindcss/vite)
- `jsconfig.json` required for `@` alias (JS project, no tsconfig)
- `bg-[#ffffff]` arbitrary Tailwind value needed to override cascade ordering in v4
