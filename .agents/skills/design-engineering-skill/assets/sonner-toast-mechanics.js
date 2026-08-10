// sonner-toast-mechanics.js
// Core interaction mechanics modeled on Emil Kowalski's Sonner library

/**
 * Momentum-based swipe calculation.
 * Uses drag velocity to trigger dismissal on fast, short swipes.
 *
 * @param {number} absoluteDragDistance - Absolute distance swiped in px
 * @param {number} elapsedTime - Time elapsed in ms since swipe started
 * @param {number} dragAmount - Current physical offset value of the gesture
 * @param {number} threshold - Default px threshold for absolute drag (default: 50)
 * @returns {boolean} Whether to dismiss the toast
 */
export const shouldDismissToast = (absoluteDragDistance, elapsedTime, dragAmount, threshold = 50) => {
  if (elapsedTime <= 0) return false;
  
  const velocity = absoluteDragDistance / elapsedTime; // px per millisecond
  const velocityThreshold = 0.11; // Standard Sonner velocity constant
  
  return dragAmount > threshold || velocity > velocityThreshold;
};

/**
 * Dynamic calculation of stacked toast positions.
 * Multiplies layout gaps and scales elements down for simulated depth.
 *
 * @param {number} index - Position in stack (0 is frontmost toast)
 * @param {number} gap - Standard pixel gap spacing variable
 * @param {boolean} isExpanded - Whether the toast list is hovered and open
 * @param {Array<number>} precedingHeights - Array of the exact heights of toasts in front
 * @returns {Object} CSS style object to map via react inline styles
 */
export const getToastStackStyles = (index, gap, isExpanded, precedingHeights = []) => {
  if (!isExpanded) {
    // Collapsed Mode: Translate offset based on index, scale for depth layering
    const yTranslate = gap * index;
    const scale = Math.max(1 - 0.05 * index, 0.85); // Shrink 5% per stack layer
    
    return {
      transform: `translateY(-${yTranslate}px) scale(${scale})`,
      zIndex: 100 - index,
      opacity: index > 3 ? 0 : 1
    };
  } else {
    // Expanded Mode: Sum all heights of the elements in front to expand cleanly
    const aggregatedOffset = precedingHeights
      .slice(0, index)
      .reduce((sum, currentHeight) => sum + currentHeight + gap, 0);
      
    return {
      transform: `translateY(-${aggregatedOffset}px) scale(1)`,
      zIndex: 100 - index,
      opacity: 1
    };
  }
};
