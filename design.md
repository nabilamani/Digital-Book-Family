# Design System Inspired by Turso

## 1. Visual Theme & Atmosphere

Turso embodies a futuristic, tech-forward aesthetic built for the agentic database era. The design combines a dark, sophisticated foundation with vibrant accent colors that convey speed, innovation, and reliability. The visual language emphasizes clarity and modernity through bold typography, high contrast, and dynamic color usage. The system balances minimalist dark surfaces with energetic cyan and magenta accents, creating a premium feel that appeals to developers and enterprise audiences. Generous whitespace and carefully orchestrated elevation create depth without clutter, establishing confidence in the product's sophisticated infrastructure.

**Key Characteristics**

- Dark theme foundation (`#162129` / `#283945`) for reduced eye strain and premium perception
- Vibrant cyan (`#4FF7D1`) as the primary call-to-action color, signaling modernity and energy
- Magenta (`#D946EF`) for secondary emphasis and status indicators
- High contrast white text on dark backgrounds for accessibility and legibility
- Bold, oversized typography for hero statements and headlines
- Generous spacing and breathing room between elements
- Subtle shadows and layered elevation for depth hierarchy
- Clean, minimal UI with emphasis on content and messaging

## 2. Color Palette & Roles

### Primary
- **Cyan** (`#4FF7D1`): Primary CTA buttons, hero headings, active states, and brand accent color. Used extensively across primary actions and brand identity.
- **Cyan Light** (`#4FF8D2`): Slight variation for refined hover states and background tints.

### Accent Colors
- **Magenta** (`#D946EF`): Secondary accent for status badges (Beta/alert states), secondary emphasis, and complementary highlights.

### Interactive
- **Dark Navy** (`#283945`): Interactive backgrounds, cards, and contained sections requiring distinction from the main background.
- **Navy Dark** (`#293945`): Subtle variation for layered card backgrounds and slightly elevated surfaces.

### Neutral Scale
- **White** (`#FFFFFF`): Primary text, icons, and foreground elements on dark backgrounds.
- **Black** (`#000000`): Deep shadows, text on light backgrounds (rarely used given dark theme).
- **Gray Light** (`#9CA3AF`): Secondary text, disabled states, and reduced-emphasis copy.
- **Gray Medium Light** (`#E5E7EB`): Subtle borders and divider lines.
- **Gray Medium** (`#D1D5DB`): Border strokes and slight background differentiation.
- **Gray Subtle** (`#C5CACE`): Minimal contrast elements and very light borders.
- **Gray Faint** (`#F3F4F6`): Almost-white backgrounds for contrast-light sections.

### Surface & Borders
- **Background Dark Base** (`#162129`): Primary page/screen background color, darkest tier.
- **Transparent Black** (`#0000`): Overlay opacity for modals, backdrops, and semi-transparent elements.

## 3. Typography Rules

### Font Family
- **Primary Font**: Inter (`__Inter_f367f3`) — clean, modern, highly legible sans-serif. Fallback: `system-ui, -apple-system, sans-serif`
- **Secondary Font**: UI Monospace (`ui-monospace`) — used for code snippets, command line examples, and technical references. Fallback: `'Courier New', monospace`

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|----------------|-------|
| Display / H1 | Inter | 72px | 800 | 72px | Normal | Hero headline, maximum emphasis |
| Heading / H2 | Inter | 36px | 700 | 40px | Normal | Section headline, strong visual break |
| Subheading / H3 | Inter | 18px | 600 | 28px | Normal | Subsection title, moderate emphasis |
| Body / Paragraph | Inter | 20px | 400 | 32px | Normal | Primary body text, main content |
| Small Text / Caption | Inter | 16px | 400 | Normal | Normal | UI labels, secondary information |
| Code / Monospace | Monospace | 16px | 400 | 28px | Normal | Code blocks, technical references |
| Button Text | Inter | 16px | 600 | Normal | Normal | CTA and action button labels |
| Link Text | Inter | 16px | 400 | Normal | Normal | Inline links and navigation items |

