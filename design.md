# Design System Specifications — Kolkata Air Quality Predictor

This document is the single source of truth for the visual design of the **Kolkata Air Quality Predictor** (see `PROJECT_SPEC.md` for functionality). It evolves the original Sky Blue, Apple-inspired portfolio system into a **data-dashboard / infographic** system. Everything in the original (palette, typography, pill buttons, rounded cards, glass header, soft motion) is kept; sections marked **NEW** or **CHANGED** are additions for this project.

> **Agent rule:** never hardcode colours, radii, shadows, or spacing in components. Use the CSS variables defined in Section 14 (`tokens.css`). If you need a value that does not exist, add a token there first.

---

## 1. Core Aesthetic Principles
- **Style**: Apple-inspired, minimalist, modern, highly legible. Data is the hero; chrome stays quiet.
- **Vibe**: Clean, breathable, calm, trustworthy. Air-quality is a sensitive topic: **never alarmist** (no flashing, no sirens, no all-red screens).
- **Key characteristics**: generous whitespace, high-contrast typography, rounded corners, subtle glassmorphism on the header only, fully fluid responsiveness.
- **Visual depth**: flat backgrounds + soft-shadowed cards that lift on hover. Charts sit **inside** cards, never directly on the page background.
- **Story-first (NEW)**: every chart has a plain-English **takeaway title** ("Winter air is about 3× dirtier than monsoon air") and a small caption. Numbers are large, labels are small and muted.
- **Colour discipline (NEW)**: Sky Blue = brand/UI/interaction. The **AQI palette** (Section 3) is reserved **only** for air-quality categories. Do not use AQI colours for buttons, links, or decoration.

---

## 2. Color Palette (Sky Blue Theme) — unchanged core

CSS variables handle light and dark modes. No hardcoded hex outside `:root` and `[data-theme="dark"]`.

### Light Mode (`:root`)
- **Background Primary** `--bg-primary`: `#F8FAFC`
- **Background Secondary** `--bg-secondary`: `#FFFFFF` (cards, header)
- **Background Tertiary (NEW)** `--bg-tertiary`: `#F1F5F9` (table zebra rows, chart wells, skeletons)
- **Text Primary** `--text-primary`: `#0F172A`
- **Text Secondary** `--text-secondary`: `#475569`
- **Text Muted (NEW)** `--text-muted`: `#64748B` (captions, axis labels; meets AA on white at ≥ 14px)
- **Accent** `--accent`: `#0EA5E9`
- **Accent Hover** `--accent-hover`: `#0284C7`
- **Accent Light** `--accent-light`: `rgba(14, 165, 233, 0.1)`
- **Border Color** `--border-color`: `#E2E8F0`

### Dark Mode (`[data-theme="dark"]`)
- `--bg-primary`: `#0F172A`
- `--bg-secondary`: `#1E293B`
- `--bg-tertiary`: `#172033`
- `--text-primary`: `#F8FAFC`
- `--text-secondary`: `#94A3B8`
- `--text-muted`: `#7C8CA3`
- `--accent`: `#38BDF8`
- `--accent-hover`: `#7DD3FC`
- `--accent-light`: `rgba(56, 189, 248, 0.15)`
- `--border-color`: `#334155`

### Theme behaviour (CHANGED)
- Default to the user's OS setting (`prefers-color-scheme`); the header toggle overrides and persists the choice **in memory only for the session** (no `localStorage` requirement; if persistence is wanted, wrap it in try/catch).
- Theme switch transition: `0.3s ease` on `background-color`, `color`, `border-color`.

---

## 3. Data-Visualization Colors (NEW)

### 3.1 AQI category palette (Indian CPCB scale)
Used for the gauge, calendar heatmap, badges, stacked bars, and confusion matrix. Same hues in light and dark mode so a colour always means the same category; only the *on-colour text* tokens differ if needed.

