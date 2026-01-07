import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

const defaultLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

const allowlist = new Set(env.cors.originAllowlist.map((origin) => origin.toLowerCase()));
const vercelPreviewRegex = /^https:\/\/[a-z0-9-]+\.vercel\.app$/i;

function isAllowedOrigin(origin?: string | null) {
  if (!origin) return true;
  if (env.cors.allowAll) return true;

  const normalized = origin.toLowerCase();
  if (allowlist.has(normalized)) return true;
  if (env.cors.allowVercelPreview && vercelPreviewRegex.test(normalized)) return true;

  return false;
}

export const security = [
  helmet(),
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  }),
  defaultLimiter,
];

export const authRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 40,
  standardHeaders: true,
  legacyHeaders: false,
});

export const mediaRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

export const adMutationLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
});