### Principles
- **Weight hierarchy**: Use weight variation (400, 600, 700, 800) to establish visual priority without size changes alone.
- **Line height generosity**: Larger line heights (`28px`–`40px`) in body copy aid readability and create spacious, premium feel.
- **Monospace for technical**: Reserve monospace fonts strictly for code, CLI examples, and technical tokens to maintain semantic clarity.
- **Bold headlines**: H1 and H2 use bold weights (700–800) to command attention and establish hierarchy.
- **Consistent tracking**: Maintain normal letter spacing throughout; avoid condensed or expanded tracking unless specifically emphasized.

## 4. Component Stylings

### Buttons

#### Primary Button (Cyan CTA)
- **Background**: `#4FF7D1`
- **Text Color**: `#000000`
- **Padding**: `12px 24px`
- **Font Size**: `16px`
- **Font Weight**: `600`
- **Border Radius**: `9999px`
- **Border**: None
- **Box Shadow**: None
- **Hover State**: Opacity `0.85`, background slightly darkened
- **Disabled State**: Opacity `0.5`

#### Secondary Button (Magenta)
- **Background**: `#D946EF`
- **Text Color**: `#FFFFFF`
- **Padding**: `10px 14px`
- **Font Size**: `16px`
- **Font Weight**: `600`
- **Border Radius**: `9999px`
- **Border**: None
- **Box Shadow**: None
- **Hover State**: Opacity `0.85`
- **Disabled State**: Opacity `0.5`

#### Ghost Button (Outlined / Text-only)
- **Background**: `rgba(0, 0, 0, 0)` (transparent)
- **Text Color**: `#9CA3AF`
- **Padding**: `10px 10px`
- **Font Size**: `16px`
- **Font Weight**: `400`
- **Border Radius**: `6px`
- **Border**: None
- **Box Shadow**: None
- **Hover State**: Text color shifts to `#FFFFFF`, opacity increases
- **Disabled State**: Opacity `0.5`

### Cards & Containers

#### Standard Card
- **Background**: `#283945`
- **Border**: `1px solid #D1D5DB`
- **Border Radius**: `6px`
- **Padding**: `24px`
- **Box Shadow**: `0px 1px 3px rgba(0, 0, 0, 0.1)`

#### Featured Card (with colored border)
- **Background**: `#283945`
- **Border**: `2px solid #D946EF` (for Magenta accent) or `2px solid #4FF7D1` (for Cyan accent)
- **Border Radius**: `6px`
- **Padding**: `24px`
- **Box Shadow**: `0px 4px 6px rgba(0, 0, 0, 0.15)`

#### Section Container
- **Background**: `#162129`
- **Padding**: `64px 48px`
- **Border Radius**: `0px` (full-width sections) or `6px` (contained sections)

### Inputs & Forms

#### Text Input
- **Background**: `rgba(0, 0, 0, 0.2)`
- **Border**: `1px solid #9CA3AF`
- **Border Radius**: `6px`
- **Padding**: `12px 16px`
- **Font Size**: `16px`
- **Font Family**: Inter
- **Text Color**: `#FFFFFF`
- **Placeholder Color**: `#9CA3AF`
- **Focus State**: Border color `#4FF7D1`, box-shadow `0 0 0 3px rgba(79, 247, 209, 0.1)`
- **Disabled State**: Background `#293945`, text color `#9CA3AF`, opacity `0.5`

#### Select / Dropdown
- **Background**: `rgba(0, 0, 0, 0.2)`
- **Border**: `1px solid #9CA3AF`
- **Border Radius**: `6px`
- **Padding**: `12px 16px`
- **Font Size**: `16px`
- **Font Color**: `#FFFFFF`
- **Focus State**: Border `#4FF7D1`, shadow `0 0 0 3px rgba(79, 247, 209, 0.1)`