| Category | PM₂.₅ (µg/m³) | AQI | Token | Fill | Text on fill |
|---|---|---|---|---|---|
| Good | 0–30 | 0–50 | `--aqi-good` | `#16A34A` | `#FFFFFF` |
| Satisfactory | 31–60 | 51–100 | `--aqi-satisfactory` | `#84CC16` | `#0F172A` |
| Moderately polluted | 61–90 | 101–200 | `--aqi-moderate` | `#FACC15` | `#0F172A` |
| Poor | 91–120 | 201–300 | `--aqi-poor` | `#F97316` | `#0F172A` |
| Very poor | 121–250 | 301–400 | `--aqi-verypoor` | `#DC2626` | `#FFFFFF` |
| Severe | 250+ | 401–500 | `--aqi-severe` | `#7F1D1D` | `#FFFFFF` |

Rules:
- These hues approximate the official CPCB green→dark-red progression but are tuned for contrast on both themes; keep the **order** and **category names** exact.
- Never rely on colour alone: every AQI colour use must be accompanied by a **text label or icon/shape** (colour-blind safety). In the calendar heatmap, the category appears in the tooltip and the "View data" table.
- Badge background = fill, badge text = "Text on fill" token.
- Subtle variant for large areas: `color-mix(in srgb, var(--aqi-x) 18%, var(--bg-secondary))`.

### 3.2 Chart series palette (non-AQI)
For general series (actual vs predicted, models, seasons). Sky-blue-led, 6 distinguishable hues, all AA-visible on both backgrounds:
- `--chart-1`: `var(--accent)` (primary series, e.g. *Actual*)
- `--chart-2`: `#6366F1` (indigo; e.g. *Predicted*)
- `--chart-3`: `#14B8A6` (teal)
- `--chart-4`: `#F59E0B` (amber)
- `--chart-5`: `#EC4899` (pink)
- `--chart-6`: `#64748B` (slate; baselines/neutral)
- Reference lines (CPCB standard 60 µg/m³, WHO guideline): dashed `1.5px`, colour `--text-muted`, label in `--text-muted` at `0.75rem`.
- Confidence/prediction bands: series colour at `0.15` opacity, no stroke.
- Gridlines: `--border-color` at `1px`, horizontal only; no chart borders; axes text `--text-muted` `0.75rem`.

### 3.3 Season colours (NEW, for season chips and box plots)
- Winter `--season-winter`: `#38BDF8`; Pre-monsoon `--season-pre`: `#F59E0B`; Monsoon `--season-monsoon`: `#14B8A6`; Post-monsoon `--season-post`: `#A78BFA`.

### 3.4 Diverging scale (correlation heatmap)
Negative `#6366F1` → neutral `var(--bg-tertiary)` → positive `#F97316`, generated with `color-mix`. Show numeric `r` in each cell (contrast-checked: choose text colour by luminance).

### 3.5 Semantic status colours (NEW, for diagnostics chips)
- `--ok`: `#16A34A`, `--warn`: `#F59E0B`, `--bad`: `#DC2626`; always paired with an icon (✔ / ⚠ / ✖) and a text label.

---

## 4. Typography
Native OS stack (Apple look, instant load):
- **Font family**: `-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif;` (system fallbacks cover Windows/Android, including Indian devices).
- **Body**: `1rem`, line-height `1.6`, weight `400`.
- **Headings**: weight `700`/`800`, tracking `-0.02em` to `-0.04em`.
  - Section titles: `2.25rem` with a centred `4px` tall sky-blue underline accent (`60px` wide).
  - Hero title: `4rem` desktop → `2.5rem` mobile.
- **NEW — data typography:**
  - **Big number** (StatCard values, gauge centre): `2.5rem`–`3.5rem`, weight `800`, tracking `-0.04em`, `font-variant-numeric: tabular-nums`.
  - **Unit** next to a number: `1rem`, weight `500`, `--text-muted`.
  - **Chart title (takeaway)**: `1.25rem`, weight `700`, `--text-primary`.
  - **Caption / axis / tooltip meta**: `0.8125rem`, `--text-muted`.
  - **Eyebrow label** (small caps above a card title): `0.75rem`, weight `700`, uppercase, tracking `0.08em`, `--accent`.
  - **Math**: render equations with KaTeX at `1.1em`; wrap in a horizontally scrollable container on small screens (`overflow-x: auto`) so the page never scrolls sideways.
- All numerals in tables, charts, tooltips use `tabular-nums`.

---

## 5. UI Elements & Components

