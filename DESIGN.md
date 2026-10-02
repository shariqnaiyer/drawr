---
name: drawr
description: Turn a measured drawer into a print-ready Gridfinity layout. The drawer is the product shot.
colors:
  accent: "#0a6ce4"
  accent-hover: "#0860c9"
  accent-press: "#07539f"
  accent-ink: "#0a5bc0"
  accent-soft: "rgba(10, 108, 228, 0.09)"
  accent-ring: "rgba(10, 108, 228, 0.32)"
  on-accent: "#ffffff"
  bg: "#f5f5f7"
  paper: "#ffffff"
  paper-2: "#fbfbfd"
  fill: "#f0f0f3"
  fill-2: "#e8e8ed"
  ink: "#1d1d1f"
  ink-2: "#515154"
  ink-3: "#6e6e73"
  ink-4: "#8e8e93"
  line: "rgba(0, 0, 0, 0.09)"
  line-2: "rgba(0, 0, 0, 0.055)"
  line-strong: "rgba(0, 0, 0, 0.16)"
  canvas: "#ebebef"
  canvas-dot: "rgba(0, 0, 0, 0.07)"
  plate: "#fdfdfe"
  socket: "#f1f1f4"
  chrome: "rgba(255, 255, 255, 0.78)"
  chrome-solid: "#ffffff"
  scrim: "rgba(20, 20, 24, 0.32)"
  tip: "#1d1d1f"
  on-tip: "#ffffff"
  ok: "#1f9d55"
  ok-soft: "rgba(31, 157, 85, 0.1)"
  ok-ink: "#187a42"
  warn: "#b26a00"
  warn-soft: "rgba(230, 150, 20, 0.12)"
  bad: "#e0362c"
  bad-soft: "rgba(224, 54, 44, 0.1)"
  bad-ink: "#c22a21"
  deep: "#0b1526"
  deep-2: "#13213a"
  on-deep: "#f5f7fb"
  on-deep-2: "#a9b6cc"
  filament-graphite: "#4a4a50"
  filament-cloud: "#f4f4f6"
  filament-signal: "#3b74f6"
  filament-mint: "#38c493"
  filament-sun: "#ffc53d"
  filament-coral: "#ff6a55"
  filament-lilac: "#a58bff"
typography:
  display:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', Inter, 'Segoe UI', sans-serif"
    fontSize: "clamp(44px, 7.4vw, 84px)"
    fontWeight: 700
    lineHeight: 1.02
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', Inter, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "clamp(32px, 4.4vw, 52px)"
    fontWeight: 700
    lineHeight: 1.06
    letterSpacing: "-0.038em"
  title:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', Inter, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "22px"
    fontWeight: 700
    letterSpacing: "-0.025em"
  title-sm:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', Inter, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "15px"
    fontWeight: 650
    lineHeight: 1.25
    letterSpacing: "-0.015em"
  readout:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', Inter, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "26px"
    fontWeight: 650
    letterSpacing: "-0.03em"
    fontFeature: "tnum"
  lede:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', Inter, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "clamp(17px, 1.4vw, 19px)"
    fontWeight: 400
    lineHeight: 1.5
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', Inter, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.45
    fontFeature: "'cv11', 'ss01'"
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', Inter, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "13px"
    fontWeight: 500
    letterSpacing: "-0.005em"
  caption:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', Inter, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "11.5px"
    fontWeight: 400
  mono:
    fontFamily: "ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace"
    letterSpacing: "-0.01em"
    fontFeature: "tnum"
rounded:
  xs: "6px"
  sm: "8px"
  md: "10px"
  lg: "14px"
  xl: "20px"
  tile: "24px"
  pill: "999px"
