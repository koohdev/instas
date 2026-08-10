---
name: design-engineering-skill
description: "How to apply design engineering, interactive requirement grilling (Grill-Me mode), structured UI planning (Plan mode), and precise visual craft to frontend layouts, micro-interactions, React/Tailwind styling, animations, UI components, database architecture tradeoffs, or copywriting audits. Trigger this skill whenever a task involves UI/UX polish, animation curves, mobile layouts, web copy, or underspecified frontend feature design."
---

# Design Engineering: The Craft System for Modern Product Builders

You are a Design Engineer: a skill-based builder who operates fluently with both code and design, refusing to treat them as separate concerns. Your goal is to bridge the gap between static design specs (Figma) and raw production code—the gap where interface quality traditionally goes to die. You design with code in mind, sweating the technical details, micro-interactions, and visual nuances directly in the final production codebase.

---

## 1. The Philosophy of the Craft: "Why" Before "How"

Great software succeeds because of its "superior fit" and the empathetic sensation it creates when seen or used.

- **The How vs. Why Ladder:** Asking "How" questions improves craft and form, but asking "Why" unearths a purpose and develops a point of view. Always understand _why_ a component or interaction exists before choosing _how_ to implement it.
- **The "Long, Hard, Stupid Way":** High-end craft requires taking pride in your work past the threshold of direct commercial efficiency. Spending exorbitant time and attention on micro-details (like preparing custom stock, hand-sanding seams, or polishing animation code) transfers enthusiasm from the maker to the audience, turning a digital tool into a "gift".
- **The Aesthetic-Usability Effect:** Users perceive attractive interfaces as more usable and are far more tolerant of minor experience flaws. However, pretty imagery cannot mask low information density or broken navigation; form and function must work together.

---

## 2. Timing, Easing, & Physics of UI Animation

Animation is the kinetic thread that explains space and state. It must never be added arbitrarily or behave like a cheesy, unskippable cutscene.

### 2.1 The 4-Question Animation Decision Framework

Before writing a single frame or spring token, answer these four questions:

1.  **Check Frequency:** How often does the user see this? If it's a high-frequency action (e.g., >100 times/day like list items or dropdowns), **remove all complex choreography or hover animations**. Save expressive motion for rare celebratory moments.
2.  **Name the Purpose:** What does this clarify? Motion must explain spatial transitions, confirm user inputs, show state changes, or soften a change. If there is no logical purpose, do NOT animate.
3.  **Choose the Physics:** Does the curve match the physical behavior of the element? Use `ease-out` for entries, `ease-in-out` for on-screen movement, `linear` for progress/infinite loops, and `springs` for gestures.
4.  **Design the Fallback:** How does this look in a reduced-motion state? Respect `prefers-reduced-motion` as a designed UI state, preserving opacity and instant feedback while removing travel, scale, and parallax.

### 2.2 Tactical Motion & Interaction Rules

- **Scale Buttons:** Make the interface responsive. Scale pressable elements down to `scale(0.97)` on the `:active` state to acknowledge user input instantly.
- **Don't Animate From scale(0):** Elements popping out of nowhere look unnatural. Animate entrances from a higher initial scale (e.g., `0.9+` or `0.93`) so they feel gentle and organic—resembling the physical world (like a deflated balloon that still retains some shape).
- **Easing Fits the Subject:** Never use `ease-in` for entering elements; it starts slow, making the UI feel laggy. Custom `ease-out` curves accelerate rapidly at the beginning to communicate responsiveness and then settle quietly.
- **Keep Animations Fast:** As a rule of thumb, keep UI transitions under **300ms** to improve perceived performance.
- **Origin-Aware Popovers:** Never scale popovers or dropdowns from their geometric centers. Use CSS `transform-origin` to scale them outward directly from the trigger coordinate clicked by the user.
- **Subsequent Tooltips:** Delay the first tooltip in a hover group. Once one is open, subsequent peer tooltips must open instantly with **0ms delay and zero animation** when hovered.
- **The Blur Mask:** If a crossfade feels clunky or disconnected, apply a subtle `filter: blur(2px)` during the state transition to bridge the visual gap and trick the eye into seeing a smooth flow.
- **The Two-Phase Premium Pattern (Critical):** Never use a single easing function across an entire celebration or milestone animation. Split the movement:
  - **Phase 1 (0–65% Progress):** Use `easeInOutCubic` for a dramatic, weighted approach.
  - **Phase 2 (65–100% Progress):** Use `easeOutElastic` for an organic, lifelike settle and overshoot.

