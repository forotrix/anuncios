"use client";

/*
We're constantly improving the code you see.
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import PropTypes from "prop-types";
import React from "react";

interface Props {
  propiedad1?: "defoult";
  className?: string;
  value?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  onSubmit?: () => void;
  isFocused?: boolean;
  onFocusChange?: (focused: boolean) => void;
}

export const SearchInput = ({
  className = "",
  value = "",
  placeholder = "Buscar",
  onChange,
  onSubmit,
  isFocused = false,
  onFocusChange,
}: Props) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      onSubmit?.();
    }
  };

  return (
    <div
      className={`flex w-[370px] h-[73px] items-center justify-between rounded-[32px] border border-white/15 bg-[#050505] px-6 shadow-[inset_2px_1px_4px_#69696987] transition ${
        isFocused ? "ring-2 ring-rojo-pasion400" : ""
      } ${className}`}
    >
      <input
        type="text"
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => onFocusChange?.(true)}
        onBlur={() => onFocusChange?.(false)}
        placeholder={placeholder}
        className="w-full bg-transparent text-white placeholder-white/60 outline-none font-h3-subdivisiones text-[length:var(--h3-subdivisiones-font-size)]"
      />

      <button
        type="button"
        onClick={onSubmit}
        className="ml-2 flex h-10 w-10 items-center justify-center rounded-full border border-white/30 text-white transition hover:bg-white/10"
        aria-label="Buscar"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
          <circle cx="11" cy="11" r="7" />
          <line x1="16.5" y1="16.5" x2="21" y2="21" />
        </svg>
      </button>
    </div>
  );
};

SearchInput.propTypes = {
  propiedad1: PropTypes.oneOf(["defoult"]),
  className: PropTypes.string,
  value: PropTypes.string,
  placeholder: PropTypes.string,
  onChange: PropTypes.func,
  onSubmit: PropTypes.func,
  isFocused: PropTypes.bool,
  onFocusChange: PropTypes.func,
};
