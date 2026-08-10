## Overview

InstaScrape Studio (`INSTAS`) feels like a high-precision, cyber-clean design automation workstation. Built as a dark-first SaaS canvas, the default floor is a deep, neutral dark `{colors.background}` (`oklch(0.145 0 0)`) accented by glowing violet highlights (`{colors.accent-glow}` `rgba(124, 92, 252, 0.4)`), razor-thin semi-transparent borders (`{colors.border}` `oklch(1 0 0 / 10%)`), and crisp high-contrast typography `{colors.foreground}` (`oklch(0.985 0 0)`).

The design system powers both the **Studio Application UI** and the **Generated Instagram Carousel Output Slides**. Visual atmosphere is driven by customizable ambient background gradients, procedural fractal noise overlays, glassmorphic backdrop blurs, and instant audio-tactile feedback.

Typography bridges technical precision with modern web editorial voice: **Space Grotesk** carries display headings and brand badges, while **Geist** and **Inter** power the studio engine, controls, and body text. A dynamic `@font-face` injection system allows custom uploaded typography to render live inside generated slides.

Primary controls feature tactile scale animations (`active:scale-[0.97]`), clean rounded radii (`{radius.lg}` 10px to `{rounded.pill}`), and dual preview modes (**Raw Slide Canvas** vs. **Instagram Mobile Feed Frame**).

**Key Characteristics:**
- Canonical UI Design Specification: Paper Node ID `44D-0` ("Frame" artboard - 1910×945px).
- Dark-first studio floor with OKLCH color space for smooth perceptual gradients and clean light/dark mode parity.
- Accent voltage: Violet/purple glow (`rgba(124, 92, 252)`) paired with high-contrast neutral cards and borders.
- Display typography runs **Space Grotesk** (weight 600/700) for headlines and brand tags.
- UI & Body runs **Geist** / **Inter** for clean code, form controls, data tables, and navigation.
- Multi-Aspect Ratio layout engine (`4:5`, `1:1`, `9:16`, `16:9`, `linkedin-pdf`) with auto-repositioning element presets.
- Micro-glassmorphism and procedural SVG noise texture overlays (`noiseOpacity` 0.04 to 0.08).
- Multi-tier curvature scale built around `--radius: 0.625rem` (10px).
- Embedded web-audio feedback system providing sound effects on button clicks and mode toggles.

## Colors

### Brand & Accent
- **Primary** (`{colors.primary}` — `oklch(0.205 0 0)` light / `oklch(0.922 0 0)` dark): Main action button and highlight state color.
- **Primary Foreground** (`{colors.primary-foreground}` — `oklch(0.985 0 0)` light / `oklch(0.205 0 0)` dark): Text on primary buttons.
- **Accent** (`{colors.accent}` — `oklch(0.96 0 0)` light / `oklch(0.269 0 0)` dark): Interactive hover states and tag highlights.
- **Accent Glow** (`{colors.accent-glow}` — `rgba(124, 92, 252, 0.25)` light / `rgba(124, 92, 252, 0.4)` dark): Subtle background ambient glow and active slider thumb shadows.

### Surface
- **Background** (`{colors.background}` — `oklch(0.985 0 0)` light / `oklch(0.145 0 0)` dark): Application base canvas floor.
- **Card** (`{colors.card}` — `oklch(1 0 0)` light / `oklch(0.205 0 0)` dark): Elevated component container background.
- **Surface** (`{colors.surface}` — `oklch(0.97 0 0)` light / `oklch(0.205 0 0)` dark): Secondary container floor.
- **Surface Hover** (`{colors.surface-hover}` — `oklch(0.94 0 0)` light / `oklch(0.269 0 0)` dark): Hover state for list rows and card panels.
- **Popover** (`{colors.popover}` — `oklch(1 0 0)` light / `oklch(0.205 0 0)` dark): Floating dialogs and dropdown menus.
- **Sidebar** (`{colors.sidebar}` — `oklch(0.975 0 0)` light / `oklch(0.205 0 0)` dark): Navigation sidebar background.
- **Sidebar Accent** (`{colors.sidebar-accent}` — `oklch(0.95 0 0)` light / `oklch(0.269 0 0)` dark): Active menu item highlight in sidebar.

