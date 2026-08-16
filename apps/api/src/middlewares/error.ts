import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({ error: err.issues });
  }

  const status = err.status || 500;
  if (status >= 500) {
    console.error(err);
    const message = process.env.NODE_ENV === 'production' ? 'Internal error' : err.message || 'Internal error';
    return res.status(status).json({ error: message });
  }
  return res.status(status).json({ error: err.message || 'Error' });
}