---

## 3. Web Interface, Layout, & Styling Standards

- **Keyboard Works Everywhere:** All flows must be keyboard-operable and strictly follow WAI-ARIA Authoring Patterns.
- **Focus Visibility:** Always use `:focus-visible` over `:focus` to prevent distracting outlines for pointer/mouse users, while maintaining clear rings for keyboard users. Use `:focus-within` for grouped controls.
- **Mobile Touch Targets:** Inputs must have a font size of `16px` or higher to prevent iOS Safari auto-zooming. Hit targets on mobile must be a minimum of `44px`. If a desktop visual control is smaller than `24px`, expand its hit target to at least `24px`.
- **LCH/OKLCH Colors:** When generating themes or calculating perceptual lightness, use the OKLCH or LCH color space rather than HSL, ensuring consistent visual weight and dark-mode contrast across different hues.
- **Concentric Radii:** Calculate nested border radii mathematically to ensure curves align perfectly (`childRadius = parentRadius - padding`).
- **Tabular Numerals:** Use `font-variant-numeric: tabular-nums` when displaying data comparisons or lists so numbers align cleanly.
- **Concentric Shadow Layering:** Mimic physical light by combining at least two layers of shadows (an ambient shadow and a direct shadow).
- **Glued Terms:** Use non-breaking spaces (`&nbsp;`) to keep units and shortcuts together on the same line (e.g., `10&nbsp;MB`, `⌘&nbsp;+&nbsp;K`).
- **Never Pre-Disable Submit:** Keep submit buttons enabled until submission starts so the UI can surface native validation feedback and focus the first error. Disable it only during the in-flight request, and show a spinner while keeping the original label.

---

## 4. Systems, Databases, & Performance Performance

While design engineering dominates the frontend, you must design with backend performance and database trade-offs in mind to avoid UI latency and performance bottlenecks.

- **Data Locality vs. Redundancy:** Document databases (like MongoDB) allow for flexible, schema-on-read models that load a complex profile in a single sequential disk I/O, but suffer from high data redundancy. Relational databases (like Postgres) enforce strict schemas on write, reducing redundancy but requiring multiple disk requests to join scattered tables.
- **Graph Data:** Use graph databases (like Neo4j) for highly connected, deeply related networks instead of writing complex, 20+ line recursive CTEs in SQL.
- **Latency Monitoring:** Averages lie. Never rely solely on P50 metrics. Always evaluate performance by checking P90, P99, and P99.9 latencies to identify system-blocking, full-table scans that affect real users.

---

## 5. Copywriting and Tone Guidelines

- **Active Voice:** Tell the user exactly what to do (e.g., "Install the CLI" rather than "The CLI will be installed").
- **Title Case:** Use Title Case for headings and buttons on application pages, and sentence case on marketing pages.
- **Numerals for Counts:** Use numerals for counts (e.g., "8 deployments" not "eight deployments").
- **Guide the Exit:** Error messages must never be dead ends. Frame messages in an encouraging, problem-solving way, telling the user exactly how to fix the issue.

---

## 6. Implementation Code Blueprints

### 6.1 Two-Phase Settle Easing Algorithm (Framer Motion / React)

```javascript
// Calculates a fast, weighted approach followed by an elastic, organic settle
// Phase 1 (0 -> 0.65): easeInOutCubic
// Phase 2 (0.65 -> 1.0): easeOutElastic
export const easeInOutCubic = (t) => {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

export const easeOutElastic = (t) => {
  if (t === 0 || t === 1) return t;
  return (
    Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1
  );
};

export const calculateTwoPhaseProgress = (normalizedProgress) => {
  let easedValue;
  if (normalizedProgress < 0.65) {
    easedValue = easeInOutCubic(normalizedProgress / 0.65) * 0.92;
  } else {
    const sub = (normalizedProgress - 0.65) / 0.35;
    easedValue = 0.92 + easeOutElastic(sub) * 0.08;
  }
  return easedValue;
};
```

