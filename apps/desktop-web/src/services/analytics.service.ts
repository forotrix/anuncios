import type { AnalyticsSummary } from "@anuncios/shared";
import { isApiConfigured } from "./httpClient";
import { authorizedRequest, buildQueryString, ensureAccessToken } from "./apiClient";

export type AnalyticsFilters = {
  from?: string;
  to?: string;
  adId?: string;
};

const MOCK_SUMMARY: AnalyticsSummary = buildMockSummary();

function buildMockSummary(): AnalyticsSummary {
  const today = new Date();
  const days = Array.from({ length: 7 }).map((_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    return date;
  });

  const viewSeries = days.map((date, index) => ({
    date: date.toISOString().slice(0, 10),
    value: 120 + index * 15,
  }));

  const contactSeries = days.map((date, index) => ({
    date: date.toISOString().slice(0, 10),
    value: 10 + index * 3,
  }));

  return {
    totalViews: viewSeries.reduce((acc, point) => acc + point.value, 0),
    totalContacts: contactSeries.reduce((acc, point) => acc + point.value, 0),
    viewSeries,
    contactSeries,
    contactsByChannel: {
      whatsapp: 54,
      telegram: 23,
      phone: 17,
    },
    topAds: [
      { adId: "mock-1", title: "Masajes relajantes en Barcelona", views: 450, contacts: 38 },
      { adId: "mock-2", title: "Experiencias premium en Madrid", views: 380, contacts: 31 },
      { adId: "mock-3", title: "Spa y bienestar Valencia", views: 220, contacts: 18 },
    ],
  };
}

function buildQuery(filters?: AnalyticsFilters) {
  if (!filters) return "";
  return buildQueryString({
    from: filters.from,
    to: filters.to,
    adId: filters.adId,
  });
}

export const analyticsService = {
  async getSummary(
    token: string | null | undefined,
    filters?: AnalyticsFilters,
  ): Promise<AnalyticsSummary> {
    ensureAccessToken(token);
    if (!isApiConfigured()) {
      return MOCK_SUMMARY;
    }
    const query = buildQuery(filters);
    return authorizedRequest<AnalyticsSummary>(`/analytics/summary${query}`, token);
  },
};
