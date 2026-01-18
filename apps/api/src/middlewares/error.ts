import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({ error: err.issues });
  }

  const status = err.status || 500;
  const message = err.message || 'Internal error';
  if (status >= 500) console.error(err);
  return res.status(status).json({ error: message });
}