#### Label
- **Font Size**: `14px`
- **Font Weight**: `600`
- **Color**: `#FFFFFF`
- **Margin Bottom**: `8px`

### Navigation

#### Header Navigation
- **Background**: `rgba(0, 0, 0, 0)` (transparent)
- **Padding**: `24px`
- **Height**: `92px`
- **Display**: Flex, centered alignment
- **Logo**: White color, positioned left
- **Nav Links**: `#FFFFFF`, `16px`, `400` weight, spacing `16px` between items
- **CTA Button**: Cyan (`#4FF7D1`), black text
- **Responsive**: Collapses to hamburger menu below `768px`

#### Link (Navigation)
- **Color**: `#FFFFFF`
- **Font Size**: `16px`
- **Font Weight**: `400`
- **Padding**: `6px 6px`
- **Background**: Transparent
- **Hover State**: Color shifts to `#4FF7D1`, opacity `1`
- **Active State**: Color `#4FF7D1`, underline or background highlight

### Badges & Status Indicators

#### Badge (Status)
- **Background**: `#D946EF` (for Beta) or `#4FF7D1` (for Production)
- **Text Color**: `#000000` (on Cyan) or `#FFFFFF` (on Magenta)
- **Padding**: `6px 12px`
- **Font Size**: `12px`
- **Font Weight**: `600`
- **Border Radius**: `9999px`
- **Box Shadow**: None

## 5. Layout Principles

### Spacing System

**Base Unit**: `8px`

**Scale**:
- `8px` — Fine spacing, padding within tight components, small gaps
- `16px` — Standard gap between inline elements, small padding
- `24px` — Container padding, moderate margins
- `32px` — Section margins, breathing room between content blocks
- `40px` — Large padding, feature section spacing
- `48px` — Major content padding
- `56px` — Large section spacing
- `64px` — Extra-large section margins, hero area padding
- `72px` — Hero section vertical spacing
- `80px` — Full-height section margin
- `128px` — Maximum breathing room, hero/featured content gaps

**Usage Context**:
- Buttons: `12px` vertical, `24px` horizontal padding
- Cards: `24px` padding
- Sections: `64px` top/bottom padding, `48px` left/right
- Hero headings: `72px` margin-bottom
- Inline elements: `16px` gap between items

### Grid & Container

- **Max Width**: `1280px` (standard 12-column grid)
- **Column Strategy**: 12-column responsive grid
  - Desktop: Full 12 columns, `1280px` max
  - Tablet: 6 columns at `768px` and up
  - Mobile: Single column, full width with `24px` side margins
- **Section Patterns**:
  - Hero: Full viewport width, centered content max `1000px`
  - Features: 2–3 column grid on desktop, 1 column on mobile
  - Content: Full-width sections with `64px` vertical padding

### Whitespace Philosophy

The design prioritizes breathing room and visual clarity. Sections are generously spaced with large margins (`64px`–`128px`) to reduce cognitive load and establish hierarchy. Cards and components maintain internal padding (`24px`) to create comfortable visual separation. Inline elements use consistent `16px` gaps. This philosophy communicates premium quality, reduces visual chaos, and improves focus on key messaging. Dark backgrounds amplify the impact of whitespace by creating strong contrast.

### Border Radius Scale

- `0px` — No rounding, used for full-width sections and blocky layouts
- `6px` — Standard rounding for cards, inputs, and small components
- `9999px` — Pill-shaped buttons and fully rounded badges

### Border Widths