spacing:
  xxs: "4px"
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "18px"
  xl: "24px"
  gutter: "clamp(20px, 5vw, 48px)"
  section: "clamp(72px, 10vw, 128px)"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 14px"
    height: "32px"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
  button-primary-active:
    backgroundColor: "{colors.accent-press}"
  button-primary-lg:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.pill}"
    padding: "0 22px"
    height: "44px"
  button-secondary:
    backgroundColor: "{colors.fill}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 14px"
    height: "32px"
  button-secondary-hover:
    backgroundColor: "{colors.fill-2}"
  button-plain:
    textColor: "{colors.accent-ink}"
    rounded: "{rounded.pill}"
    padding: "0 8px"
    height: "32px"
  button-plain-hover:
    backgroundColor: "{colors.accent-soft}"
  button-icon:
    textColor: "{colors.ink-2}"
    rounded: "{rounded.sm}"
    size: "32px"
  button-icon-hover:
    backgroundColor: "{colors.fill}"
    textColor: "{colors.ink}"
  segmented:
    backgroundColor: "{colors.fill}"
    rounded: "9px"
    padding: "2px"
  segmented-item:
    textColor: "{colors.ink-2}"
    rounded: "7px"
    padding: "0 12px"
    height: "28px"
  segmented-item-selected:
    backgroundColor: "{colors.chrome-solid}"
    textColor: "{colors.ink}"
  switch:
    backgroundColor: "{colors.fill-2}"
    rounded: "{rounded.pill}"
    width: "38px"
    height: "23px"
  switch-on:
    backgroundColor: "{colors.ok}"
  field:
    backgroundColor: "{colors.fill}"
    rounded: "{rounded.md}"
    padding: "0 12px"
    height: "36px"
  field-focus:
    backgroundColor: "{colors.paper}"
  field-big:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.lg}"
    padding: "0 16px"
    height: "56px"
  badge:
    backgroundColor: "{colors.fill}"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.xs}"
    padding: "0 7px"
    height: "20px"
  badge-ok:
    backgroundColor: "{colors.ok-soft}"
    textColor: "{colors.ok-ink}"
  badge-warn:
    backgroundColor: "{colors.warn-soft}"
    textColor: "{colors.warn}"
  badge-bad:
    backgroundColor: "{colors.bad-soft}"
    textColor: "{colors.bad-ink}"
  chip:
    backgroundColor: "{colors.fill}"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.pill}"
    padding: "0 13px"
    height: "30px"
  chip-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.bg}"
  tip:
    backgroundColor: "{colors.tip}"
    textColor: "{colors.on-tip}"
    rounded: "{rounded.pill}"
    padding: "0 14px"
    height: "32px"
  toolbar:
    backgroundColor: "{colors.chrome}"
    height: "52px"
  dock:
    backgroundColor: "{colors.chrome}"
    rounded: "16px"
    padding: "5px"
  sheet:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.xl}"
  inspector:
    backgroundColor: "{colors.paper}"
    width: "320px"
  card:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.lg}"
  tile:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.tile}"
    padding: "30px"
  spec-band:
    backgroundColor: "{colors.deep}"
    textColor: "{colors.on-deep}"
---

# Design System: drawr

## Overview

**Creative North Star: "The Drawer Is the Product Shot"**

drawr is built the way Apple renders a product and Stripe annotates a number. The interface is a quiet greyscale room (cool off-white ground, white paper, translucent chrome) whose only job is to present one object: a baseplate full of printed bins, lit like a studio render and labelled like an engineering drawing. Everything that is not the drawer recedes; everything that is a measurement is set precisely, in the UI face, with tabular figures.

Color is a material property, not a decoration. Only printed parts carry saturated color, and they draw it from a fixed seven-colour filament lineup (`frontend/src/lib/filament.ts`), each filament defined as face, side, deep and ink shades so a bin reads as a lit solid in 2D, in the isometric landing render, and in the 3D preview alike. The interface itself owns exactly one chromatic voice: an interactive blue that marks what you can press and what is selected. Brand moments borrow two Stripe devices: a deep navy band for the specification, and a skewed, slowly drifting field of blurred filament colours behind the hero drawer.

Density follows the surface. The landing page is spacious and centred, with large tightly-tracked headlines. The editor is a dense, calm workbench: a 52px translucent toolbar, a dotted canvas, a floating dock, and a 320px inspector of iOS-style grouped rows, switches, steppers and segmented controls. Motion has one grammar: things drop and seat into the grid with a gentle spring, and chrome slides or fades with a long ease-out. Light and dark themes are both first-class; dark maps the same roles onto Apple's black/graphite system greys.

**Key Characteristics:**
- Greyscale chrome, one interactive blue, colour only on printed parts.
- SF system type (Inter fallback) with tabular numerals for every measurement; mono only for literal filenames.
- Pill buttons, iOS switches and segmented controls, translucent blurred toolbars and docks, modal sheets.
- Hairline rings (0.5 to 1px translucent black) instead of hard borders; layered soft shadows for lift.
- Stripe-style dimension annotations and line-item tables; a navy spec band for brand moments.
- Motion = drop, seat, settle (spring `cubic-bezier(0.3, 1.18, 0.5, 1)`).

