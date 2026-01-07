/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

"use client";

import React from "react";

interface Props {
  count?: number;
  activeIndex?: number;
  onSelect?: (index: number) => void;
  className?: string;
}

export const CarouselIndicators = ({ count = 3, activeIndex = 0, onSelect, className = "" }: Props) => {
  return (
    <div className={`inline-flex items-center gap-[7px] ${className}`}>
      {Array.from({ length: count }).map((_, index) => {
        const isActive = index === activeIndex;
        return (
          <button
            key={`indicator-${index}`}
            type="button"
            onClick={() => onSelect?.(index)}
            aria-label={`Mostrar la tarjeta ${index + 1}`}
            aria-current={isActive}
            className="relative h-[22px] w-[22px] rounded-full"
          >
            <span
              className={`absolute inset-0 rounded-full transition ${
                isActive
                  ? "bg-white"
                  : "border border-solid border-gris-claro bg-transparent hover:border-white/80"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};

