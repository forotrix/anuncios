"use client";

import React from "react";
import type { ProfileType } from "@anuncios/shared";

const LABELS: Record<ProfileType, string> = {
  chicas: "Chicas",
  trans: "Trans",
};

interface Props {
  value: ProfileType;
  onToggle?: (next: ProfileType) => void;
  className?: string;
}

export const ProfileTypeToggle = ({ value, onToggle, className = "" }: Props) => {
  const nextValue = value === "chicas" ? "trans" : "chicas";

  return (
    <div className={`relative h-[70px] w-[230px] ${className}`}>
      <span className="absolute left-0 top-1/2 h-[3px] w-1 -translate-y-1/2 rounded-full bg-white/70" aria-hidden="true" />
      <button
        type="button"
        onClick={() => onToggle?.(nextValue)}
        className="relative flex h-full w-full items-center justify-between rounded-[100px] bg-[linear-gradient(119deg,rgba(135,0,5,1)_12%,rgba(172,7,13,1)_45%,rgba(208,29,35,1)_75%,rgba(236,76,81,1)_100%)] pl-[85px] pr-[26px]"
        aria-label={`Cambiar a ${LABELS[nextValue]}`}
      >
        <span className="font-h3-subdivisiones text-[length:var(--h3-subdivisiones-font-size)] text-white tracking-[var(--h3-subdivisiones-letter-spacing)] leading-[var(--h3-subdivisiones-line-height)]">
          {LABELS[value]}
        </span>
        <span
          className="absolute top-1 h-[62px] w-[62px] rounded-[31px] bg-gradient-to-b from-white to-[#e8eaea] shadow-switch-in-shadow transition-all"
          style={{
            left: value === "chicas" ? "6px" : "calc(100% - 68px)",
          }}
          aria-hidden="true"
        />
      </button>
    </div>
  );
};