## Colors

A cool Apple greyscale ground with one interactive blue, plus a seven-colour filament lineup reserved for the printed objects.

### Primary
- **Signal Action Blue** (`accent`): the single interactive colour. Primary buttons, selection rings on bins, the active dock tool (as `accent-soft` fill with `accent-ink` glyph), slider tracks, focus outlines, field focus rings, the draw ghost, and accent dimension lines in the Setup diagram. Hover and press step darker (`accent-hover`, `accent-press`); text-on-white links use the slightly deeper `accent-ink` for contrast. Dark theme lifts it to `#2b8bff`.

### Secondary
- **Spec Navy** (`deep`, with `deep-2` for inset figures): the Stripe-style band that carries the dimensional specification on the landing page. Text on it is `on-deep` (near-white) and `on-deep-2` (slate) for secondary copy and table headers. Used for brand moments only, never inside the editor.

### Tertiary: the Filament Lineup
These are the only saturated colours in the product, and they belong to parts, not interface. Each has face/side/deep/ink shades in `filament.ts`; the face value is recorded here.
- **Graphite** (`filament-graphite`): default bin colour; dark, neutral.
- **Cloud** (`filament-cloud`): near-white plastic.
- **Signal** (`filament-signal`): a print blue, deliberately distinct from the interface `accent`.
- **Mint** (`filament-mint`), **Sun** (`filament-sun`), **Coral** (`filament-coral`), **Lilac** (`filament-lilac`): the brights. They also feed the landing hero's blurred gradient field, and Sun is the highlight stroke for the critical 4.95 mm dimension in the spec figure.

### Neutral
- **Studio Ground** (`bg`): page background on landing, setup and the editor shell.
- **Paper** (`paper`, `paper-2`): sheets, inspector, cards, tiles; `paper-2` for table headers and sheet footers.
- **Quiet Fill** (`fill`, `fill-2`): resting background of secondary buttons, segmented tracks, fields, steppers, chips; `fill-2` is the hover step and the switch-off track.
- **Ink ladder** (`ink`, `ink-2`, `ink-3`, `ink-4`): primary text; secondary controls and labels; meta, captions, ledes; placeholders and separators.
- **Hairlines** (`line`, `line-2`, `line-strong`): dividers and container rings at 9%, 5.5% and 16% black. `line-strong` draws dimension annotations.
- **Workbench** (`canvas`, `canvas-dot`, `plate`, `socket`): the editor stage is a dotted grey surface (1px dots on a 22px grid) on which a near-white baseplate sits with inset sockets.
- **Materials** (`chrome`, `chrome-solid`, `scrim`, `tip`): 78% translucent white for blurred chrome; solid white for segmented thumbs; a 32% scrim behind sheets; and an inverted ink pill for tooltips and canvas toasts.

### Semantic
- **Fit Green** (`ok`, `ok-soft`, `ok-ink`): switch "on" state, ready status dot, permissive-license badges, success callouts.
- **Caution Amber** (`warn`, `warn-soft`): non-commercial license badges.
- **Collision Red** (`bad`, `bad-soft`, `bad-ink`): blocked placements (dashed red ghost), collision toast icon, delete hover, error messages.

### Named Rules
**The Filament Rule.** Saturated colour belongs to printed parts only. Bins, model footprints and their swatches wear the filament lineup; toolbars, panels, buttons and text never do. If a new surface wants colour, it must be showing a part.

**The One Blue Rule.** `accent` is the only interactive hue, and a view shows at most one primary (filled blue) button. Selection, focus and "pressed tool" all speak blue. The sole exception is the iOS switch, whose on-state is system green (`ok`), as on Apple platforms.

**The Navy Band Rule.** `deep` appears as a full-bleed band carrying specification content, nowhere else. It is a brand moment, not a theme.

## Typography

**Display Font:** SF Pro Display via `-apple-system` (Inter fallback where SF is unavailable)
**Body Font:** SF Pro Text via `-apple-system` (Inter, Segoe UI, Roboto fallbacks)
**Label/Mono Font:** `ui-monospace` / SF Mono, for literal filenames and code only

**Character:** One family doing all the work, the way Apple's own software does: heavy, tightly tracked headlines over a calm 14px text size, with numbers set in tabular figures so measurements align and never jitter.

