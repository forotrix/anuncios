import type { AdRecord } from "@anuncios/shared";
import { getJson } from "./httpClient";
import { authorizedJsonRequest, authorizedRequest, buildQueryString } from "./apiClient";

export type EventLogDTO = {
  visitorId: string;
  sessionId?: string;
  type: string;
  data?: Record<string, unknown> | null;
  userAgent?: string | null;
  ip?: string | null;
  createdAt: string;
};

export async function fetchEventLogs(token: string): Promise<EventLogDTO[]> {
  return getJson<EventLogDTO[]>("/events/log", token);
}

export type AdminRole = "admin" | "agency" | "provider" | "customer";
export type AdminStatus = "active" | "suspended";

export type AdminUserDTO = {
  id: string;
  email: string;
  role: AdminRole;
  status: AdminStatus;
  name: string | null;
  category: string | null;
  location: string | null;
  failedLoginAttempts: number;
  lockedUntil: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminListResponse<T> = {
  items: T[];
  total: number;
  page: number;
  pages: number;
  limit: number;
};

export type AdminUsersFilters = {
  role?: AdminRole;
  status?: AdminStatus;
  search?: string;
  page?: number;
  limit?: number;
};

export function fetchAdminUsers(token: string, filters: AdminUsersFilters = {}) {
  const query = buildQueryString(filters);
  return authorizedRequest<AdminListResponse<AdminUserDTO>>(`/admin/users${query}`, token);
}

export function updateAdminUser(
  token: string,
  userId: string,
  updates: { role?: AdminRole; status?: AdminStatus },
) {
  return authorizedJsonRequest<AdminUserDTO>(`/admin/users/${userId}`, token, "PATCH", updates);
}

export async function deleteAdminUser(token: string, userId: string): Promise<void> {
  await authorizedJsonRequest<undefined>(`/admin/users/${userId}`, token, "DELETE");
}

export type AdminAdsFilters = {
  status?: "draft" | "published" | "blocked";
  text?: string;
  page?: number;
  limit?: number;
};

export function fetchAdminAds(token: string, filters: AdminAdsFilters = {}) {
  const query = buildQueryString(filters);
  return authorizedRequest<AdminListResponse<AdRecord>>(`/admin/ads${query}`, token);
}

export function blockAdminAd(token: string, adId: string) {
  return authorizedJsonRequest<AdRecord>(`/admin/ads/${adId}/block`, token, "POST");
}

export function unblockAdminAd(token: string, adId: string) {
  return authorizedJsonRequest<AdRecord>(`/admin/ads/${adId}/unblock`, token, "POST");
}