### 5.1 Buttons (unchanged)
- **Shape**: pill, `border-radius: 9999px`; padding `0.875rem 1.75rem`.
- **Primary**: solid `--accent`, white text, `box-shadow: 0 4px 14px 0 rgba(14, 165, 233, 0.39)`.
- **Secondary**: `--bg-secondary`, `--text-primary`, `1px` solid `--border-color`, no shadow.
- **Hover**: `translateY(-2px)`, intensified shadow on primary; **Active**: `translateY(0)`; **Focus-visible**: `outline: 3px solid color-mix(in srgb, var(--accent) 50%, transparent); outline-offset: 2px;`.
- **Small variant (NEW)**: padding `0.5rem 1rem`, font `0.875rem` (used in chart toolbars).

### 5.2 Cards (unchanged base)
- Radius `1.5rem`, padding `2rem`–`2.5rem` (`1.25rem`–`1.5rem` on mobile), `1px solid var(--border-color)`, background `--bg-secondary`.
- **Chart Card (NEW)**: Eyebrow → takeaway title → optional one-line subtitle → chart area (min-height `260px`, `320px` for hero charts) → caption row (source + "View data" disclosure link). Internal gap `1rem`.
- **Stat Card (NEW)**: Eyebrow label, big number + unit, delta/caption line (e.g. "▲ 12 % vs last year" using `--ok`/`--bad` only when meaningful), optional 40px-high sparkline in `--chart-1`. Compact padding `1.5rem`.
- **Insight Card (NEW)**: left `4px` colour stripe (severity: `alert` → `--aqi-poor`, `info` → `--accent`, `good` → `--aqi-good`), icon in a `40px` circle with `--accent-light`, title (`1.0625rem`, 700), one sentence of body (`--text-secondary`), a mini visual (sparkline/mini-bar) on the right at ≥ 640px or below the text on mobile. Whole card is not a link unless it has a `chart_ref` (then it scrolls/jumps to the chart).
- Hover on interactive cards only: `translateY(-5px)` to `-8px` + hover shadow. Static chart cards do **not** lift (avoids distracting motion while reading charts); they get a `border-color` tint to `--accent` at 30 % on hover.

### 5.3 Header / Navbar (unchanged, extended)
- Height `70px`, fixed top, `backdrop-filter: blur(12px)`, background `color-mix(in srgb, var(--bg-secondary) 80%, transparent)`, `1px` bottom border.
- Layout: Logo left (text logo "Kolkata**AQ**" with the "AQ" in `--accent`), nav centre, theme toggle right.
- **Active nav item (NEW)**: accent-coloured text with a `2px` underline pill; inactive `--text-secondary`.
- **Mobile (< 768px)**: nav collapses behind a menu button into a full-width glass sheet sliding down `0.25s ease`; items are `48px` tall touch targets.
- Reserve `padding-top: 70px` on `main` so content never hides under the header.

### 5.4 Tabs & Segmented control (NEW)
- Container: pill, `--bg-tertiary` background, `1px` `--border-color`, padding `4px`.
- Item: pill, padding `0.5rem 1rem`, `--text-secondary`; selected: `--bg-secondary`, `--text-primary`, small shadow; transition `0.2s ease`.
- Use for: split toggle (Time-based / Random), year selector, chart modes, residual tabs.
- Keyboard: arrow keys move selection; `role="tablist"`/`tab`/`tabpanel` semantics; scrollable horizontally on mobile with hidden scrollbar.

### 5.5 AQI Badge (NEW)
Pill, `0.25rem 0.75rem`, font `0.8125rem` weight `700`, background = category fill, text = "text on fill", with a leading `8px` dot or a category glyph. Always shows the **category name** (and AQI number when space allows).

### 5.6 AQI Gauge (NEW)
- Semicircle (180°) gauge, six arcs in AQI order, arc thickness `18px` (desktop) / `14px` (mobile), `4px` gaps between arcs, round caps.
- Needle: a `12px` circle in `--text-primary` with `3px` stroke ring in `--bg-secondary`, positioned by AQI (0–500; scaled piecewise so each category occupies an equal arc, i.e. map by category then interpolate within it).
- Centre: big number (AQI), category badge below, date caption below that ("Latest data: 12 Mar 2023").
- Animate needle `0.8s cubic-bezier(.2,.8,.2,1)` on mount; disabled under reduced motion.

