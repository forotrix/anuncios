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
  orientation?: "column" | "row";
  size?: "default" | "compact";
};

export const GenderToggleStack = ({
  sex,
  identity,
  onSexChange,
  onIdentityChange,
  className = "",
  gapClassName = "gap-2",
  orientation = "column",
  size = "default",
}: Props) => {
  return (
    <div className={`flex ${orientation === "row" ? "flex-row flex-wrap items-center" : "flex-col"} ${gapClassName} ${className}`}>
      <BinaryToggle
        value={sex}
        left={{ value: "female", label: "Chicas" }}
        right={{ value: "male", label: "Chicos" }}
        onChange={onSexChange}
        ariaLabelPrefix="Cambiar a"
        size={size}
      />
      <BinaryToggle
        value={identity}
        left={{ value: "cis", label: "Cis" }}
        right={{ value: "trans", label: "Trans" }}
        onChange={onIdentityChange}
        ariaLabelPrefix="Cambiar a"
        size={size}
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
  size = "default",
}: {
  value: T;
  left: ToggleOption<T>;
  right: ToggleOption<T>;
  onChange?: (next: T) => void;
  ariaLabelPrefix: string;
  size?: "default" | "compact";
}) {
  const isLeft = value === left.value;
  const next = isLeft ? right : left;
  const styles =
    size === "compact"
      ? {
          wrapper: "h-[54px] w-[190px]",
          knob: "h-[46px] w-[46px] rounded-[23px]",
          knobLeft: "4px",
          knobRight: "calc(100% - 50px)",
          text: "text-[12px] tracking-[0.22em] leading-[1.2]",
          innerPadding: "px-[20px]",
        }
      : {
          wrapper: "h-[70px] w-[230px]",
          knob: "h-[62px] w-[62px] rounded-[31px]",
          knobLeft: "6px",
          knobRight: "calc(100% - 68px)",
          text: "text-[length:calc(var(--h3-subdivisiones-font-size)*0.9)] tracking-[var(--h3-subdivisiones-letter-spacing)] leading-[var(--h3-subdivisiones-line-height)]",
          innerPadding: "px-[26px]",
        };

  return (
    <div className={`relative ${styles.wrapper}`}>
      <span
        className="absolute left-0 top-1/2 h-[3px] w-1 -translate-y-1/2 rounded-full bg-white/70"
        aria-hidden="true"
      />
      <button
        type="button"
        onClick={() => onChange?.(next.value)}
        className={`relative flex h-full w-full items-center justify-center rounded-[100px] bg-[linear-gradient(119deg,rgba(135,0,5,1)_12%,rgba(172,7,13,1)_45%,rgba(208,29,35,1)_75%,rgba(236,76,81,1)_100%)] ${styles.innerPadding}`}
        aria-label={`${ariaLabelPrefix} ${next.label}`}
      >
        <span className={`relative z-10 w-full text-center font-h3-subdivisiones text-white ${styles.text}`}>
          {isLeft ? left.label : right.label}
        </span>
        <span
          className={`absolute top-1 z-0 bg-gradient-to-b from-white to-[#e8eaea] shadow-switch-in-shadow transition-all ${styles.knob}`}
          style={{
            left: isLeft ? styles.knobLeft : styles.knobRight,
          }}
          aria-hidden="true"
        />
      </button>
    </div>
  );
}
