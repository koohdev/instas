// two-phase-easing.js
// Implements the Memoria "Two-Phase" Premium Animation Pattern

export const easeInOutCubic = (t) => {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

export const easeOutElastic = (t) => {
  if (t === 0 || t === 1) return t;
  return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1;
};

/**
 * Calculates a dynamic progress value by splitting the animation duration.
 * Phase 1 (0% to 65% progress) uses easeInOutCubic to build approach acceleration.
 * Phase 2 (65% to 100% progress) utilizes easeOutElastic to settle with an organic bounce.
 *
 * @param {number} t - Normalized progress between 0 and 1
 * @returns {number} Interpolated value
 */
export const getTwoPhaseProgress = (t) => {
  const normalized = Math.min(Math.max(t, 0), 1);
  
  if (normalized < 0.65) {
    // Scale Phase 1 to take the full 0 -> 0.65 range, mapping output to 92% of distance
    return easeInOutCubic(normalized / 0.65) * 0.92;
  } else {
    // Scale Phase 2 for the remaining 35% of the timeline, mapping the remaining 8% of target bounds
    const subProgress = (normalized - 0.65) / 0.35;
    return 0.92 + easeOutElastic(subProgress) * 0.08;
  }
};
