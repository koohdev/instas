# Web Interface Guidelines

These guidelines define the concrete interaction patterns, layout constraints, performance considerations, and copywriting standards required to build elite digital products.

## 1. Interactions & Accessibility
*   **Keyboard Operation:** Every interface flow must be completely keyboard-operable, following the official WAI-ARIA Authoring Patterns.
*   **Focus Rings:** Do not suppress focus indicators. Always use the `:focus-visible` pseudo-class rather than `:focus` to ensure mouse and pointer users do not see distracting outlines, while keyboard navigators receive high-contrast rings. Use `:focus-within` for grouped inputs.
*   **Mobile Viewport Inputs:** Set input font-sizes to at least `16px` on mobile viewports. This prevents iOS Safari from automatically shifting layout scroll alignments and zooming in on focus.
*   **Hit Target Over-sizing:** The physical interactive hit target of any control must be at least `44px` on mobile, and at least `24px` on desktop (even if the visual indicator is smaller than 24px).
*   **Loading-State Etiquette:** To prevent jarring layout flicker on rapid network roundtrips, loading indicators (like spinners and skeletons) must utilize a show-delay (~150–300ms) and enforce a minimum visible duration (~300–500ms). Always keep the button's original text label visible alongside the loading spinner.
*   **Sequential Tooltips:** While the initial tooltip in a layout should have a standard hover delay, once a user has activated it, hovering over subsequent sibling tooltips in that same group must display them instantly with a `0ms` transition duration.
*   **Hydration Integrity:** Form inputs must not lose focus state or dump entered values when React/Next.js client-side hydration occurs.
*   **Semantics over Buttons:** For navigation, always use native `<a>` or framework `<Link>` components. Never use `<button>` or custom styled `<div>` elements for page routing, as this breaks fundamental browser capabilities like middle-clicking or right-clicking to open in a new tab.

## 2. Layout, Visuals & CSS
*   **Nested Border Radii:** Maintain concentricity by calculating radii mathematically: $\text{Child Radius} \le \text{Parent Radius} - \text{Padding}$.
*   **Shadow Construction:** Avoid flat, single-layer box-shadows. Mimic real-world light behaviors by combining at least two layers (an ambient occlusion layer and a direct light shadow).
*   **Contrast Standards:** Strive for perceptual contrast using APCA over WCAG 2 to ensure more precise color accessibility across diverse display panels.
*   **Intrinsic Browser Layouts:** Avoid calculating element sizing in JavaScript. Rely on CSS grid, flexbox, and intrinsic bounds to prevent layout thrashing.
*   **Cumulative Layout Shift (CLS):** Loading skeleton components must mimic the exact visual bounding box of the final loaded data state to prevent layout jumps.
*   **Color Spaces:** On non-neutral surfaces, tint borders, backgrounds, and text layers with the same base hue to prevent muddy contrast.

## 3. Form Submission Rules
*   **Never Pre-disable Submit Buttons:** Do not disable form submission buttons when inputs are incomplete. Let the user click submit so the system can surface native focus validation and point the user directly to the first input error.
*   **Submission Interlocking:** Once submission is active, disable the button to prevent duplicate requests. Show a loading indicator, keep the label, and send an idempotency key to the server.

## 4. Copywriting and Editorial Tone
*   **Tone of Voice:** Default to active, second-person voice (e.g., "Install the CLI" instead of "The CLI will be installed").
*   **Interface Header Casing:** Use strict Title Case for titles and action buttons on application interfaces. Sentence case is reserved strictly for marketing pages.
*   **Numeric Counts:** Always use numerals instead of words for quantities (e.g., "8 deployments" instead of "eight deployments").
*   **Guiding the Exit:** Error messages must never end in a roadblock. Frame them in a positive, constructive manner, telling the user exactly why the error occurred and how to resolve it (e.g., "Your API key is incorrect or expired. Generate a new key in your account settings.").