### 5.7 Calendar Heatmap (NEW) — hero visual
- Grid of rounded squares (`radius: 3px`), `12px` cells with `3px` gap on desktop, `9px`/`2px` on mobile; weeks as columns (Mon-start), month labels on top, weekday labels (Mon/Wed/Fri) left.
- Cell fill = AQI category colour; missing day = `--bg-tertiary` with a diagonal hatch pattern (so "no data" ≠ "good").
- Container scrolls horizontally inside the card on mobile (`overflow-x: auto`), starting at the latest month.
- Hover/focus: `2px` outline `--text-primary`; tooltip (5.9). Cells are focusable via arrow keys.
- Legend below: six swatches with category names + "No data".

### 5.8 Tables (NEW)
- Used for "View data" disclosures, VIF, metrics. No heavy borders: header row `--bg-tertiary`, weight `700`, `0.8125rem` uppercase muted; row divider `1px --border-color`; zebra optional; numeric columns right-aligned, `tabular-nums`. Wrap in `overflow-x: auto`. Sticky first column on narrow screens.
- Status cells use chips (3.5).

### 5.9 Tooltips (NEW)
- Chart tooltip: `--bg-secondary`, `1px --border-color`, radius `0.75rem`, padding `0.625rem 0.875rem`, shadow Medium, max-width `240px`. Date/title bold, values with units, AQI badge inline when relevant. Appears on hover and on keyboard focus; never covers the cursor.
- Info tooltip for jargon (VIF, Durbin–Watson): a small `ⓘ` button (`24px` hit area `44px`) that opens a popover with a one-sentence plain-English meaning.

### 5.10 Inputs for the predictor (NEW)
- Sliders: track `6px`, `--border-color`; filled part `--accent`; thumb `22px` white with `2px --accent` ring and Small shadow; value shown in a pill input to the right (editable number field, radius `0.75rem`, `1px --border-color`, padding `0.5rem 0.75rem`).
- Label above (`0.875rem`, 600), unit and allowed range below in caption style.
- Out-of-range input: border `--warn`, caption "Outside the data range: estimate is less reliable".
- Result panel: large number, interval as "between X and Y µg/m³" in `--text-secondary`, AQI badge, gauge.

### 5.11 Accordion / Disclosure (NEW)
Summary row with chevron (rotates `180°`, `0.2s`), radius `1rem`, `1px` border; content padding `1.25rem`. Used for "View data", OLS explainer, methodology details.

### 5.12 Banners, chips, skeletons (NEW)
- **Notice banner** (synthetic data / limitations): `--accent-light` background, `1px` accent-tinted border, radius `1rem`, icon left, `0.875rem` text. Warning variant uses `--warn` at 12 % tint.
- **Chips**: pill, `0.25rem 0.625rem`, `0.75rem` text, `--accent-light` background for neutral filters; selected = solid `--accent` + white text.
- **Skeleton**: `--bg-tertiary` blocks with a `1.4s` shimmer (linear-gradient sweep); radius matches the real element.
- **Empty/error state**: centred icon, one-line message naming what failed (e.g. "Couldn't load metrics.json"), a secondary "Try again" button.

### 5.13 Takeaway bar (NEW, from the deck's "Takeaway:" strips)
Full-width strip under major sections: left `4px` accent border, `--accent-light` background, radius `0 1rem 1rem 0`, text `0.9375rem`, with a bold "Takeaway:" prefix in `--accent`. Use **once per page** for the single main message.

### 5.14 Pipeline strip (NEW, from deck slide 4)
Five chevron/rounded steps in a row (desktop) or vertical stepper (mobile). Step number eyebrow, step name, one live stat beneath. Steps share a sky-blue gradient from `--accent-hover` to `--accent`, text white; connectors are arrow glyphs in `--text-muted`.

---

## 6. Shadows & Depth (unchanged tiers)
- **Small** `--shadow-sm`: `0 1px 2px 0 rgba(0, 0, 0, 0.05)`
- **Medium** `--shadow-md`: `0 4px 6px -1px rgba(0, 0, 0, 0.1)`
- **Hover** `--shadow-hover`: `0 10px 25px -5px rgba(14, 165, 233, 0.25)`
- **Primary button** `--shadow-btn`: `0 4px 14px 0 rgba(14, 165, 233, 0.39)`
- Dark mode: base shadows `rgba(0,0,0,0.35)` / `0.5` so they stay visible.
- **NEW — overlay shadow** `--shadow-overlay` (tooltips, popovers, mobile menu): `0 12px 32px -8px rgba(15, 23, 42, 0.25)`.

