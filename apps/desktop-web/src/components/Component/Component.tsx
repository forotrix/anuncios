"use client";

import React from "react";

interface Props {
  label?: string;
  min?: number;
  max?: number;
  value?: number;
  isOpen?: boolean;
  onToggle?: () => void;
  onChange?: (value: number) => void;
  onApply?: (value: number) => void;
  className?: string;
}

export const Component = ({
  label = "Edad",
  min = 18,
  max = 65,
  value = max,
  isOpen = false,
  onToggle,
  onChange,
  onApply,
  className = "",
}: Props) => {
  const clampedValue = Math.min(Math.max(value, min), max);
  const progress = ((clampedValue - min) / (max - min)) * 100;

  const handleRangeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = Number(event.target.value);
    onChange?.(next);
  };

  const handleApply = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onApply?.(clampedValue);
  };

  const containerBase =
    "relative flex items-center justify-center h-[69px] w-[172px] rounded-[32px] transition-all duration-200 ease-out text-white before:content-[''] before:absolute before:inset-0 before:p-[3px] before:rounded-[32px] before:[background:linear-gradient(119deg,rgba(135,0,5,1)_12%,rgba(172,7,13,1)_45%,rgba(208,29,35,1)_75%,rgba(236,76,81,1)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:pointer-events-none";
  const openPanelClass =
    "absolute left-1/2 top-full z-30 mt-3 w-[283px] -translate-x-1/2 rounded-3xl bg-white p-4 text-[#000000] shadow-[0_25px_60px_rgba(0,0,0,0.45)]";

  const zClass = isOpen ? "z-20" : "z-0";

  return (
    <div className={`${containerBase} ${zClass} ${className}`}>
      <button
        type="button"
        onClick={onToggle}
        className={`relative w-full rounded-[32px] ${
          isOpen
            ? "flex items-center justify-center gap-2 bg-[linear-gradient(119deg,rgba(135,0,5,1)_12%,rgba(172,7,13,1)_45%,rgba(208,29,35,1)_75%,rgba(236,76,81,1)_100%)] px-[38px] py-5 font-h3-subdivisiones text-[length:var(--h3-subdivisiones-font-size)] text-white leading-[var(--h3-subdivisiones-line-height)]"
            : "flex items-center justify-center text-[length:var(--h3-subdivisiones-font-size)] font-h3-subdivisiones leading-[var(--h3-subdivisiones-line-height)]"
        }`}
      >
        <span>{label}</span>
        {isOpen && (
          <span className="text-lg text-white/80" aria-hidden="true">
            
          </span>
        )}
      </button>

      {isOpen && (
        <div className={openPanelClass}>
          <div className="flex w-full items-start justify-between text-xs text-soft [font-family:'Sora',Helvetica]">
            <span>{min}</span>
            <span>{max}</span>
          </div>

          <div className="relative flex w-full items-center">
            <div className="h-1 w-full rounded-full bg-[#d9d9d9]" />
            <div className="absolute h-1 rounded-full bg-white" style={{ width: `${progress}%` }} />
            <div
              className="absolute top-1/2 h-4 w-4 -translate-y-1/2 translate-x-[-50%] rounded-[7px] border border-solid border-lightness bg-white shadow-[0px_4px_12px_#0000005c]"
              style={{ left: `${progress}%` }}
            />
            <input
              type="range"
              min={min}
              max={max}
              value={clampedValue}
              onChange={handleRangeChange}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
          </div>

          <div className="font-legal text-soft">Hasta los {clampedValue} años</div>

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