### Hairlines & Borders
- **Border** (`{colors.border}` — `oklch(0.90 0 0)` light / `oklch(1 0 0 / 10%)` dark): Default 1px structural container divider.
- **Border Strong** (`{colors.border-strong}` — `oklch(0.85 0 0)` light / `oklch(0.3 0 0)` dark): Emphasized panel edge and slider track background.
- **Input Border** (`{colors.input}` — `oklch(0.90 0 0)` light / `oklch(1 0 0 / 15%)` dark): Form input outlines.
- **Ring** (`{colors.ring}` — `oklch(0.708 0 0)` light / `oklch(0.556 0 0)` dark): Focus ring ring-3 highlight.

### Text & Foreground
- **Foreground** (`{colors.foreground}` — `oklch(0.145 0 0)` light / `oklch(0.985 0 0)` dark): Primary text and icon color.
- **Muted Foreground** (`{colors.muted-foreground}` — `oklch(0.48 0 0)` light / `oklch(0.708 0 0)` dark): Secondary labels, helper text, and placeholders.
- **Card Foreground** (`{colors.card-foreground}` — `oklch(0.145 0 0)` light / `oklch(0.985 0 0)` dark): Text inside cards.
- **Sidebar Foreground** (`{colors.sidebar-foreground}` — `oklch(0.145 0 0)` light / `oklch(0.985 0 0)` dark): Text inside navigation menu.

### Custom Ambient Background Presets (Carousel Engine Signature)
- **Teal Burst** (`54-teal-burst-noise.jpg`): Vibrant teal radial flare with fine noise grain.
- **Warm Sunset** (`56-warm-sunset-gradient.jpg`): Smooth orange-to-magenta twilight gradient.
- **Blue Velvet** (`50-blue-velvet-light-reflection.jpg`): Deep navy background with subtle specular reflection.
- **Red Orange Cosmic** (`60-red-orange-cosmic-gradient.jpg`): Atmospheric high-energy crimson aura.
- **Purple Horizontal Glow** (`57-purple-horizontal-glow.jpg`): Deep violet beam background tailored for tech roundup posts.

### Semantic
- **Destructive** (`{colors.destructive}` — `oklch(0.577 0.245 27.325)` light / `oklch(0.704 0.191 22.216)` dark): Error state, delete action, destructive buttons.
- **Chart 1–5**: Data visualization series palette (`oklch(0.87)` to `oklch(0.269)`).

## Typography

### Font Family
- **Geist** (`--font-sans`): Primary sans-serif font for UI controls, inputs, data tables, and sidebar navigation.
- **Space Grotesk** (`--font-heading`): Display typeface for headers, slide title presets, and brand badges.
- **Dynamic Uploaded Fonts**: Custom font system supporting user-uploaded `.woff2`, `.woff`, `.ttf`, `.otf` fonts (e.g. Inter, Nothing OS font) with automatic `@font-face` injection into slide renderer.

### Hierarchy

| Token | Size | Weight | Line Height | Letter Spacing | Use |
|---|---|---|---|---|---|
| `{typography.display-hero}` | 32px / 36px | 800 | 1.08 | -0.02em | Studio preview cover title |
| `{typography.display-lg}` | 24px / 28px | 700 | 1.15 | -0.015em | Section header titles |
| `{typography.title-card}` | 18px / 20px | 600 | 1.25 | -0.01em | Card and modal titles |
| `{typography.title-sm}` | 14px / 16px | 600 | 1.3 | 0 | Group labels, form section titles |
| `{typography.body-md}` | 14px | 400 / 500 | 1.5 | 0 | Default body & form inputs |
| `{typography.body-sm}` | 13px | 400 | 1.4 | 0 | Subtitle text, table data |
| `{typography.caption}` | 12px | 500 | 1.4 | 0.02em | Badges, tags, status pills |
| `{typography.caption-mono}` | 10px / 11px | 600 | 1.2 | 0.05em | Aspect ratio indicators, site URLs, handle tags |

### Principles
- **Space Grotesk for Brand Statements:** Use Space Grotesk on hero titles, logo badges (`INSTAS`), and template headers for a tech-forward look.
- **Geist for Interface Density:** UI forms, configurator tabs, and data tables stay on Geist for maximum legibility at small sizes.
- **Proportional Reflow on Slides:** Slide titles automatically adjust vertical positioning (`titleTop`, `subtitleTop`, `urlPillTop`) depending on selected aspect ratio (`4:5`, `1:1`, `9:16`, `16:9`).