---

## 7. Animations & Transitions
Soft, deliberate, never flashy.
- **Global**: `0.3s ease` for background/colour changes (theme).
- **Hover**: `0.2s ease` for buttons, links, chips, tabs.
- **Card hover** (interactive only): `translateY(-5px)` → `-8px` + hover shadow.
- **Mount `.fade-in`**: `0.8s ease`, `opacity 0 → 1`, `translateY(20px → 0)`. Stagger siblings by `60ms` (max 6 steps).
- **NEW — chart entrance**: lines draw left→right over `0.9s ease-out`; bars grow from baseline `0.6s ease-out`; only the first time a chart enters the viewport (use `IntersectionObserver`).
- **NEW — number count-up** for StatCards: `0.8s`, ease-out, once.
- **NEW — page transition**: cross-fade `0.25s`.
- **Reduced motion (REQUIRED)**: under `@media (prefers-reduced-motion: reduce)` disable transforms, count-ups, chart draw-ins, and needle animation; keep only instant opacity changes.
- Never animate AQI colours in a way that flashes or pulses.

---

## 8. Layout & Spacing Rules
- **Container**: max-width `1100px`, centred, `1.5rem` side padding. **Wide variant (NEW)** `1240px` allowed only for the calendar heatmap and tables.
- **Section spacing**: `padding: 6rem 0` desktop, `4rem 0` mobile. Within a page, group related charts in a section with `2rem` gaps.
- **Grid**: `grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem;` — `minmax` must never exceed `280px` (320 px phones).
- **Dashboard grids (NEW):**
  - StatCards: `repeat(auto-fit, minmax(220px, 1fr))`, gap `1.25rem` (collapses to 2 columns at ≥ 360px using `minmax(min(220px, 100%), 1fr)`).
  - Chart pairs: `repeat(auto-fit, minmax(min(100%, 420px), 1fr))`; hero charts span full width (`grid-column: 1 / -1`).
  - Insight cards: single column list on mobile, 2 columns ≥ 900px.
- **Hero**: Image/visual **left**, text **right** on desktop, gap `8rem` → for this project the left visual is the **AQI Gauge card** (or a mini calendar-heatmap strip), the right is title + subtitle + 2 buttons. Mobile: vertical stack (visual top, text bottom), gap `3rem`.
- **Page header block (NEW)**: each page starts with an eyebrow, an `h1` (`2.5rem`, mobile `2rem`), and a one-sentence lead paragraph in `--text-secondary` (max-width `60ch`).
- **Mobile**: `html, body { overflow-x: hidden; }`. Anything wider than the viewport (heatmap, tables, equations, wide charts) scrolls **inside its own container**, never the page.
- **Breakpoints**: `≤ 480` phone, `≤ 768` tablet-portrait (mobile nav), `≤ 1024` tablet, `> 1024` desktop. Test at 320, 375, 768, 1024, 1440.
- **Touch targets** ≥ `44×44px`.
- **Safe areas**: respect `env(safe-area-inset-*)` for the fixed header/bottom elements on notched phones.

---

## 9. Chart Rules (NEW)
Library: Recharts (or equivalent), styled only through tokens.
1. **One message per chart**; title states the takeaway.
2. Start bar charts at zero. Line charts may auto-scale but must label units.
3. Max 6 series; direct-label the last point when space allows instead of a legend; otherwise legend below the chart in caption style.
4. Always show **units** (µg/m³, °C, %, km/h) in axis titles or tick suffixes.
5. Reference lines for the CPCB standard (60 µg/m³) and WHO guideline are dashed and labelled in-chart.
6. Dots: `r=3` in scatter plots, `0.55` opacity to reveal density; regression line `2.5px` `--chart-2`.
7. Residual and diagnostic plots use neutral `--chart-6` points with `--chart-1` highlights for flagged points.
8. Chart height: `260–320px` desktop, `220–260px` mobile; margins tuned so tick labels never clip; long labels rotate or abbreviate (months → `J F M A…` on ≤ 480px).
9. Every chart: `role="img"`, an `aria-label` that states the takeaway, a **"View data"** disclosure with the table, and visible focus for keyboard-accessible points where applicable.
10. Tooltips follow 5.9; no tooltip-only information (the key number must be visible without hovering).
11. Never use pie charts except a donut for part-to-whole of ≤ 4 slices (data quality); stacked bars are preferred for AQI category shares.
12. Loading: skeleton with the final height to prevent layout shift.