- `1px` — Standard border stroke for inputs, cards, and subtle dividers
- `2px` — Emphasis borders for featured cards and highlighted states
- `0px` — No border for flat/transparent components

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Base (Flat) | No shadow | Typography, icons, minimal emphasis |
| Raised (Level 1) | `0px 1px 3px rgba(0, 0, 0, 0.1)` | Standard cards, buttons on hover, slight lift |
| Elevated (Level 2) | `0px 4px 6px rgba(0, 0, 0, 0.15)` | Featured cards, modals, prominent sections |
| High (Level 3) | `0px 10px 15px rgba(0, 0, 0, 0.2)` | Dropdowns, toasts, high-priority modals |
| Maximum (Level 4) | `0px 20px 25px rgba(0, 0, 0, 0.25)` | Full-screen modals, critical alerts |

**Shadow Philosophy**

Shadows in the Turso system use subtle, restrained techniques to avoid visual clutter on the dark background. Shadows are soft and diffused (`rgba(0, 0, 0, ...)` with low opacity) to create layered depth without harsh contrast. Higher-elevation elements use progressively larger blur radii and slightly increased opacity to establish clear spatial hierarchy. Shadows are reserved for interactive elements, cards, and modals; flat sections remain without shadow to maintain the clean, modern aesthetic.

### Opacity Levels

- `0.05` (`5%`) — Minimal tint, used for very subtle hover backgrounds or overlay overlays
- `0.70` (`70%`) — Moderate emphasis, used for disabled states and reduced-opacity text
- `0.85` — Hover state for buttons, slight dimming while maintaining vibrancy
- `1.0` — Full opacity, default state for all components

### Z-index / Layering

- `10` — Dropdown menus, popovers
- `30` — Secondary dropdown level
- `100` — Sticky headers and fixed navigation
- `101` — Sticky sidebar or secondary sticky element
- `9999` — Modal overlays, full-screen dialogs, critical alerts

## 7. Do's and Don'ts

### Do

- **Use cyan (`#4FF7D1`) for all primary CTAs** — It is the brand's signal color and drives user action.
- **Maintain high contrast** — White text on dark backgrounds ensures accessibility and readability.
- **Apply consistent spacing** — Use the `8px` scale to maintain rhythm and alignment across layouts.
- **Emphasize with weight, not size** — Use `600`, `700`, and `800` weights for hierarchy instead of increasing font size.
- **Reserve magenta for secondary accents** — Use `#D946EF` for badges, alerts, and complementary emphasis only.
- **Pair dark backgrounds with generous whitespace** — Let breathing room reduce cognitive load and emphasize key content.
- **Use rounded corners sparingly** — Apply `6px` to inputs and standard cards; `9999px` only to pill-shaped buttons.
- **Build with the 8px grid** — All spacing should be a multiple of `8px` for visual consistency.
- **Ensure interactive elements are `44px` minimum height** — Maintain touch-friendly target sizes across devices.

### Don't

- **Avoid light backgrounds** — The dark theme is core to the brand identity; maintain `#162129` or `#283945` as defaults.
- **Don't mix cyan and magenta in the same UI section** — Separate their use to avoid visual confusion; use one as primary, the other as secondary.
- **Avoid text smaller than `14px`** — Maintain readability; use opacity or weight reduction instead of size reduction for secondary information.
- **Don't apply heavy shadows on the dark background** — Shadows should be soft and subtle (`rgba` with low opacity); harsh black shadows create visual noise.
- **Avoid animation without purpose** — Animations should aid clarity or provide feedback; avoid motion that distracts or delays.
- **Don't use the full black (`#000000`) for text** — Use white (`#FFFFFF`) or gray (`#9CA3AF`) on dark backgrounds for better contrast.
- **Avoid inconsistent border radius** — Stick to `0px`, `6px`, or `9999px`; arbitrary values break visual coherence.
- **Don't embed text directly inside colored overlays** — Always ensure text has sufficient contrast (WCAG AA minimum `4.5:1`).
- **Avoid right-aligning body text** — Keep paragraphs and body copy left-aligned for readability.

## 8. Responsive Behavior

### Breakpoints

| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile | `320px` – `767px` | Single column, full-width sections, `24px` side padding, stacked navigation, hamburger menu |
| Tablet | `768px` – `1023px` | 6-column grid, 2-column card layouts, optimized padding `32px`, navigation collapses at lower end |
| Desktop | `1024px` – `1279px` | 12-column grid, multi-column layouts, `48px` padding, full navigation visible |
| Wide | `1280px+` | Max-width container `1280px` centered, generous side margins, full feature utilization |

### Touch Targets

- **Minimum Interactive Size**: `44px` × `44px` (buttons, links, form inputs)
- **Spacing Between Touch Targets**: `8px` minimum
- **Button Padding**: Mobile `12px 24px`, Desktop `12px 24px` (consistent)
- **Navigation Links**: `44px` tall minimum on mobile
- **Form Input Height**: `40px` minimum on mobile

### Collapsing Strategy

- **Hero Section**: Full-width image on desktop; reduced height on tablet; text-only on mobile with centered layout
- **Navigation**: Full horizontal menu on desktop; collapsed hamburger icon on tablet and mobile
- **Cards**: 3 columns on desktop → 2 columns on tablet → 1 column on mobile
- **Padding**: `64px` (desktop) → `48px` (tablet) → `24px` (mobile) for section spacing
- **Typography**: H1 `72px` (desktop) → `48px` (tablet) → `36px` (mobile); H2 `36px` (desktop) → `28px` (tablet) → `24px` (mobile)
- **Margins**: `128px` gaps collapse to `72px` (tablet), then `48px` (mobile)
- **Grid Columns**: 12 columns (desktop) → 6 columns (tablet) → 1 column (mobile)

## 9. Agent Prompt Guide

### Quick Color Reference

- **Primary CTA**: Cyan (`#4FF7D1`) — Use for main action buttons, hero text, primary emphasis
- **Secondary CTA**: Magenta (`#D946EF`) — Use for badges, alerts, secondary actions
- **Background**: Dark Navy (`#162129`) — Use for page background and primary surface
- **Card Background**: Medium Navy (`#283945`) — Use for contained cards and lifted surfaces
- **Text (Primary)**: White (`#FFFFFF`) — Use for main body text, headings, UI labels
- **Text (Secondary)**: Gray (`#9CA3AF`) — Use for reduced-emphasis copy, disabled states, placeholders
- **Borders**: Light Gray (`#D1D5DB`) or Medium Gray (`#E5E7EB`) — Use for subtle dividers and input borders
- **Overlay**: Transparent Black (`#0000`) — Use with opacity for modal backdrops and overlays

### Iteration Guide

1. **Start with dark backgrounds** — All sections default to `#162129` or `#283945`; avoid light colors.
2. **Cyan is the action color** — Every primary call-to-action button uses `#4FF7D1` with black text (`#000000`) and `9999px` border-radius.
3. **Use weight over size** — Establish hierarchy through font weights (`400`, `600`, `700`, `800`) rather than increasing size; this maintains proportional spacing.
4. **Follow the 8px grid** — All spacing (padding, margin, gaps) must be a multiple of `8px`; common values are `24px`, `48px`, `64px`.
5. **Apply subtle shadows** — Use soft shadows (`0px 1px 3px rgba(0, 0, 0, 0.1)` for cards) only; avoid harsh drop shadows.
6. **Maintain high contrast** — White (`#FFFFFF`) on dark backgrounds is default; never place light text on light backgrounds.
7. **Border radius is minimal** — Use `6px` for cards/inputs, `9999px` for buttons only; avoid other values.
8. **Spacing creates hierarchy** — Generous margins (`64px`–`128px` between sections) emphasize content importance and premium feel.
9. **Magenta accents sparingly** — Reserve `#D946EF` for badges, secondary states, and highlights; do not overuse.
10. **Touch targets are 44px minimum** — All clickable elements (buttons, links, inputs) must be at least `44px` in height for accessibility.