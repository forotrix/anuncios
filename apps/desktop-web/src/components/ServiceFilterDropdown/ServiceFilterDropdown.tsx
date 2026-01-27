"use client";

import React from "react";
import type { ServiceFilterOption } from "@anuncios/shared";

interface Props {
  label?: string;
  options: ServiceFilterOption[];
  selectedOptions: string[];
  isOpen?: boolean;
  onToggle?: () => void;
  onChange?: (selected: string[]) => void;
  onApply?: (selected: string[]) => void;
  className?: string;
}

export const ServiceFilterDropdown = ({
  label = "Filtrar",
  options,
  selectedOptions,
  isOpen = false,
  onToggle,
  onChange,
  onApply,
  className = "",
}: Props) => {
  const toggleOption = (optionId: string) => {
    const isSelected = selectedOptions.includes(optionId);
    const nextSelected = isSelected ? selectedOptions.filter((id) => id !== optionId) : [...selectedOptions, optionId];
    onChange?.(nextSelected);
  };

  const containerBase =
    "relative flex h-[69px] w-[172px] items-center justify-center rounded-[32px] text-white before:content-[''] before:absolute before:inset-0 before:p-[3px] before:rounded-[32px] before:[background:linear-gradient(119deg,rgba(135,0,5,1)_12%,rgba(172,7,13,1)_45%,rgba(208,29,35,1)_75%,rgba(236,76,81,1)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:pointer-events-none";
  const openPanelClass =
    "absolute left-0 top-full z-[100] mt-3 w-[270px] rounded-3xl bg-white p-4 text-[#000000] shadow-[0_25px_60px_rgba(0,0,0,0.45)] sm:w-[296px] sm:left-1/2 sm:-translate-x-1/2";
  const zClass = isOpen ? "z-20" : "z-0";

  return (
    <div className={`${containerBase} ${zClass} ${className}`}>
      <button // ... keeps button code same
        type="button"
        onClick={onToggle}
        className={`relative flex w-full items-center justify-center gap-2 rounded-[32px] px-[38px] py-5 font-h3-subdivisiones text-[length:var(--h3-subdivisiones-font-size)] leading-[var(--h3-subdivisiones-line-height)] text-white ${
          isOpen ? "bg-brand-gradient" : ""
        }`}
      >
        <span>{label}</span>
        <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" aria-hidden="true" focusable="false">
          <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {isOpen && (
        <div className={openPanelClass}>
          <div className="flex flex-col gap-3 max-h-[320px] overflow-y-auto custom-scrollbar pr-1">
            {options.map((option) => {
              const isSelected = selectedOptions.includes(option.id);
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleOption(option.id);
                  }}
                  className="inline-flex items-center gap-2.5 text-left"
                >
                  <span
                    className={`relative h-7 w-7 rounded border border-solid border-neutral-1 ${
                      isSelected ? "bg-gradient-to-r from-rojo-pasion500 to-rojo-pasion200" : "bg-neutral-0"
                    }`}
                  />
                  <span className="font-h6 text-[length:var(--h6-font-size)] text-[#000000cc]">{option.label}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex w-full justify-end">
            <button
              type="button"
              className="font-texto-secundario text-rojo-cereza500"
              onClick={(event) => {
                event.stopPropagation();
                onApply?.(selectedOptions);
              }}
            >
              Aplicar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