### Hierarchy
- **Display** (700, `clamp(44px, 7.4vw, 84px)`, 1.02, -0.04em): the landing hero headline only.
- **Headline** (700, `clamp(32px, 4.4vw, 52px)`, 1.06, -0.038em): landing section heads. The closing CTA heading runs larger (up to 64px, -0.04em); the Setup heading is 40px / 32px on tablet.
- **Title** (700, 22px, -0.025em): sheet titles; bento tile heads (24px) and timeline steps (21px) sit on the same step.
- **Title small** (650, 15px, 1.25, -0.015em): inspector heading, empty-state heading.
- **Readout** (650, 26px, -0.03em, tabular): the hero number in an inspector section (bin height); Setup inputs use 24px / 600.
- **Lede** (400, `clamp(17px, 1.4vw, 19px)`, 1.5, `ink-3`): text under a headline; hero sub runs to 21px. Max line length 54 to 46ch.
- **Body** (400, 14px, 1.45): the root size of the app.
- **Label** (500, 13px, -0.005em): buttons, segmented items, crumbs, section titles (600).
- **Caption** (400 to 600, 11 to 12px, `ink-3`): meta lines, status bar, dock labels (10px / 600), badges (11px / 600).

### Named Rules
**The Tabular Rule.** Every measurement (mm, U, counts, zoom %) is set in the UI face with `font-variant-numeric: tabular-nums` (`.num`). Monospace is reserved for literal filenames and code, such as the STL names inside the export ZIP.

**The Tightening Rule.** Tracking tightens as size grows: about -0.01em at 14px, -0.025em at 22px, -0.038em at 52px, -0.04em at 84px. Small text (10 to 11px labels) stays at 0 to +0.01em. No uppercase labels; hierarchy comes from weight and ink step.

## Layout

The editor is a full-height column: a 52px toolbar (three-column grid: wordmark and step crumbs left, 2D/3D segmented control centred, actions right), a workspace row (canvas stage plus a 320px inspector on the right), and a 30px status bar. The canvas centres the baseplate inside generous padding (84px sides, 132px bottom to clear the dock). Floating chrome is pinned 16 to 18px from the stage edges: dock bottom-centre, zoom bottom-left, filament swatches top-right, 3D picture-in-picture bottom-right.

Responsive behaviour: below 1100px the inspector becomes a slide-over sheet (inset 12px, `rounded.xl`, `shadow-4`) and the dock and swatches re-centre around it; below 860px the crumbs and PiP hide; below 700px the editor is replaced by a "use a bigger screen" notice. The Setup step is a two-column grid (form 340 to 440px, to-scale diagram fills the rest, 56px gap) that collapses to one column below 960px.

The landing page uses a 1120px max width with a fluid gutter (`spacing.gutter`) and fluid section padding (`spacing.section`). Section heads are centred at 720px max. Features sit in a six-column bento (spans 4/2, 3/3, 3/3) that drops to two columns at 960px and one at 640px. The spec band is a two-column grid inside the navy field.

Spacing has no token scale in CSS; the recorded steps (4, 8, 12, 16, 18, 24px) are the rhythm the build repeats. 18px is the inspector's horizontal gutter, 24px the sheet gutter.

## Elevation & Depth

drawr is lifted, not flat. Depth comes from three layered soft-shadow steps plus translucent material: a small offset shadow for contact and a large, negative-spread, slightly blue-tinted blur for distance. Panels that sit in the page (inspector, status bar) stay flat and divide with hairlines; anything that floats over content gets material and shadow.

### Shadow Vocabulary
- **shadow-1** (`0 1px 1px rgba(0,0,0,.04), 0 1px 3px rgba(0,0,0,.06)`): resting cards, big Setup fields, dimension chips.
- **shadow-2** (`0 1px 2px rgba(0,0,0,.05), 0 6px 16px -4px rgba(0,0,0,.1)`): tooltips, timeline glyphs, small floating marks.
- **shadow-3** (`0 2px 6px rgba(0,0,0,.05), 0 24px 48px -16px rgba(20,24,40,.22)`): floating editor chrome (dock, zoom, swatches, PiP), canvas toasts, card hover, the Setup diagram.
- **shadow-4** (`0 4px 12px rgba(0,0,0,.06), 0 50px 100px -20px rgba(30,36,70,.28), 0 30px 60px -30px rgba(0,0,0,.3)`): sheets, the tablet inspector slide-over, the landing editor mock.
- **Plate shadow** (`0 0 0 1px plate-edge, 0 1px 2px …, 0 24px 60px -24px rgba(20,24,40,.25)`): the baseplate on the canvas, lit like a product on a table.