## Layout

### Spacing System
- **Base Unit:** 4px (Tailwind standard `--spacing`).
- **Tokens:** `{spacing.1}` (4px) · `{spacing.2}` (8px) · `{spacing.3}` (12px) · `{spacing.4}` (16px) · `{spacing.6}` (24px) · `{spacing.8}` (32px) · `{spacing.12}` (48px) · `{spacing.16}` (64px).
- **Sidebar Width:** 256px (`calc(var(--spacing) * 64)`).
- **Header Height:** 64px (`calc(var(--spacing) * 16)`).

### Aspect Ratio & Dimension Map

| Format | Dimensions | Viewport Target | Layout Use Case |
|---|---|---|---|
| `4:5` | 1080 × 1350 px | Portrait | Standard Instagram Carousel |
| `1:1` | 1080 × 1080 px | Square | Square Feed Carousel |
| `9:16` | 1080 × 1920 px | Tall Vertical | IG Stories / Reels / TikTok |
| `16:9` | 1920 × 1080 px | Landscape | Presentation / YouTube Community |
| `linkedin-pdf` | 1080 × 1350 px | Document PDF | LinkedIn Document Carousel |

### Grid & Container
- Studio Generator grid: 2-column responsive layout (`lg:grid-cols-[1fr_420px]`, `xl:grid-cols-[1fr_480px]`, `2xl:grid-cols-[1fr_540px]`).
- Left column holds scrollable `StudioConfigurator` form panels and batch queue status.
- Right column holds sticky `GenerationPreview` with live slide frame.

## Elevation & Depth

InstaScrape combines **thin ring highlights, micro shadows, glassmorphism, and noise overlays**.

| Level | Treatment | Use |
|---|---|---|
| Flat Canvas | `{colors.background}` (`oklch(0.145 0 0)`) | App shell background |
| Inset Card | `{colors.card}` + `ring-1 ring-foreground/10` | Studio configuration cards |
| Floating Drawer | `bg-background/95 backdrop-blur-md` | Staging drawer, template manager |
| Noise Layer | SVG fractal noise overlay (`mix-blend-overlay`, 4–8% opacity) | Slide canvas texture depth |
| Glass Backdrop | `backdrop-blur-md` (`10px`–`24px`) | Glassmorphism ambient slide templates |
| Highlight Glow | `box-shadow: 0 0 8px var(--accent-glow)` | Range slider thumbs, active toggle tracks |

## Shapes

### Border Radius Scale (`--radius: 0.625rem` / 10px)

| Token | Value | Applied Elements |
|---|---|---|
| `{rounded.none}` | 0px | Raw slide view outer container option |
| `{rounded.sm}` | 6px (`calc(var(--radius) * 0.6)`) | Compact buttons, inner badges, range track ends |
| `{rounded.md}` | 8px (`calc(var(--radius) * 0.8)`) | Standard form inputs, toggle tracks, toolbar buttons |
| `{rounded.lg}` | 10px (`var(--radius)`) | Primary buttons, dropdown menus, sidebar items |
| `{rounded.xl}` | 12px (`calc(var(--radius) * 0.9)`) | Standard slide screenshot frames, cards |
| `{rounded.2xl}` | 14px (`calc(var(--radius) * 1.4)`) | IG Feed mobile frame container |
| `{rounded.3xl}` | 18px (`calc(var(--radius) * 1.8)`) | Feature highlight panels, glass cards |
| `{rounded.4xl}` | 22px (`calc(var(--radius) * 2.2)`) | Outer card framing containers |
| `{rounded.pill}` | 9999px | Category chips, status badges, URL pill tags |

## Components

### Site Header (`site-header`)
- Top bar (height 64px) with breadcrumbs, quick stack presets ("Tech Stack", "UI Kit Stack", "AI Tools Stack"), URL count badge, view mode toggle ("Form" vs "Canvas"), and batch action buttons.

### Sidebar Navigation (`app-sidebar`)
- Left inset sidebar (width 256px) holding the `INSTAS` logo mark, core tab items (Studio Generator, Outputs Gallery, Design Templates, Custom Backgrounds, Custom Fonts), Archive Library link, and current user avatar.

