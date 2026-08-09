# UX Audit & Refactoring Report: Instascrape Interface & Controls

Detailed report generated and saved to Artifacts: [investigation.md](file:///C:/Users/kochi/.gemini/antigravity-ide/brain/e95dc07d-daa2-4cd8-94ef-8e3afb9dbf57/investigation.md)

## Summary of Recommendations

1. **Header Toolbar & Action Placement (Jakob's & Fitts's Law):**
   - Move action buttons (`Node Canvas`, `Staging Drawer`, `Save Template`) out of the site breadcrumb header into a dedicated subheader toolbar attached directly to the active workspace canvas.

2. **Primary Call to Action (Fitts's & Von Restorff Effect):**
   - Relocate `Generate Carousel` from the bottom of the left scrolling panel into a **sticky bottom control bar** (or anchored floating pill) so it remains accessible at all times without scrolling.

3. **Progressive Disclosure & Cognitive Load (Hick's & Miller's Law):**
   - Split `StudioConfigurator` into **Essentials** (URLs, Title, Preset Style) and **Advanced Micro-tuning** (Accordion/Collapsible for noise opacity, padding, colors, aspect ratio details).

4. **Live Preview Toolbar Alignment (Peak-End Rule):**
   - Replace stacked preview header buttons with a compact **Floating Glass Segmented Control overlay** directly on top of the preview canvas card.