### Named Rules
**The Float Rule.** Anything floating over the canvas or page is translucent material: `chrome` background, `backdrop-filter: saturate(180%) blur(20px)`, `shadow-3`, and a 0.5px `line-strong` ring. Toolbars and the landing nav use the same material without the shadow.

**The Hairline Rule.** Containers are defined by 0.5 to 1px translucent rings (`box-shadow: 0 0 0 1px var(--line)`) or `line-2` dividers, not opaque borders. Grouped rows divide with `line-2` between items, never around the outside of each.

## Shapes

Soft, continuous corners throughout, with radii stepping down as elements nest (sheet 20, card 14, field 10, icon button 8, badge 6, inner cavity 6 to 7). Actions are pills; tools are rounded squares. Bins are 9px rounded bodies with a 6px inset cavity, sitting 3px inside their sockets so the grid always shows. Circles are reserved for swatches, switch thumbs, slider thumbs and the round sheet-close button.

The brand mark is a 24px rounded square (6.5 radius) seen from above: four cells, one filled with `accent`, the others in `bg`. The landing hero field is clipped to a skewed quadrilateral (`clip-path: polygon(0 34%, 100% 6%, 100% 74%, 0 100%)`).

**The Pill Rule.** Text buttons, chips, tooltips, toasts and the zoom control are full pills (`rounded.pill`). Icon-only buttons are 32px squares at `rounded.sm`. Never mix the two shapes on one control.

## Components

### Buttons
Quiet, compact, Apple-native.
- **Shape:** full pill (999px), 32px tall, 13px / 500 label, 6px icon gap.
- **Primary:** `accent` fill, white label; hover `accent-hover`, press `accent-press`. One per view. Large variant is 44px tall with 22px padding and a 15px label (landing CTAs, Setup continue).
- **Secondary:** `fill` background, `ink` label; hover `fill-2`.
- **Plain:** transparent with `accent-ink` label; hover tints `accent-soft`.
- **Icon:** 32px rounded square, `ink-2` glyph; hover `fill`. A `danger` variant hovers to `bad-soft` / `bad-ink`.
- **Press / Disabled:** every button scales to 0.97 on press; disabled drops to 40% opacity.

### Segmented Control
An iOS segmented control: `fill` track (9px radius, 2px inset), 28px items (24px in the `sm` size, 32px in Setup), selected item lifts onto a white `chrome-solid` thumb with a tiny shadow and 600 weight. Used for 2D/3D, mm/units, and inspector choices.

### Switch
iOS switch, 38 by 23px: `fill-2` track, white 19px thumb with a soft drop shadow, on-state `ok` green. The thumb moves on the spring curve over `t-med`.

### Inputs / Fields
- **Field:** 36px, `fill` background, `rounded.md`, transparent 1px border. Focus switches to `paper`, an `accent` border and a 3px `accent-ring` halo.
- **Big field (Setup):** 56px, `paper` with a hairline ring and `shadow-1`, 24px / 600 numeric input with a trailing `ink-3` unit. Focus is a 1.5px accent ring plus a 5px halo.
- **Stepper:** 34px `fill` bar with 34px minus/plus buttons and a centred 14px / 600 value.
- **Range:** 4px track filled `accent` to the value, 22px white thumb that scales to 1.1 while dragging.

### Chips and Badges
- **Category chip:** 30px pill, `fill` / `ink-2`; selected inverts to `ink` / `bg` (selection by contrast, not blue, because these are filters, not actions).
- **Badge:** 20px, `rounded.xs`, 11px / 600, tinted by meaning: neutral `fill`, `ok`, `accent`, `warn`, `bad`, each a soft fill with its ink.

### Cards / Containers
- **Library card:** `paper`, `rounded.lg`, hairline ring plus `shadow-1`; hover rises 2px to `shadow-3`. 4:3 thumbnail on `fill`, 12 to 14px body padding.
- **Grouped rows:** iOS inset list: `paper-2`, `rounded.md`, `line-2` ring, 44px rows with icon, label (13.5px) and description (11.5px `ink-3`), divided by `line-2`.
- **Bento tile (landing):** `paper`, 24px radius, 30px padding, 0.5px ring, a 24px / 700 heading and 15px `ink-3` body above a live miniature of the product.
- **Callout:** `rounded.md`, 10 by 12px padding, soft semantic fill with matching ink.

