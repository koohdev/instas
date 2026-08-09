# UX Audit: Outputs, Templates & Fonts Pages

Complete detailed report generated: [investigation_subpages.md](file:///C:/Users/kochi/.gemini/antigravity-ide/brain/e95dc07d-daa2-4cd8-94ef-8e3afb9dbf57/investigation_subpages.md)

## Key Audit Findings

### 1. Outputs Gallery (`/outputs`)
- **Friction (Hick's Law):** Filters, search, view modes (`Grid`, `Table`, `Calendar`), and sort dropdowns are split across multiple stacked rows.
- **Fix:** Consolidate view mode buttons into a single left-aligned Segmented Control pill, with Search & Status filters aligned to the right.

### 2. Design Templates (`/templates`)
- **Friction (Peak-End Rule & Doherty Threshold):** Clicking "Apply Template" jumps straight to `/dashboard` without highlighting which template is currently active.
- **Fix:** Display an `Active Template` badge and `ring-2 ring-primary` on the active template card, showing a instant feedback toast when applied.

### 3. Custom Fonts (`/fonts`)
- **Friction (Jakob's Law & Fitts's Law):** Changing specimen preview text requires scrolling back up to the top header input. No drag-and-drop file upload target.
- **Fix:** Sticky specimen input bar at top of scroll view + intuitive drag-and-drop dropzone card for `.ttf`/`.woff2` font files.
