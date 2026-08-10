---
name: mobile-tablet-responsive-guidelines
description: Standardized rules, layout principles, theme adaptation, button sizing, and verification checklist for mobile and tablet responsiveness across InstaScrape Studio components. Use when designing, refactoring, or auditing UI components for small to medium viewports (< md).
---

# Mobile & Tablet Responsiveness Guidelines

This skill encapsulates the exact design patterns, responsive layout rules, theme-adaptive styling, button sizing, and verification checks established for InstaScrape Studio on mobile (`< sm`) and tablet (`< md`) viewports.

---

## 1. Core Principles

1. **Flush Edge Viewports (`SidebarInset`)**:
   - On mobile/tablet (`< md`), remove outer frame borders (`border-0 md:border md:border-border`), inner borders (`border-0 md:border md:border-border/50`), outer margins, and border radii (`rounded-none md:rounded-[calc(var(--radius-xl)-4px)]`).
   - Allow content cards to touch screen boundaries cleanly without nested frame double-borders.

2. **Standardized Action Button Height (`h-9` / 36px)**:
   - All card action buttons (`Download ZIP`, `Folder`, `Apply`, `Preview`, `Copy`, `Delete`) must use standard height `h-9` (36px) with `rounded-lg` corners.
   - Avoid oversized `h-11` (44px) buttons to maintain consistent visual hierarchy across the application.

3. **50/50 Mobile Action Button Grid (`grid-cols-2`)**:
   - Action buttons paired in headers or toolbars (e.g., *Edit Raw URLs* & *Import File*, *Node Canvas* & *Staging Drawer*) must render in a 2-column 50%/50% grid on mobile (`grid grid-cols-2 gap-2 w-full sm:flex sm:w-auto`).

4. **Header Subtext & Mode Switcher Wrapping (`whitespace-nowrap`)**:
   - Headers containing subtext or mode switchers (*Active Carousel Batches*, *Raw Slide View* vs *Instagram Feed Frame*) must stack vertically on mobile (`flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 w-full`).
   - Button text labels must use `whitespace-nowrap` to prevent awkward multi-line text wrapping on small viewports.

5. **Standardized `rounded-[6px]` Active Pill Switchers (`border-radius: 6px;`)**:
   - Outer capsule wrappers must use fixed `h-9` height (`h-9 p-0.5 rounded-xl border border-border dark:border-[#27272A] bg-muted/60 dark:bg-[#09090B] w-full flex items-center gap-0.5`).
   - Inner active tab buttons, status filters, view mode icons, and aspect ratio toggles must fill full container height (`h-full flex-1 rounded-[6px]`) with `rounded-[6px]` (`border-radius: 6px;`) to prevent floating pill artifacts.

6. **Control Bar Stacking & Aspect Ratio Scroll**:
   - Control bars containing Search inputs, Filter tabs, Sort dropdowns, and View mode switchers must stack vertically on small screens (`flex flex-col md:flex-row gap-3 w-full`).
   - Aspect ratio selector cards must scroll horizontally on mobile (`overflow-x-auto scrollbar-hide shrink-0 min-w-0`) with `min-w-[64px]` per card to prevent text truncation.

7. **Light & Dark Mode Theme Adaptation**:
   - Every control bar, input field, card container, and action button must use theme-adaptive Tailwind classes (`bg-background dark:bg-[#09090B]`, `text-foreground dark:text-white`, `border-border dark:border-[#27272A]`).
   - **Card Gradients**:
     - **Light Mode**: Top gradient stop starts with crisp white (`rgba(255,255,255,0.95)` / `#FFFFFF`) fading down to a soft 12% accent color tint (`rgba(..., 0.12)`). Never hardcode dark `#18181B` headers on Light Mode cards.
     - **Dark Mode**: Top gradient stop starts with `#18181B` fading down to a 20% accent color tint.

8. **Table Column Header Alignment**:
   - Table header row containers must mirror exact row cell column width classes (`w-full sm:w-[320px]`, `w-55`, `w-45`, `w-35`) to guarantee pixel-perfect column title alignment across viewports.

9. **Kinetic Inertial Dragging**:
   - Horizontal draggable carousels (e.g., *Active Carousel Batches*) must feature smooth `requestAnimationFrame` momentum velocity decay (`velocityRef.current *= 0.92`) on mouse release for fluid inertial scrolling.