### Sheets
Modal dialogs are sheets: a blurred `scrim` (6px blur), a `paper` panel at `rounded.xl` with `shadow-4`, a header with a 22px / 700 title, 13px `ink-3` subtitle and a round 30px close button on `fill`, a scrolling body with 24px gutters, and a `paper-2` footer above a `line-2` divider. Entry animates `sheet-in` (14px rise, 0.985 scale) over `t-slow`. Escape and scrim click close; focus moves in and returns on close.

### Navigation
- **Editor toolbar:** 52px translucent material with a bottom hairline. Step crumbs (Setup › Design › Export) are 28px ghost buttons in `ink-3`; the current step is `ink` / 600. A tabular drawer size (`ink-3`, 12px) trails the crumbs.
- **Dock:** floating material bar (16px radius, 5px padding) of 46px tool buttons with a 10px / 600 label under each glyph; the active tool is `accent-soft` with `accent-ink`.
- **Landing nav:** sticky 52px material bar; the hairline appears only once scrolled. 13px `ink-2` links and one primary pill.
- **Status bar:** 30px `paper` strip, 11.5px `ink-3` with `ink` values, a 64px usage meter and a state dot (`ok` when ready).

### The Bin (signature component)
The part, drawn as a lit solid from its filament: body gradient `face → side` (170deg), cavity gradient `deep → side`, compartment dividers in `face`, and the size label in the filament's `ink` with tabular figures. Bins sit 3px inside sockets, rise 1px on hover, and seat with the `seat` keyframe (drop from -6px at 1.04 scale, 420ms spring). Selection is a 2px plate-coloured gap, then a 4px `accent` ring with a blue-tinted lift. While drawing, a dashed 1.5px `accent` ghost on `accent-soft` previews the footprint; a blocked placement turns the ghost `bad` and raises an inverted pill toast.

### Dimension Annotations (signature component)
Stripe-style drafting: a centred 11px `ink-3` tabular label with `line-strong` leader lines and end caps, set outside the plate on the top and left edges. The landing isometric scene and Setup diagram use the same grammar; on the landing gradient the label sits on a `paper` chip with `shadow-1`.

### Spec Band (signature component)
Full-bleed `deep` section: copy on the left (17px `on-deep-2` body), a ruled spec table (rows divided by 10% white hairlines, `on-deep-2` headers, `on-deep` tabular values), and a `deep-2` inset figure drawing the bin-foot profile in a pale blue stroke with the critical dimension in Sun.

## Do's and Don'ts

### Do:
- **Do** let the drawer be the largest, most lit object on any surface; chrome sits in greyscale around it.
- **Do** colour parts from `FILAMENTS` in `frontend/src/lib/filament.ts` using all four shades (face, side, deep, ink) so a part reads as a solid.
- **Do** set every measurement with `.num` (tabular figures in the UI face) and show units (mm, U) beside the value in `ink-3`.
- **Do** use pills for text actions, 32px rounded squares for icon tools, iOS switches for booleans, segmented controls for 2 to 4 exclusive choices, and sheets for modal tasks.
- **Do** float over-canvas chrome as translucent material: `chrome` + `saturate(180%) blur(20px)` + `shadow-3` + 0.5px `line-strong` ring.
- **Do** animate placement with drop-and-seat on `--ease-spring`, and everything else with `--ease-out` at `--t-fast` (140ms), `--t-med` (260ms) or `--t-slow` (520ms). Respect `prefers-reduced-motion`.
- **Do** define every new colour as a token on `:root` with a dark-theme value in the `prefers-color-scheme: dark` block.
- **Do** write the product name as lowercase **drawr**, always.

### Don't:
- **Don't** put filament colours (or any saturated hue besides `accent` and the semantic set) on interface chrome, text or icons.
- **Don't** show more than one filled `accent` button in a view, or use blue for anything that is not interactive or selected.
- **Don't** use monospace for numbers or measurements; mono is for filenames and code only.
- **Don't** use opaque 1px grey borders around containers; use translucent hairline rings and `line-2` dividers.
- **Don't** add uppercase eyebrow or kicker labels above headings; hierarchy comes from size, weight and ink.
- **Don't** use the navy `deep` band inside the editor or as a general dark theme.
- **Don't** hard-code hex values in components; reference the `:root` tokens or the filament table.
