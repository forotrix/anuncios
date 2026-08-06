"use client";

import React from "react";
import type { GenderIdentity, GenderSex } from "@anuncios/shared";

type CategoryKey = "chicas" | "chicos" | "trans";

type Props = {
  sex?: GenderSex;
  identity: GenderIdentity;
  onChange?: (next: { sex?: GenderSex; identity: GenderIdentity }) => void;
  className?: string;
  gapClassName?: string;
  orientation?: "column" | "row";
  size?: "default" | "compact" | "small";
};

const OPTIONS: { key: CategoryKey; label: string }[] = [
  { key: "chicas", label: "Chicas" },
  { key: "chicos", label: "Chicos" },
  { key: "trans", label: "Trans" },
];

function toKey(sex: GenderSex | undefined, identity: GenderIdentity): CategoryKey {
  if (identity === "trans") return "trans";
  return sex === "male" ? "chicos" : "chicas";
}

function toGender(key: CategoryKey): { sex?: GenderSex; identity: GenderIdentity } {
  if (key === "trans") return { sex: undefined, identity: "trans" };
  return { sex: key === "chicos" ? "male" : "female", identity: "cis" };
}

/**
 * Filtro de navegación por categoría (Chicas/Chicos/Trans) usado en el header y menú móvil.
 * "Trans" no fija sexo: el backend ya filtra solo por identity cuando sex viene vacío,
 * así se incluyen tanto chicas trans como chicos trans en una sola categoría.
 * Distinto de GenderToggleStack, que exige un sexo concreto (usado al editar el propio anuncio).
 */
export const GenderFilterToggle = ({
  sex,
  identity,
  onChange,
  className = "",
  gapClassName = "gap-2",
  orientation = "row",
  size = "default",
}: Props) => {
  const active = toKey(sex, identity);

  const sizeStyles =
    size === "compact"
      ? "h-[46px] px-5 text-[12px] tracking-[0.18em]"
      : size === "small"
        ? "h-[36px] px-4 text-[10px] font-bold tracking-widest uppercase"
        : "h-[54px] px-6 text-[length:calc(var(--h3-subdivisiones-font-size)*0.8)] tracking-[var(--h3-subdivisiones-letter-spacing)]";

  return (
    <div
      role="group"
      aria-label="Filtrar por categoría"
      className={`flex ${orientation === "row" ? "flex-row flex-wrap items-center" : "flex-col"} ${gapClassName} ${className}`}
    >
      {OPTIONS.map((option) => {
        const isActive = option.key === active;
        return (
          <button
            key={option.key}
            type="button"
            aria-pressed={isActive}
            onClick={() => {
              if (option.key === active) return;
              onChange?.(toGender(option.key));
            }}
            className={`inline-flex items-center justify-center rounded-full font-h3-subdivisiones text-white transition ${sizeStyles} ${
              isActive
                ? "bg-[linear-gradient(119deg,rgba(135,0,5,1)_12%,rgba(172,7,13,1)_45%,rgba(208,29,35,1)_75%,rgba(236,76,81,1)_100%)]"
                : "border border-white/20 bg-white/5 text-white/70 hover:border-white/40 hover:text-white"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};