### Buttons (`button`)
- **`variant="default"`**: Solid primary pill/button (`bg-primary text-primary-foreground hover:bg-primary/80`).
- **`variant="outline"`**: Hairline outline button (`border-border bg-background hover:bg-muted`).
- **`variant="secondary"`**: Subtle surface action (`bg-secondary text-secondary-foreground`).
- **`variant="ghost"`**: Transparent text button with subtle hover highlight.
- **`variant="destructive"`**: Muted red surface (`bg-destructive/10 text-destructive`).
- **Interactive tactile effect**: `active:scale-[0.97]` transform with web-audio click trigger.

### Cards (`card`, `frame`)
- **`Card`**: Structured container with `ring-1 ring-foreground/10`, rounded 12px (`rounded-xl`), holding `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, and `CardFooter`.
- **`Frame`**: High-density panel component (`FramePanel`) with customizable variant borders and spacing.

### Generation Preview (`generation-preview`)
- Dual-mode preview component:
  - **Raw Slide View**: Pure pixel-perfect slide canvas rendering cover title, subtitle, handles, background preset, and screenshot placement.
  - **Instagram Feed Frame**: Real-world IG post preview with gradient avatar ring, handle, sponsored badge, swipe dots, like/comment/share icons, and hashtag captions.

### Form Inputs & Controls
- **`input` / `textarea`**: Clean border ring with `focus-visible:ring-3 focus-visible:ring-ring/50`.
- **`slider`**: Custom styled range slider with 4px track (`var(--border-strong)`) and glowing 16px circular thumb with hover scale (`scale(1.2)`).
- **`toggle`**: 40×22px track with smooth 16px sliding thumb (`transform: translateX(18px)`).
- **`chip`**: 20px rounded pill tag (`bg-[rgba(124,92,252,0.12)] border border-[rgba(124,92,252,0.25)]`).

### Audio Sound Effects (`sound-provider`)
- Integrated audio synthesis feedback using `use-sound` library for user actions (button clicks, tab switches, batch queue triggers).

## Do's and Don'ts

### Do
- Always use CSS variables (`var(--background)`, `var(--primary)`, `var(--accent-glow)`) instead of hardcoded hex values in UI components.
- Maintain Space Grotesk for slide display titles and brand badges, Geist for UI forms and data tables.
- Respect aspect ratio layout presets (`4:5`, `1:1`, `9:16`, `16:9`) when recalculating screenshot and text top positions.
- Enforce active touch feedback (`active:scale-[0.97]`) on interactive buttons.
- Keep SVG noise opacity between 0.04 and 0.08 on slide canvas overlays.

### Don't
- Don't use bright saturated neon colors for background panels — rely on dark OKLCH surface tones and accent glows.
- Don't hardcode static pixel values for slide position reflow without referencing `ASPECT_RATIO_LAYOUT_PRESETS`.
- Don't mix sharp `rounded-none` edges on primary UI controls unless explicitly using the stark minimal template.
- Don't disable focus-visible outlines on keyboard navigation.

## Responsive Behavior

### Breakpoints

| Name | Width | Layout Adaptation |
|---|---|---|
| Mobile | < 640px | Sidebar collapses to sheet drawer; single column configurator; scaled preview. |
| Tablet | 640–1024px | Configurator forms stack vertically above preview canvas. |
| Desktop | 1024–1280px | 2-column split (Configurator left, sticky Preview right 420px width). |
| Wide | > 1280px | Expanded preview column (480px – 540px width). |

### Collapsing Strategy
- Sidebar switches to offcanvas drawer (`collapsible="offcanvas"`).
- Studio configurator grid collapses to single column on mobile/tablet viewports.
- Instagram feed frame scales dynamically with CSS container queries.

## Iteration Guide

1. Define design tokens in `app/globals.css` using OKLCH color scale and CSS variables.
2. Register reusable UI primitives inside `components/ui/` using standard `cva` variants and Radix / Base UI props.
3. Test slide output layouts against all 5 supported aspect ratios (`4:5`, `1:1`, `9:16`, `16:9`, `linkedin-pdf`).
4. Validate both Raw Slide View and Instagram Mobile Feed Frame in `GenerationPreview`.

## Known Gaps

- PDF multi-page document export relies on Server-Side Chromium / Playwright rendering.
- Live canvas editor drag-and-drop handles (`CanvasFlowEditor`) support visual positioning, while exact layout values are stored in Zustand state.
