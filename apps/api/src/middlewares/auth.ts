import { type Request, type Response, type NextFunction } from 'express';
import createError from 'http-errors';
import { verifyAccess, type AccessPayload } from '../utils/jwt';
import type { UserRole } from '@anuncios/shared';

export type AuthenticatedRequest = Request & { user: AccessPayload };

export function requireAuth(roles?: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const header = req.headers.authorization;
      if (!header?.startsWith('Bearer ')) throw createError(401, 'Missing token');

      const token = header.slice(7);
      const payload = verifyAccess(token);
      (req as Partial<AuthenticatedRequest>).user = payload;

      if (roles && !roles.includes(payload.role)) throw createError(403, 'Forbidden');

      next();
    } catch (err) {
      next(err);
    }
  };
}
