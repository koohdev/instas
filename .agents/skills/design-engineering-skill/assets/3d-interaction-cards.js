// 3d-interaction-cards.js
// Framer Motion cursor-tracking rotation script

import { useState } from "react";

export const use3DTiltCard = (maxTiltX = 15, maxTiltY = 15) => {
  const [coords, setCoords] = useState({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    const bounds = e.currentTarget.getBoundingClientRect();
    const width = bounds.width;
    const height = bounds.height;
    
    // Normalize coordinates relative to card center (-0.5 to 0.5)
    const relativeX = (e.clientX - bounds.left) / width - 0.5;
    const relativeY = (e.clientY - bounds.top) / bounds.height - 0.5;
    
    setCoords({
      rotateX: relativeY * -maxTiltX, // Invert X axis to tilt correctly
      rotateY: relativeX * maxTiltY,
      glareX: ((e.clientX - bounds.left) / width) * 100, // Glare coordinates in percentages
      glareY: ((e.clientY - bounds.top) / height) * 100
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setCoords({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50 });
  };

  return {
    isHovered,
    handleMouseMove,
    handleMouseEnter,
    handleMouseLeave,
    styles: {
      transform: isHovered
        ? `perspective(1000px) rotateX(${coords.rotateX}deg) rotateY(${coords.rotateY}deg) scale(1.03)` // Perspective stage
        : "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)",
      // Use extremely snappy 0.08s ease on move, smooth 0.6s settle on leave
      transition: isHovered 
        ? "transform 0.08s cubic-bezier(0.16, 1, 0.3, 1)" 
        : "transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)"
    },
    glareStyles: {
      background: `radial-gradient(circle at ${coords.glareX}% ${coords.glareY}%, rgba(255,255,255,0.15) 0%, transparent 65%)`,
      opacity: isHovered ? 1 : 0,
      transition: "opacity 0.4s ease-out"
    }
  };
};
