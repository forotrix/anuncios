"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { ASSETS } from "@/constants/assets";

export type LanguageCode = "es";

type LanguageOption = {
  code: LanguageCode;
  label: string;
  flag: string;
};

interface Props {
  className?: string;
  value?: LanguageCode;
  onSelect?: (code: LanguageCode) => void;
};

const LANG_OPTIONS: LanguageOption[] = [
  {
    code: "es",
    label: "Español",
    flag: ASSETS.flagEs,
  },
];

export const LanguageSelector = ({ className = "", value = "es", onSelect }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const options = useMemo(() => LANG_OPTIONS, []);
  const active = options.find((option) => option.code === value) ?? options[0];
  const [menuStyles, setMenuStyles] = useState<{ top: number; left: number; width: number }>({
    top: 0,
    left: 0,
    width: 0,
  });

  const updateMenuPosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setMenuStyles({
      top: rect.bottom + 8,
      left: rect.left,
      width: rect.width,
    });
  };

  useEffect(() => {
    if (!isOpen) return;
    updateMenuPosition();

    const handleResize = () => updateMenuPosition();
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleResize, true);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleResize, true);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (buttonRef.current?.contains(target)) return;
      if (dropdownRef.current?.contains(target)) return;
      setIsOpen(false);
    };
    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <>
      <button
        type="button"
        ref={buttonRef}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`inline-flex h-[42px] items-center gap-2 rounded-full border border-white/50 bg-transparent px-4 text-white shadow-[0_6px_20px_rgba(0,0,0,0.45)] transition hover:border-white ${className}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <img src={active.flag} alt={active.label} className="h-6 w-8 rounded-sm object-cover" />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className={`h-4 w-4 transition ${isOpen ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <path d="M5 7.5 10 12.5 15 7.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="fixed z-50 rounded-3xl border border-white/10 bg-[#050505] p-3 shadow-[0_25px_60px_rgba(0,0,0,0.55)]"
          style={{ top: menuStyles.top, left: menuStyles.left, minWidth: Math.max(menuStyles.width, 160) }}
        >
          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-white/40">Idioma</p>
          <div className="flex flex-col gap-1">
            {options.map((option) => {
              const isActive = option.code === active.code;
              return (
                <button
                  key={option.code}
                  type="button"
                  className={`flex items-center gap-3 rounded-2xl px-3 py-2 text-left text-sm transition ${
                    isActive ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5"
                  }`}
                  onClick={() => {
                    onSelect?.(option.code);
                    setIsOpen(false);
                  }}
                >
                  <img src={option.flag} alt={option.label} className="h-5 w-7 rounded-sm object-cover" />
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};
