import type { SubscriptionPlanDefinition, SubscriptionStatus } from "@anuncios/shared";
import { isApiConfigured, request } from "./httpClient";
import { authorizedJsonRequest, authorizedRequest, ensureAccessToken } from "./apiClient";

const MOCK_PLANS: SubscriptionPlanDefinition[] = [
  {
    id: "basic",
    name: "Básico",
    description: "Presencia esencial dentro del marketplace.",
    price: 29,
    currency: "EUR",
    period: "monthly",
    features: ["Hasta 1 anuncio publicado", "Soporte estandar", "Visibilidad en listados"],
    highlightColor: "#C2185B",
  },
  {
    id: "premium",
    name: "Premium",
    description: "Mayor exposición y herramientas adicionales.",
    price: 59,
    currency: "EUR",
    period: "monthly",
    features: [
      "Hasta 3 anuncios publicados",
      "Acceso a estadísticas",
      "Prioridad en listados",
      "Soporte prioritario",
    ],
    highlightColor: "#FF7043",
    badge: "Popular",
  },
  {
    id: "vip",
    name: "VIP",
    description: "Máxima visibilidad y soporte dedicado.",
    price: 99,
    currency: "EUR",
    period: "monthly",
    features: [
      "Anuncios ilimitados",
      "Destacados permanentes",
      "Reportes avanzados",
      "Account manager dedicado",
    ],
    highlightColor: "#FFD54F",
    badge: "Exclusive",
  },
];

let mockSubscriptionStatus: SubscriptionStatus = {
  planId: "premium",
  planName: "Premium",
  status: "active",
  startedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  renewsAt: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
  autoRenew: true,
};

export const subscriptionsService = {
  async getPlans(): Promise<SubscriptionPlanDefinition[]> {
    if (!isApiConfigured()) {
      return MOCK_PLANS;
    }
    return request<SubscriptionPlanDefinition[]>("/subscriptions/plans");
  },
  async getCurrent(token: string | null | undefined): Promise<SubscriptionStatus> {
    ensureAccessToken(token);
    if (!isApiConfigured()) {
      return mockSubscriptionStatus;
    }
    return authorizedRequest<SubscriptionStatus>("/subscriptions/current", token);
  },
  async changePlan(token: string | null | undefined, planId: string): Promise<SubscriptionStatus> {
    ensureAccessToken(token);
    if (!isApiConfigured()) {
      const nextPlan = MOCK_PLANS.find((plan) => plan.id === planId) ?? MOCK_PLANS[0];
      mockSubscriptionStatus = {
        ...mockSubscriptionStatus,
        planId: nextPlan.id,
        planName: nextPlan.name,
        status: "active",
        renewsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };
      return mockSubscriptionStatus;
    }
    return authorizedJsonRequest<SubscriptionStatus>(
      "/subscriptions/current",
      token,
      "PATCH",
      { planId },
    );
  },
  async toggleAutoRenew(
    token: string | null | undefined,
    autoRenew: boolean,
  ): Promise<SubscriptionStatus> {
    ensureAccessToken(token);
    if (!isApiConfigured()) {
      mockSubscriptionStatus = { ...mockSubscriptionStatus, autoRenew };
      return mockSubscriptionStatus;
    }
    return authorizedJsonRequest<SubscriptionStatus>(
      "/subscriptions/current/auto-renew",
      token,
      "PATCH",
      { autoRenew },
    );
  },
};
