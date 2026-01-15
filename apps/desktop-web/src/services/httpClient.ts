const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ?? "";

export function isApiConfigured(): boolean {
  return Boolean(API_BASE_URL);
}

const defaultMessages: Record<number, string> = {
  400: "Revisa los datos ingresados",
  401: "Credenciales incorrectas",
  403: "No tienes permiso para realizar esta accion",
  404: "Servicio no disponible",
  409: "El correo ya esta registrado",
  429: "Demasiados intentos, prueba mas tarde",
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

  if (response.status === 401 && typeof window !== "undefined") {
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

  const headers: HeadersInit = {
    Accept: "application/json",
    ...(init.headers || {}),
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

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