10. **Aspect-Ratio Square Day Cells (`OutputsCalendarView`)**:
    - Calendar grid day cells on mobile and tablet must use `aspect-square md:aspect-auto md:min-h-[95px]`.
    - Grid spacing on mobile should be compact (`gap-1 sm:gap-1.5 min-h-0 md:min-h-[480px]`) so day cells render as square boxes without stretching into awkward vertical oblongs.

11. **Modal & Drawer Boundaries (`SheetContent` & `DialogContent`)**:
    - Slide drawers and modal sheets must be bounded to `max-w-[calc(100vw-1rem)]` on mobile/tablet viewports.
    - Side sheets must attach flush to screen edges (`top-0 sm:top-2.5 bottom-0 sm:bottom-2.5 right-0 sm:right-2.5 h-full sm:h-[calc(100vh-20px)] rounded-none sm:rounded-[var(--radius-xl)]`) to prevent horizontal screen clipping.

---

## 2. Standardized Control Bar & Mode Switcher Markup Pattern

All status/category filter pill groups and view mode switchers across `/outputs`, `/templates`, `/backgrounds`, `/fonts`, and `/studio` must mirror the exact responsive capsule structure:

```tsx
{/* Standardized Responsive Mode Switcher Capsule */}
<div className="flex items-center h-9 p-0.5 bg-muted/60 dark:bg-[#09090B] border border-border dark:border-[#27272A] rounded-xl w-full gap-0.5">
  <button
    type="button"
    onClick={() => setViewMode("raw")}
    className={`flex-1 h-full flex items-center justify-center gap-1.5 text-xs font-semibold px-3 rounded-[6px] transition-all cursor-pointer whitespace-nowrap ${
      viewMode === "raw"
        ? "bg-background dark:bg-[#18181B] text-foreground dark:text-white font-extrabold shadow-xs"
        : "text-muted-foreground dark:text-[#A1A1AA] hover:text-foreground dark:hover:text-white"
    }`}
  >
    <Monitor className="w-3.5 h-3.5 shrink-0" />
    <span>Raw Slide View</span>
  </button>
  
  <button
    type="button"
    onClick={() => setViewMode("instagram")}
    className={`flex-1 h-full flex items-center justify-center gap-1.5 text-xs font-semibold px-3 rounded-[6px] transition-all cursor-pointer whitespace-nowrap ${
      viewMode === "instagram"
        ? "bg-background dark:bg-[#18181B] text-foreground dark:text-white font-extrabold shadow-xs"
        : "text-muted-foreground dark:text-[#A1A1AA] hover:text-foreground dark:hover:text-white"
    }`}
  >
    <Smartphone className="w-3.5 h-3.5 shrink-0" />
    <span>Instagram Feed Frame</span>
  </button>
</div>
```

---

## 3. Responsive Inspection Checklist

When making layout changes or building new views, perform the following verification steps:

- [ ] **Viewport Check**: Test at 375px (mobile), 768px (tablet), and 1280px+ (desktop).
- [ ] **No Horizontal Scroll**: Ensure `document.documentElement.clientWidth` equals `window.innerWidth` with zero horizontal overflow.
- [ ] **SidebarInset Inset Removal**: Verify `SidebarInset` outer borders and padding are removed on `< md` viewports.
- [ ] **Standard Action Button Sizing**: Ensure action buttons use `h-9` height with `rounded-lg` corners (never `h-11`).
- [ ] **50/50 Mobile Button Grid**: Verify paired header buttons use `grid grid-cols-2 w-full` on mobile.
- [ ] **Mode Switcher Height & Rounding**: Ensure capsule is fixed `h-9` and active button is `h-full rounded-[6px]`.
- [ ] **Whitespace Nowrap**: Verify mode switcher and header subtext labels use `whitespace-nowrap`.
- [ ] **6px Active Pill Rounding**: Ensure active tab buttons and toggles use `rounded-[6px]` (`border-radius: 6px;`).
- [ ] **Light & Dark Theme Gradients**: Verify Light Mode cards start with clean `#FFFFFF` top stops instead of pitch dark `#18181B`.
- [ ] **Table Column Width Alignment**: Check that table header containers use identical width classes as row cells.
- [ ] **Kinetic Dragging**: Test horizontal carousels for smooth momentum scrolling on mouse drag release.
- [ ] **Outputs Calendar Grid**: Verify calendar day cells remain square boxes on mobile/tablet.
- [ ] **Modals & Drawers**: Open inspect drawers and lightbox modals on 375px width; verify zero screen overflow.
