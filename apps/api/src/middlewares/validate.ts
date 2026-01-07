import type { NextFunction, Request, Response } from 'express';
import type { ZodTypeAny } from 'zod';

type Target = 'body' | 'query' | 'params';

export function validate<TSchema extends ZodTypeAny>(schema: TSchema, target: Target = 'body') {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const container = (req as Record<Target, unknown>)[target];
      const parsed = schema.parse(container);
      (req as Record<Target, unknown>)[target] = parsed;
      next();
    } catch (error) {
      next(error);
    }
  };
}