---

## 10. Iconography & Illustration (NEW)
- Icon set: **Lucide** (stroke `1.75`, size `20px` inline / `24px` in circles), colour `currentColor`.
- Suggested: `wind`, `thermometer`, `droplets`, `calendar-days`, `activity`, `bar-chart-3`, `shield-alert`, `sigma`, `lightbulb`, `info`, `check-circle-2`, `alert-triangle`, `sun`, `moon`.
- No stock photos. Hero/empty-state illustrations are simple SVG built from tokens (e.g. a soft cloud/dots motif in `--accent-light`).
- Favicon: simple sky-blue rounded square with a white wind/lens glyph, or a single emoji (🌫️) if time is short.

---

## 11. Content & Microcopy Style (NEW)
- Voice: calm, clear, plain English; short sentences; numbers with units; dates like `12 Mar 2023`.
- Takeaway titles are sentences with a verb ("Winter is Kolkata's worst season"), not labels ("Seasonal PM₂.₅").
- Use "associated with", never "causes". Use "estimate", never "forecast" for model outputs.
- Jargon only on Model/Accuracy pages, each with an `ⓘ` tooltip.
- Always show the honesty line near AQI visuals: "AQI is based on PM₂.₅ only (CPCB scale)".

---

## 12. Accessibility (NEW, mandatory)
- WCAG 2.1 AA: text contrast ≥ 4.5:1 (3:1 for ≥ 24px or bold ≥ 18.66px and UI graphics). Verify AQI badge text/fill pairs and chart text in **both** themes.
- Do not communicate with colour alone (labels/icons/hatching).
- Full keyboard operability, logical tab order, visible focus rings (5.1), `skip to content` link.
- Semantics: landmarks (`header`, `nav`, `main`, `footer`), headings in order, `aria-current="page"` on active nav, `aria-live="polite"` on the predictor result.
- Respect `prefers-reduced-motion` and `prefers-color-scheme`.
- Charts: summary `aria-label` + data table alternative (Section 9).
- `lang="en"` on `<html>`; leave room (flexible widths) for longer Bengali/Hindi strings in a future phase.

---

## 13. Performance & Implementation Notes (NEW)
- Native font stack only (no webfont download).
- Code-split pages (`React.lazy`) and lazy-mount charts via `IntersectionObserver`.
- Prefer CSS variables and `color-mix` over duplicated colour constants; Recharts props receive `var(--token)` strings.
- Avoid layout shift: reserve chart/card heights; use skeletons.
- Images: none required; SVG inline only.
- Print stylesheet (nice-to-have): light theme, hide header/toggles, avoid breaking cards across pages.

---

## 14. Reference tokens — `web/src/styles/tokens.css`

