"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

export type CityOption = {
  city: string;
  label: string;
  count: number;
  isAll?: boolean;
};

interface Props {
  className?: string;
  options: CityOption[];
  value?: string;
  onSelect?: (city: string) => void;
}

export const CitySelector = ({ className = "", options, value, onSelect }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const safeOptions = useMemo(
    () => (options.length ? options : [{ city: "", label: "España", count: 0, isAll: true }]),
    [options],
  );
  const activeOption =
    safeOptions.find((option) => option.city === value) ??
    (value ? undefined : safeOptions.find((option) => option.isAll)) ??
    safeOptions[0];
  const activeLabel = activeOption?.label ?? "España";

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={containerRef} className={`relative inline-flex items-center gap-1.5 text-white ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex items-center gap-2 rounded-full bg-transparent px-0 py-0 font-[500] text-xl leading-[normal]"
      >
        <span className="[font-family:'Plus_Jakarta_Sans',Helvetica] font-medium">{activeLabel}</span>
        <span className="flex h-[33px] w-[33px] items-center justify-center rounded-full bg-[#292929]">
          <img className="h-[11px] w-[12.4px]" alt="Seleccionar ciudad" src="/img/polygon-1.svg" />
        </span>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-40 mt-3 w-[260px] rounded-3xl border border-white/10 bg-[#0a0a0a] p-4 shadow-[0_25px_60px_rgba(0,0,0,0.45)]">
          <div className="mb-3 text-sm text-white/60">Selecciona zona ({safeOptions.length})</div>
          <div className="flex max-h-64 flex-col gap-2 overflow-y-auto pr-1">
            {safeOptions.map((option) => {
              const isActive = option.city === activeOption?.city;
              return (
                <button
                  key={option.city}
                  type="button"
                  onClick={() => {
                    onSelect?.(option.city);
                    setIsOpen(false);
                  }}
                  className={`flex items-center justify-between rounded-2xl px-4 py-3 text-left text-base transition ${
                    isActive ? "bg-[#1d1d1d] text-white" : "text-white/80 hover:bg-[#151515]"
                  }`}
                >
                  <span>{option.label}</span>
                  <span className="text-sm text-white/60">{option.count}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
