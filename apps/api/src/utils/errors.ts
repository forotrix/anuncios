import type { HttpError } from 'http-errors';

export type ErrorDetails = Record<string, unknown>;

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code?: string;
  public readonly details?: ErrorDetails;

  constructor(
    statusCode: number,
    message: string,
    options?: { code?: string; cause?: unknown; details?: ErrorDetails },
  ) {
    super(message, { cause: options?.cause });
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = options?.code;
    this.details = options?.details;
  }
}

export function isHttpError(error: unknown): error is HttpError {
  return Boolean(
    error &&
      typeof error === 'object' &&
      'status' in error &&
      typeof (error as HttpError).status === 'number',
  );
}

export function serializeError(error: unknown): Record<string, unknown> {
  if (error instanceof AppError) {
    return {
      name: error.name,
      message: error.message,
      statusCode: error.statusCode,
      code: error.code,
      details: error.details,
    };
  }

  if (isHttpError(error)) {
    return {
      name: error.name,
      message: error.message,
      statusCode: error.status ?? error.statusCode ?? 500,
      code: (error as HttpError & { code?: string }).code,
    };
  }

  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
    };
  }

  return { name: 'UnknownError', value: String(error) };
}
