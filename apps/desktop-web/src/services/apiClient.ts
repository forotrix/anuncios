import { request } from "./httpClient";

export function ensureAccessToken(token?: string | null): asserts token is string {
  if (!token) {
    throw new Error("Access token is required for this operation");
  }
}

export function authorizedRequest<T>(path: string, token: string, init: RequestInit = {}) {
  const headers: HeadersInit = {
    ...(init.headers || {}),
    Authorization: `Bearer ${token}`,
  };
  return request<T>(path, { ...init, headers });
}

export function authorizedJsonRequest<T>(
  path: string,
  token: string,
  method: "POST" | "PATCH" | "PUT" | "DELETE",
  body?: unknown,
) {
  const init: RequestInit = {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  };
  return authorizedRequest<T>(path, token, init);
}

export function buildQueryString(
  params?: Record<string, string | number | boolean | undefined | null>,
): string {
  if (!params) return "";
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    searchParams.set(key, typeof value === "boolean" ? String(value) : String(value));
  });
  const query = searchParams.toString();
  return query ? `?${query}` : "";
}
