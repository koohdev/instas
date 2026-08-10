# Motion and Physics Guidelines

This document provides the standard specifications for motion design, ensuring UI transitions remain purposeful, responsive, and grounded in physical mechanics.

## 1. The Animation Decision Matrix
Before adding any animation, evaluate the interface using these questions:
1.  **Check Frequency:** How often does the user execute this action? If an action occurs 100+ times a day (e.g., list hover, tab switching, input focusing), **remove all complex choreography or hover animations**. Keep animations under `150ms` or use instant `0ms` states to avoid slowing down user workflows.
2.  **Define Purpose:** What spatial context does this change explain? If you cannot articulate why an element is moving, remove the transition. 
3.  **A11y Fallback:** Respect `prefers-reduced-motion`. When reduced motion is enabled on the OS, preserve opacity shifts and instant state updates while entirely stripping out scale, travel, parallax, and overshoot.

## 2. Physical Constants & Constraints
*   **Button Press Sensation:** Scale pressable surfaces down to `scale(0.97)` on the `:active` pseudo-class to acknowledge user input immediately before an action completes.
*   **Gentle Entrances:** Avoid animating elements from a starting scale of `scale(0)`. UI elements resemble the physical world: just like a deflated balloon retains a footprint, interface components should scale up from `scale(0.9)` or higher.
*   **Origin-Aware Scale:** Set CSS `transform-origin` dynamically to the coordinates of the trigger control clicked by the user so the dropdown scales directly from the action source, not from its geometric center.
*   **The 2-Phase Premium Pattern:** For milestones, achievements, or primary modal entrances, split the timeline into two phases instead of using a single easing curve:
    *   **Phase 1 (0% to 65% duration):** Run `easeInOutCubic` to build dramatic, weighted approach acceleration.
    *   **Phase 2 (65% to 100% duration):** Interpolate using `easeOutElastic` to settle with a organic, lifelike overshoot.
*   **Friction and Limits:** When dragging, apply exponential damping resistance when the user moves elements past their bounding limits, rather than stopping the drag abruptly.
*   **State Blending:** When crossfading between two visually distinct layouts, apply a subtle `2px` blur (`filter: blur(2px)`) during the transition to bridge the visual gap and trick the eye into seeing a continuous flow.

## 3. Duration Standards
*   **Micro-interactions (Hover, Press, Toggles):** 100ms – 160ms.
*   **Popovers, Tooltips & Dropdowns:** 125ms – 250ms.
*   **Modals & Drawers:** 200ms – 500ms (to properly explain spatial depth).
