"use client";

import React from "react";
import type { GenderIdentity, GenderSex } from "@anuncios/shared";

type Props = {
  sex: GenderSex;
  identity: GenderIdentity;
  onSexChange?: (next: GenderSex) => void;
  onIdentityChange?: (next: GenderIdentity) => void;
  className?: string;
  gapClassName?: string;
};

export const GenderToggleStack = ({
  sex,
  identity,
  onSexChange,
  onIdentityChange,
  className = "",
  gapClassName = "gap-2",
}: Props) => {
  return (
    <div className={`flex flex-col ${gapClassName} ${className}`}>
      <BinaryToggle
        value={sex}
        left={{ value: "female", label: "Chicas" }}
        right={{ value: "male", label: "Chicos" }}
        onChange={onSexChange}
        ariaLabelPrefix="Cambiar a"
      />
      <BinaryToggle
        value={identity}
        left={{ value: "cis", label: "Cis" }}
        right={{ value: "trans", label: "Trans" }}
        onChange={onIdentityChange}
        ariaLabelPrefix="Cambiar a"
      />
    </div>
  );
};

type ToggleOption<T extends string> = { value: T; label: string };

function BinaryToggle<T extends string>({
  value,
  left,
  right,
  onChange,
  ariaLabelPrefix,
}: {
  value: T;
  left: ToggleOption<T>;
  right: ToggleOption<T>;
  onChange?: (next: T) => void;
  ariaLabelPrefix: string;
}) {
  const isLeft = value === left.value;
  const next = isLeft ? right : left;

  return (
    <div className="relative h-[70px] w-[230px]">
      <span
        className="absolute left-0 top-1/2 h-[3px] w-1 -translate-y-1/2 rounded-full bg-white/70"
        aria-hidden="true"
      />
      <button
        type="button"
        onClick={() => onChange?.(next.value)}
        className="relative flex h-full w-full items-center justify-between rounded-[100px] bg-[linear-gradient(119deg,rgba(135,0,5,1)_12%,rgba(172,7,13,1)_45%,rgba(208,29,35,1)_75%,rgba(236,76,81,1)_100%)] pl-[85px] pr-[26px]"
        aria-label={`${ariaLabelPrefix} ${next.label}`}
      >
        <span className="font-h3-subdivisiones text-[length:var(--h3-subdivisiones-font-size)] text-white tracking-[var(--h3-subdivisiones-letter-spacing)] leading-[var(--h3-subdivisiones-line-height)]">
          {isLeft ? left.label : right.label}
        </span>
        <span
          className="absolute top-1 h-[62px] w-[62px] rounded-[31px] bg-gradient-to-b from-white to-[#e8eaea] shadow-switch-in-shadow transition-all"
          style={{
            left: isLeft ? "6px" : "calc(100% - 68px)",
          }}
          aria-hidden="true"
        />
      </button>
    </div>
  );
}

