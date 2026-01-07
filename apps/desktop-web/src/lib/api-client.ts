import { z } from 'zod';

const DEV_FALLBACK_BASE_URL = 'http://localhost:3000/api/v1';

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    options?: { cause?: unknown },
  ) {
    super(message, options);
    this.name = 'ApiClientError';
  }
}

export function getApiBaseUrl(): string | undefined {
  const explicit = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (explicit) {
    return explicit;
  }

  if (process.env.NODE_ENV !== 'production') {
    return DEV_FALLBACK_BASE_URL;
  }

  return undefined;
}

export async function fetchJson<T>(
  url: string,
  schema: z.ZodType<T>,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(url, {
    cache: 'no-store',
    headers: {
      Accept: 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    throw new ApiClientError(`Request failed with status ${response.status}`, response.status);
  }

  const payload = await response.json();

  try {
    return schema.parse(payload);
  } catch (error) {
    throw new ApiClientError('Unexpected response format', response.status, { cause: error });
  }
}