```css
:root {
  /* Surfaces & text */
  --bg-primary: #F8FAFC;
  --bg-secondary: #FFFFFF;
  --bg-tertiary: #F1F5F9;
  --text-primary: #0F172A;
  --text-secondary: #475569;
  --text-muted: #64748B;
  --border-color: #E2E8F0;

  /* Accent */
  --accent: #0EA5E9;
  --accent-hover: #0284C7;
  --accent-light: rgba(14, 165, 233, 0.1);

  /* AQI (CPCB scale) */
  --aqi-good: #16A34A;         --aqi-good-ink: #FFFFFF;
  --aqi-satisfactory: #84CC16; --aqi-satisfactory-ink: #0F172A;
  --aqi-moderate: #FACC15;     --aqi-moderate-ink: #0F172A;
  --aqi-poor: #F97316;         --aqi-poor-ink: #0F172A;
  --aqi-verypoor: #DC2626;     --aqi-verypoor-ink: #FFFFFF;
  --aqi-severe: #7F1D1D;       --aqi-severe-ink: #FFFFFF;

  /* Chart series */
  --chart-1: var(--accent);
  --chart-2: #6366F1;
  --chart-3: #14B8A6;
  --chart-4: #F59E0B;
  --chart-5: #EC4899;
  --chart-6: #64748B;

  /* Seasons */
  --season-winter: #38BDF8;
  --season-pre: #F59E0B;
  --season-monsoon: #14B8A6;
  --season-post: #A78BFA;

  /* Status */
  --ok: #16A34A; --warn: #F59E0B; --bad: #DC2626;

  /* Shape */
  --radius-card: 1.5rem;
  --radius-md: 1rem;
  --radius-sm: 0.75rem;
  --radius-pill: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-hover: 0 10px 25px -5px rgba(14, 165, 233, 0.25);
  --shadow-btn: 0 4px 14px 0 rgba(14, 165, 233, 0.39);
  --shadow-overlay: 0 12px 32px -8px rgba(15, 23, 42, 0.25);

  /* Motion */
  --t-theme: 0.3s ease;
  --t-hover: 0.2s ease;
  --t-enter: 0.8s ease;

  /* Layout */
  --container: 1100px;
  --container-wide: 1240px;
  --header-h: 70px;
  --font: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif;

  color-scheme: light;
}

[data-theme="dark"] {
  --bg-primary: #0F172A;
  --bg-secondary: #1E293B;
  --bg-tertiary: #172033;
  --text-primary: #F8FAFC;
  --text-secondary: #94A3B8;
  --text-muted: #7C8CA3;
  --border-color: #334155;

  --accent: #38BDF8;
  --accent-hover: #7DD3FC;
  --accent-light: rgba(56, 189, 248, 0.15);

  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.35);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.5);
  --shadow-overlay: 0 12px 32px -8px rgba(0, 0, 0, 0.6);

  color-scheme: dark;
}

/* Follow OS when the user has not chosen */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --bg-primary: #0F172A;
    --bg-secondary: #1E293B;
    --bg-tertiary: #172033;
    --text-primary: #F8FAFC;
    --text-secondary: #94A3B8;
    --text-muted: #7C8CA3;
    --border-color: #334155;
    --accent: #38BDF8;
    --accent-hover: #7DD3FC;
    --accent-light: rgba(56, 189, 248, 0.15);
    color-scheme: dark;
  }
}

html, body { overflow-x: hidden; }
body {
  margin: 0;
  font-family: var(--font);
  font-size: 1rem; line-height: 1.6; font-weight: 400;
  background: var(--bg-primary); color: var(--text-primary);
  transition: background-color var(--t-theme), color var(--t-theme);
}
h1, h2, h3 { letter-spacing: -0.03em; font-weight: 800; }
.tabular { font-variant-numeric: tabular-nums; }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }
}
```

> Dark-mode note: the AQI and chart-series hues are intentionally identical in both themes. If a specific chart looks too bright on dark surfaces, lower fill opacity to `0.85`; do **not** change the hue.

---

## 15. Page-by-page visual summary (NEW, quick reference)

| Page | Hero element | Signature visual | Density |
|---|---|---|---|
| Home | Gauge card + title/buttons | Calendar-heatmap strip, pipeline strip | Airy |
| Explore | Page header + year segmented control | Full-width calendar heatmap, then 2-up chart cards | Medium |
| Model | Inputs → Model → Output diagram | Coefficient forest plot, KaTeX equation card | Medium, technical |
| Accuracy | Four metric StatCards | Actual vs predicted band chart, confusion matrix | Medium, technical |
| Predict | Large result panel with gauge | Sliders with live-updating result | Airy, interactive |
| Learn | Worked example card | Editable 5-point table + live line | Airy, educational |
| Limits | Three limitation cards with real numbers | 3-stage roadmap | Airy |

---

## 16. Do / Don't checklist for the coding agent
**Do:** use tokens; show takeaway titles; label units; pair colour with text; keep cards rounded and breathable; test 320 px and dark mode; honour reduced motion.
**Don't:** hardcode hex values; use AQI colours for UI chrome; add flashy/pulsing alerts; use 3D charts or pie charts with > 4 slices; put charts on the bare page background; let any element cause horizontal page scroll; present estimates as official forecasts.