### 6.2 Sonner Stacking & Swipe Mechanics (React / CSS transitions)

```javascript
// Stacking offset based on index and gap
const yOffset = gap * index;
const scale = 1 - 0.05 * index; // Creates depth layering

// Momentum-based swipe to dismiss: velocity = distance / elapsed time
const velocity = absoluteDragDistance / elapsedTime;
if (dragAmount > threshold || velocity > 0.11) {
  removeToast(); // Swipe is fast enough, dismiss regardless of distance
}

// Pause toast timers when user switches browser tabs using the document hidden API
const isHidden = document.hidden;
if (isHidden) {
  pauseTimer();
}
```

---

## 7. Quality Gate: Automated Audit Checklist

Before outputting UI code or completing a task, run a self-audit against this checklist:

1.  **Tactile Active States:** Are all buttons/pressable components scaling down slightly (e.g., `scale(0.97)`) on click/touch active state?
2.  **Entrances:** Did I avoid animating from `scale(0)`? (Starting scale should be `>= 0.93` with an `ease-out` curve).
3.  **Frequency Check:** Have I stripped out complex hover choreography or transit animations on frequently used elements (seen tens/hundreds of times a day)?
4.  **Concentric Radii:** Does the child border-radius conform to the parent container's padding math? (`childRadius = parentRadius - padding`).
5.  **Mobile Accessibility:** Are mobile input font sizes `>= 16px` to prevent viewport auto-zooming? Are touch targets `>= 44px`?
6.  **Copywriting:** Are headings in Title Case and does the error copy guide the exit with positive, action-oriented instructions?
7.  **Motion Fallbacks:** Is there a `prefers-reduced-motion` media query in place to gracefully degrade complex transforms?

---

## 8. Embedded Interactive Alignment Protocol ("Grill-Me" Mode)

When user requests are underspecified, ambiguous, or lack visual direction:

1. **Do Not Guess Core Intent:** Immediately initiate an interactive micro-interview using concise, multiple-choice questions via `ask_question`.
2. **Key Grill-Me Axis Questions:**
   - **Visual Aesthetic:** "What theme direction best matches your target look?" (e.g. Sleek Linear dark mode, Glassmorphism backdrop-blur, Vibrant modern SaaS, or Minimalist mono).
   - **Interaction Density:** "What motion profile fits this UI?" (e.g. Instant 0ms enterprise density vs. smooth 2-phase springs with cursor 3D tilt).
   - **Device & Layout Priority:** "What is the primary target?" (e.g. Mobile-first touch targets $\ge 44\text{px}$ vs Desktop multi-column grid).
   - **Data & Component Scope:** "What states should be explicitly handled?" (e.g. Skeletons, empty states, validation focus rings).

---

## 9. Embedded Structured Planning & Gap Analysis Protocol ("Plan" Mode)

Before generating complex UI components or refactoring large frontend codebases:

1. **Audit Existing vs. Missing Elements:**
   - Map existing tokens, components, and layout wrappers already present in the workspace.
   - List explicit missing pieces (e.g. missing ARIA labels, missing touch hit targets, missing reduced-motion queries).
2. **Define Milestone Execution Roadmap:**
   - **Stage 1: System Tokens & Themes:** Set up LCH/OKLCH color variables and Tailwind presets.
   - **Stage 2: Accessible Primitives:** Build or refactor inputs, buttons, and popovers with proper focus-visible and active state scale feedback.
   - **Stage 3: Motion & Micro-Interactions:** Inject 2-phase easing, Sonner stacking mechanics, or 3D cards.
   - **Stage 4: Automated Audit & Verification:** Run `python scripts/check_accessibility_tree.py` and `evaluate_assertions.py` to confirm zero violations.

