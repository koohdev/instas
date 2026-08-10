// tailwind-preset.js
// Drop-in Tailwind CSS presets supporting beUI, Vercel, and Memoria tokens

module.exports = {
  theme: {
    extend: {
      transitionTimingFunction: {
        // beUI standard for entrances: fast initial acceleration, quiet settle
        "ease-out-entrance": "cubic-bezier(0.16, 1, 0.3, 1)",
        // beUI standard for on-screen layout shifting
        "ease-in-out-layout": "cubic-bezier(0.77, 0, 0.175, 1)",
        // Memoria Phase 1: dramatic approach curve
        "ease-in-out-cubic": "cubic-bezier(0.65, 0.05, 0.36, 1)",
        // Memoria Phase 2: organic settle overshoot
        "ease-out-elastic": "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      fontFamily: {
        // Forces tabular numeral features for precise alignments in grids/lists
        sans: ["Inter", "ui-sans-serif", "system-ui", { fontFeatureSettings: '"tnum" 1' }],
      },
    },
  },
};
