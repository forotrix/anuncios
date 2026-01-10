"use client";

import React, { useRef, useState } from "react";

interface Props {
  label?: string;
  min?: number;
  max?: number;
  minValue?: number;
  maxValue?: number;
  isOpen?: boolean;
  onToggle?: () => void;
  onChange?: (value: { min: number; max: number }) => void;
  onApply?: (value: { min: number; max: number }) => void;
  className?: string;
}

export const AgeRangeFilterControl = ({
  label = "Edad",
  min = 18,
  max = 65,
  minValue = min,
  maxValue = max,
  isOpen = false,
  onToggle,
  onChange,
  onApply,
  className = "",
}: Props) => {
  const [activeThumb, setActiveThumb] = useState<"min" | "max">("min");
  const rangeRef = useRef<HTMLDivElement>(null);
  const clampedMin = Math.min(Math.max(minValue, min), max);
  const clampedMax = Math.min(Math.max(maxValue, min), max);
  const normalizedMin = Math.min(clampedMin, clampedMax);
  const normalizedMax = Math.max(clampedMin, clampedMax);
  const minProgress = ((normalizedMin - min) / (max - min)) * 100;
  const maxProgress = ((normalizedMax - min) / (max - min)) * 100;
  const midProgress = (minProgress + maxProgress) / 2;

  const updateActiveThumb = (clientX: number) => {
    const rect = rangeRef.current?.getBoundingClientRect();
    if (!rect) return;
    const percent = ((clientX - rect.left) / rect.width) * 100;
    const next = percent <= midProgress ? "min" : "max";
    setActiveThumb(next);
  };

  const handleMinChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = Number(event.target.value);
    setActiveThumb("min");
    onChange?.({ min: Math.min(next, normalizedMax), max: normalizedMax });
  };

  const handleMaxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = Number(event.target.value);
    setActiveThumb("max");
    onChange?.({ min: normalizedMin, max: Math.max(next, normalizedMin) });
  };

  const handleApply = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onApply?.({ min: normalizedMin, max: normalizedMax });
  };

  const containerBase =
    "relative flex items-center justify-center h-[69px] w-[172px] rounded-[32px] transition-all duration-200 ease-out text-white before:content-[''] before:absolute before:inset-0 before:p-[3px] before:rounded-[32px] before:[background:linear-gradient(119deg,rgba(135,0,5,1)_12%,rgba(172,7,13,1)_45%,rgba(208,29,35,1)_75%,rgba(236,76,81,1)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:pointer-events-none";
  const openPanelClass =
    "absolute left-1/2 top-full z-30 mt-3 w-[283px] -translate-x-1/2 rounded-3xl bg-white p-5 text-[#000000] shadow-[0_25px_60px_rgba(0,0,0,0.45)]";

  const zClass = isOpen ? "z-20" : "z-0";

  return (
    <div className={`${containerBase} ${zClass} ${className}`}>
      <button
        type="button"
        onClick={onToggle}
        className={`relative flex w-full items-center justify-center gap-2 rounded-[32px] px-[38px] py-5 font-h3-subdivisiones text-[length:var(--h3-subdivisiones-font-size)] leading-[var(--h3-subdivisiones-line-height)] text-white ${
          isOpen ? "bg-brand-gradient" : ""
        }`}
      >
        <span>{label}</span>
        <svg className="h-3 w-3 text-white/80" viewBox="0 0 12 12" aria-hidden="true" focusable="false">
          <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {isOpen && (
        <div className={openPanelClass}>
          <div className="flex w-full items-start justify-between text-xs text-soft [font-family:'Sora',Helvetica]">
            <span>{min}</span>
            <span>{max}</span>
          </div>

          <div
            ref={rangeRef}
            className="relative mt-4 flex w-full items-center"
            onMouseDown={(event) => updateActiveThumb(event.clientX)}
            onTouchStart={(event) => updateActiveThumb(event.touches[0]?.clientX ?? 0)}
          >
            <div className="h-1 w-full rounded-full bg-[#e4e4e4]" />
            <div
              className="absolute h-1 rounded-full bg-rojo-pasion300"
              style={{ left: `${minProgress}%`, width: `${Math.max(maxProgress - minProgress, 0)}%` }}
            />
            <div
              className="absolute top-1/2 h-4 w-4 -translate-y-1/2 translate-x-[-50%] rounded-[7px] border border-solid border-lightness bg-white shadow-[0px_4px_12px_#0000005c]"
              style={{ left: `${minProgress}%` }}
            />
            <div
              className="absolute top-1/2 h-4 w-4 -translate-y-1/2 translate-x-[-50%] rounded-[7px] border border-solid border-lightness bg-white shadow-[0px_4px_12px_#0000005c]"
              style={{ left: `${maxProgress}%` }}
            />
            <input
              type="range"
              min={min}
              max={max}
              value={normalizedMin}
              onChange={handleMinChange}
              onMouseDown={() => setActiveThumb("min")}
              onTouchStart={() => setActiveThumb("min")}
              className={`range-thumb absolute inset-0 cursor-pointer opacity-0 ${activeThumb === "min" ? "z-20" : "z-10"}`}
            />
            <input
              type="range"
              min={min}
              max={max}
              value={normalizedMax}
              onChange={handleMaxChange}
              onMouseDown={() => setActiveThumb("max")}
              onTouchStart={() => setActiveThumb("max")}
              className={`range-thumb absolute inset-0 cursor-pointer opacity-0 ${activeThumb === "max" ? "z-20" : "z-10"}`}
            />
          </div>

          <div className="mt-2 font-legal text-soft">De {normalizedMin} a {normalizedMax} a¤os</div>

          <div className="flex w-full justify-end">
            <button type="button" className="font-legal text-rojo-cereza300" onClick={handleApply}>
              Aplicar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
