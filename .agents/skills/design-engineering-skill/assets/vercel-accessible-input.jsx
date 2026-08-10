// vercel-accessible-input.jsx
// React Component conforming to Vercel Web Interface Guidelines

import React from "react";

export const VercelInput = ({ 
  label, 
  id, 
  error, 
  required = false, 
  ...props 
}) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex justify-between items-baseline">
        <label 
          htmlFor={id} 
          className="text-xs font-semibold tracking-wider uppercase text-neutral-500" // Labels styling
        >
          {label}
          {required && <span className="ml-1 text-red-500" aria-hidden="true">*</span>}
        </label>
        
        {error && (
          <span 
            id={`${id}-error`} 
            className="text-xs font-medium text-red-500 animate-fade-in"
            role="alert" // Dynamic screen-reader error announcement
          >
            {error}
          </span>
        )}
      </div>

      <input
        id={id}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`
          /* Prevents layout auto-zooming on iOS viewports by ensuring fontSize >= 16px */
          text-[16px] md:text-sm 
          
          /* Ensures mobile touch targets meet 44px min hit bounds */
          min-h-[44px] md:min-h-[36px] 
          
          w-full px-3 py-2 rounded-md bg-neutral-900 border text-white
          outline-none transition-shadow duration-150 ease-out-entrance
          
          /* Focus Ring - custom focus-visible prevents flash on mouse hover */
          focus:outline-none 
          focus-visible:ring-2 
          focus-visible:ring-blue-500 
          
          ${error ? "border-red-500" : "border-neutral-800 focus-visible:border-transparent"}
        `}
        {...props}
      />
    </div>
  );
};
