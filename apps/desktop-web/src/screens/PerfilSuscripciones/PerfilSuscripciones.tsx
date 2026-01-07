"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { logEvent } from "@/services/eventLogger";
import { subscriptionsService } from "@/services/subscriptions.service";
import { useSubscription } from "@/hooks/useSubscription";
import { PlanCard } from "@/components/PlanCard";

type ActionState = "idle" | "pending" | "success" | "error";

const NAV_LINKS = [
  { id: "mi-anuncio", label: "Mi anuncio" },
  { id: "cuenta", label: "Cuenta" },
  { id: "suscripciones", label: "Suscripciones", isActive: true },
  { id: "estadisticas", label: "Estadísticas" },
  { id: "ver-anuncio", label: "Ver anuncio" },
];

const PROFILE_NAV_LINKS = NAV_LINKS.map((link) => ({
  href:
    link.id === "mi-anuncio"
      ? "/perfil/mi-anuncio"
      : link.id === "cuenta"
        ? "/perfil/cuenta"
        : link.id === "suscripciones"
          ? "/perfil/suscripciones"
          : link.id === "estadisticas"
            ? "/perfil/estadisticas"
            : "/anuncio",
  label: link.label,
}));

export const PerfilSuscripciones = () => {
  const pathname = usePathname();
  const { accessToken } = useAuth();
  const { plans, current, loading, error, refresh } = useSubscription({
    accessToken,
    enabled: true,
  });
  const [actionState, setActionState] = useState<ActionState>("idle");
  const [actionMessage, setActionMessage] = useState<string | null>(null);

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
        err instanceof Error ? err.message : "No se pudo cambiar la renovaciÃ³n automÃ¡tica.",
      );
    }
  };

  return (
    <div className="bg-[#020305] text-white">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-10 px-4 pb-24 pt-16 sm:px-6 lg:px-10">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.4em] text-white/60">Planes</p>
          <h1 className="font-h1-2-0 text-[length:var(--h1-2-0-font-size)] leading-[var(--h1-2-0-line-height)]">Gestiona tu plan</h1>
          <p className="max-w-3xl text-white/70">
            Elige el plan que mejor se adapta a tu negocio y activa beneficios como estadísticas, anuncios destacados y soporte prioritario.
          </p>
          {error && (
            <p className="rounded-lg bg-[#2d070b] px-4 py-3 text-sm text-[#ffb3b3]">No se pudieron cargar los planes. Intenta más tarde.</p>
          )}
          {actionMessage && (
            <p
              className={`rounded-lg px-4 py-2 text-sm ${
                actionState === "error" ? "bg-[#2d070b] text-[#ffb3b3]" : "bg-emerald-500/10 text-emerald-200"
              }`}
            >
              {actionMessage}
            </p>
          )}
          {!isAuthenticated && (
            <p className="rounded-lg bg-[#2d070b]/70 px-4 py-2 text-sm text-[#ffb3b3]">Inicia sesión para gestionar tu plan.</p>
          )}
        </header>

        <div className="grid gap-8 lg:grid-cols-[240px,1fr]">
          <aside className="space-y-4">
            <nav className="rounded-[28px] border border-white/10 bg-[#090a0f]/90 p-4 shadow-[0_12px_40px_rgba(0,0,0,0.45)]">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">Secciones</p>
              <ul className="mt-3 space-y-2 text-sm font-semibold">
                {PROFILE_NAV_LINKS.map((link) => {
                  const isActive =
                    pathname === link.href || (link.href === "/anuncio" && pathname.startsWith("/anuncio"));
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 transition ${
                          isActive ? "bg-rojo-cereza400/20 text-white" : "text-white/60 hover:bg-white/5"
                        }`}
                        aria-current={isActive ? "page" : undefined}
                      >
                        {link.label}
                        {isActive && (
                          <span className="text-[10px] uppercase tracking-[0.35em] text-rojo-cereza300">Activo</span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </aside>

          <div className="space-y-8">
            <section className="rounded-[32px] border border-white/10 bg-panel-gradient px-6 py-6 shadow-[0_25px_60px_rgba(0,0,0,0.35)]">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-white/60">Plan actual</p>
                  <h2 className="mt-2 text-2xl font-bold text-white">{current ? current.planName : "Sin plan activo"}</h2>
                  <p className="text-sm text-white/60">
                    {current ? `Estado: ${current.status === "active" ? "Activo" : current.status}` : "Suscríbete para activar tu anuncio."}
                  </p>
                </div>
                {current && (
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="text-sm text-white/70">
                      Renovación automática: <strong className="text-white">{current.autoRenew ? "Activada" : "Desactivada"}</strong>
                    </span>
                    <button
                      type="button"
                      disabled={!isAuthenticated || actionState === "pending"}
                      onClick={() => handleAutoRenewToggle(!current.autoRenew)}
                      className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] transition ${
                        current.autoRenew
                          ? "border-white/30 text-white/80 hover:text-white"
                          : "border-rojo-pasion400 text-rojo-pasion200 hover:text-rojo-pasion100"
                      } disabled:opacity-50`}
                    >
                      {current.autoRenew ? "Desactivar" : "Activar"}
                    </button>
                  </div>
                )}
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-3">
              {plans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  isCurrent={current?.planId === plan.id}
                  onSelect={handleSelectPlan}
                  disabled={!isAuthenticated || actionState === "pending" || loading}
                />
              ))}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};
