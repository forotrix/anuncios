"use client";

import React from "react";
import type { SubscriptionPlanDefinition } from "@anuncios/shared";

type Props = {
  plan: SubscriptionPlanDefinition;
  isCurrent: boolean;
  onSelect: (planId: string) => void;
  disabled?: boolean;
};

export const PlanCard = ({ plan, isCurrent, onSelect, disabled = false }: Props) => {
  const highlight = plan.highlightColor ?? "#ec4c51";

  return (
    <article
      className={`relative flex h-full flex-col rounded-[32px] border bg-[#07080c]/80 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.45)] ${
        isCurrent ? "border-white/30" : "border-white/10"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
            {plan.badge && (
              <span
                className="rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.35em] text-black"
                style={{ backgroundColor: highlight }}
              >
                {plan.badge}
              </span>
            )}
            {isCurrent && (
              <span className="rounded-full border border-white/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.35em] text-white/70">
                Actual
              </span>
            )}
          </div>
          {plan.description && <p className="text-sm text-white/60">{plan.description}</p>}
        </div>
        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: highlight }} aria-hidden="true" />
      </div>

      <div className="mt-6 flex items-end justify-between gap-3">
        <div className="text-3xl font-semibold text-white">
          {plan.price}
          <span className="ml-1 text-base font-semibold text-white/70">€</span>
        </div>
        <span className="text-xs font-semibold uppercase tracking-[0.35em] text-white/50">{formatPeriod(plan.period)}</span>
      </div>

      <ul className="mt-6 space-y-3 text-sm text-white/70">
        {plan.features.map((feature) => (
          <li key={`${plan.id}-${feature}`} className="flex gap-3">
            <span className="mt-1 h-2 w-2 rounded-full" style={{ backgroundColor: highlight }} aria-hidden="true" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => onSelect(plan.id)}
        disabled={disabled || isCurrent}
        className={`mt-8 inline-flex items-center justify-center rounded-full px-6 py-3 text-xs font-semibold uppercase tracking-[0.35em] transition disabled:cursor-not-allowed disabled:opacity-50 ${
          isCurrent
            ? "border border-white/20 text-white/70"
            : "bg-[linear-gradient(119deg,rgba(135,0,5,1)_12%,rgba(172,7,13,1)_45%,rgba(208,29,35,1)_75%,rgba(236,76,81,1)_100%)] text-white shadow-shadow-g hover:opacity-95"
        }`}
      >
        {isCurrent ? "Plan actual" : "Elegir plan"}
      </button>
    </article>
  );
};

function formatPeriod(period: SubscriptionPlanDefinition["period"]) {
  switch (period) {
    case "monthly":
      return "Mensual";
    case "quarterly":
      return "Trimestral";
    case "yearly":
      return "Anual";
    default:
      return period;
  }
}

