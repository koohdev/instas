// theme-lch-generator.js
// Uses the perceptually uniform LCH/OKLCH color space utilized in the Linear redesign

/**
 * Generates an accessible, highly cohesive theme using OKLCH.
 * OKLCH is perceptually uniform: colors with identical Lightness (L) values 
 * look equally bright to the human eye, preventing muddy contrast errors.
 *
 * @param {number} baseHue - Base Hue angle (0 - 360)
 * @param {number} accentHue - Accent Hue angle (0 - 360)
 * @param {number} contrast - Accessibility contrast multiplier (30 - 100)
 * @returns {Object} JSON mapping of CSS custom properties
 */
export const generatePerceptualTheme = (baseHue, accentHue, contrast = 100) => {
  // Constrain inputs
  const hue = baseHue % 360;
  const accent = accentHue % 360;
  const cFactor = Math.min(Math.max(contrast, 30), 100) / 100;

  return {
    "--bg-base": `oklch(0.12 0.015 ${hue})`, // Uniform dark canvas background
    "--bg-surface": `oklch(0.18 0.02 ${hue})`, // Elevated surface panels
    "--border-subtle": `oklch(0.26 0.025 ${hue})`, // Subtle bounding borders
    
    // Accents are generated using high chroma (0.2) for saturated visual interest
    "--accent-primary": `oklch(0.62 0.21 ${accent})`, 
    
    // Scale text contrast primarly based on the custom contrast factor
    "--text-primary": `oklch(${0.96 * cFactor} 0 0)`, // Bright primary readable text
    "--text-muted": `oklch(${0.65 * cFactor} 0.015 ${hue})` // Muted description labels
  };
};
