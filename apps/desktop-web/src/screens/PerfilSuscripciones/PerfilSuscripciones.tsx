"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { logEvent } from "@/services/eventLogger";
import { subscriptionsService } from "@/services/subscriptions.service";
import { useSubscription } from "@/hooks/useSubscription";
import { PlanCard } from "@/components/PlanCard";

type ActionState = "idle" | "pending" | "success" | "error";

export const PerfilSuscripciones = () => {
  const { accessToken } = useAuth();
  const { plans, current, loading, error, refresh } = useSubscription({
    accessToken,
    enabled: true,
  });
  const [actionState, setActionState] = useState<ActionState>("idle");
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fallbackPlans = [
    { id: "plan-1", name: "Plan nombre", priceLabel: "$XX", perks: ["Nombre", "Nombre", "Nombre", "Nombre", "Nombre"] },
    { id: "plan-2", name: "Plan nombre", priceLabel: "$XX", perks: ["Nombre", "Nombre", "Nombre", "Nombre", "Nombre"] },
    { id: "plan-3", name: "Plan nombre", priceLabel: "$XX", perks: ["Nombre", "Nombre", "Nombre", "Nombre", "Nombre"] },
  ];

  const isAuthenticated = Boolean(accessToken);

  const handleSelectPlan = async (planId: string) => {
    if (!accessToken || current?.planId === planId) return;
    setActionState("pending");
    setActionMessage(null);
    try {
      await subscriptionsService.changePlan(accessToken, planId);
      await refresh();
      setActionState("success");
      setActionMessage("Plan actualizado correctamente.");
      logEvent("subscription:change-plan", { planId });
    } catch (err) {
      setActionState("error");
      setActionMessage(
        err instanceof Error ? err.message : "No se pudo actualizar tu plan. Intenta nuevamente.",
      );
    }
  };

  const handleAutoRenewToggle = async (nextValue: boolean) => {
    if (!accessToken || !current) return;
    setActionState("pending");
    setActionMessage(null);
    try {
      await subscriptionsService.toggleAutoRenew(accessToken, nextValue);
      await refresh();
      setActionState("success");
      setActionMessage(nextValue ? "Renovación automática activada." : "Renovación automática desactivada.");
      logEvent("subscription:auto-renew", { autoRenew: nextValue });
    } catch (err) {
      setActionState("error");
      setActionMessage(
        err instanceof Error ? err.message : "No se pudo cambiar la renovación automática.",
      );
    }
  };

  return (
    <div className="bg-black text-white">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-10 px-4 pb-24 sm:px-6 lg:px-10">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.4em] text-[#ff9aa2]">Planes</p>
        </header>

        <div className="space-y-8">
          <section className="rounded-[26px] border border-[#8e1522] bg-[#050102] px-6 py-5 shadow-[0_25px_60px_rgba(0,0,0,0.45)]">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-[13px] uppercase tracking-[0.35em] text-[#ff9aa2]">Plan actual</p>
                <h2 className="mt-2 text-lg font-semibold text-white">
                  {current ? current.planName : "Sin plan activo"}
                </h2>
                <p className="text-sm text-white/60">
                  {current
                    ? `Estado: ${current.status === "active" ? "Activo" : current.status}`
                    : "Suscríbete para activar tu anuncio."}
                </p>
              </div>
              {current && (
                <div className="flex flex-wrap items-center gap-4">
                  <span className="text-sm text-white/70">
                    Renovación automática:{" "}
                    <strong className="text-white">
                      {current.autoRenew ? "Activada" : "Desactivada"}
                    </strong>
                  </span>
                  <button
                    type="button"
                    disabled={!isAuthenticated || actionState === "pending"}
                    onClick={() => handleAutoRenewToggle(!current.autoRenew)}
                    className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] transition ${
                      current.autoRenew
                        ? "border-white/20 bg-black/40 text-white/70 hover:border-white/40 hover:text-white"
                        : "border-[#ff4d5d] bg-[#a30009] text-white hover:bg-[#c00010] shadow-[0_0_15px_rgba(255,77,93,0.3)]"
                    } disabled:opacity-50`}
                  >
                    {current.autoRenew ? "Desactivar" : "Activar"}
                  </button>
                </div>
              )}
            </div>
            {error && (
              <p className="mt-4 rounded-lg bg-[#2d070b] px-4 py-3 text-sm text-[#ffb3b3]">
                No se pudieron cargar los planes. Intenta más tarde.
              </p>
            )}
            {actionMessage && (
              <p
                className={`mt-3 rounded-lg px-4 py-2 text-sm ${
                  actionState === "error"
                    ? "bg-[#2d070b] text-[#ffb3b3]"
                    : "bg-emerald-500/10 text-emerald-200"
                }`}
              >
                {actionMessage}
              </p>
            )}
            {!isAuthenticated && (
              <p className="mt-3 rounded-lg bg-[#2d070b]/70 px-4 py-2 text-sm text-[#ffb3b3]">
                Inicia sesión para gestionar tu plan.
              </p>
            )}
          </section>

          <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {plans.length
              ? plans.map((plan) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    isCurrent={current?.planId === plan.id}
                    onSelect={handleSelectPlan}
                    disabled={!isAuthenticated || actionState === "pending" || loading}
                  />
                ))
              : fallbackPlans.map((plan) => (
                  <article
                    key={plan.id}
                    className="relative flex flex-col rounded-[32px] border border-[#4a0c14] bg-[#1a0507] p-6 text-white shadow-[0_20px_50px_rgba(0,0,0,0.45)] transition hover:border-[#8e1522]/60 hover:shadow-[0_25px_60px_rgba(142,21,34,0.15)]"
                  >
                    <h3 className="text-lg font-semibold text-[#ff9aa2]">{plan.name}</h3>
                    <div className="mt-2 flex items-end gap-2">
                      <span className="text-3xl font-semibold">{plan.priceLabel}</span>
                      <span className="text-xs uppercase text-white/60">al mes</span>
                    </div>
                    <ul className="mt-5 space-y-3 text-sm text-white/80">
                      {plan.perks.map((perk, index) => (
                        <li key={`${plan.id}-${index}`} className="flex items-center gap-2">
                          <span className="text-[#ff4d5d]">✓</span>
                          <span>{perk}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      className="mt-8 inline-flex items-center justify-center rounded-full border border-white/10 bg-black/40 px-6 py-2.5 text-sm font-semibold uppercase tracking-[0.2em] text-white/50"
                      disabled
                    >
                      Proximamente
                    </button>
                  </article>
                ))}
          </section>
        </div>
      </div>
    </div>
  );
};

