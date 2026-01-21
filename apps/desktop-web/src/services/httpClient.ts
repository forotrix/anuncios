const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ?? "";

const STORAGE_KEY = "forotrix:auth";
const SESSION_KEY = "forotrix:auth:session";

type StoredSession = {
  user: unknown;
  accessToken: string | null;
  refreshToken: string | null;
};

const isBrowser = () => typeof window !== "undefined";

function readStoredSession(): StoredSession | null {
  if (!isBrowser()) return null;
  const raw =
    window.localStorage.getItem(STORAGE_KEY) ??
    window.sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredSession;
  } catch {
    return null;
  }
}

function persistSession(session: StoredSession) {
  if (!isBrowser()) return;
  const payload = JSON.stringify(session);
  if (window.localStorage.getItem(STORAGE_KEY)) {
    window.localStorage.setItem(STORAGE_KEY, payload);
    window.sessionStorage.removeItem(SESSION_KEY);
  } else {
    window.sessionStorage.setItem(SESSION_KEY, payload);
    window.localStorage.removeItem(STORAGE_KEY);
  }
}

let refreshPromise: Promise<StoredSession | null> | null = null;

async function refreshSession(): Promise<StoredSession | null> {
  if (!isBrowser() || !API_BASE_URL) return null;
  if (refreshPromise) return refreshPromise;
  const current = readStoredSession();
  if (!current?.refreshToken) return null;

  refreshPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ refresh: current.refreshToken }),
      });
      if (!response.ok) {
        return null;
      }
      const payload = (await response.json()) as {
        user: unknown;
        access: string;
        refresh: string;
      };
      const updated: StoredSession = {
        user: payload.user ?? current.user,
        accessToken: payload.access,
        refreshToken: payload.refresh,
      };
      persistSession(updated);
      window.dispatchEvent(new CustomEvent("auth:refresh", { detail: payload }));
      return updated;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export function isApiConfigured(): boolean {
  return Boolean(API_BASE_URL);
}

const defaultMessages: Record<number, string> = {
  400: "Revisa los datos ingresados",
  401: "Credenciales incorrectas",
  403: "No tienes permiso para realizar esta accion",
  404: "Servicio no disponible",
  409: "El correo ya esta registrado",
  429: "Demasiados intentos, prueba más tarde",
  500: "Error interno, vuelve a intentarlo",
};

export type ApiError = Error & { status?: number };

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    if (response.status === 204) {
      return undefined as T;
    }
    return (await response.json()) as T;
  }

  let message = defaultMessages[response.status] || "Ha ocurrido un error";

  try {
    const payload = await response.json();
    if (typeof payload?.message === "string" && payload.message.trim().length > 0) {
      message = payload.message;
    } else if (typeof payload?.error === "string" && payload.error.trim().length > 0) {
      message = payload.error;
    }
  } catch {
    // ignore body parse errors
  }

  if (response.status === 401 && isBrowser()) {
    window.dispatchEvent(new CustomEvent("auth:expired", { detail: message }));
  }

  const error = new Error(message) as ApiError;
  error.status = response.status;
  throw error;
}

export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error("API URL not configured");
  }

  const makeRequest = async (allowRefresh: boolean): Promise<Response> => {
    const headers: HeadersInit = {
      Accept: "application/json",
      ...(init.headers || {}),
    };
    const requestHeaders = new Headers(headers);

    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: requestHeaders,
    });

    if (response.status !== 401 || !allowRefresh || !isBrowser()) {
      return response;
    }

    const refreshed = await refreshSession();
    if (!refreshed?.accessToken) {
      return response;
    }

    const nextHeaders = new Headers(requestHeaders);
    const authHeader = nextHeaders.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      nextHeaders.set("Authorization", `Bearer ${refreshed.accessToken}`);
    }

    return fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: nextHeaders,
    });
  };

  const response = await makeRequest(true);
  return handleResponse<T>(response);
}

export async function postJson<T>(path: string, body: unknown, token?: string): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return request<T>(path, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}
