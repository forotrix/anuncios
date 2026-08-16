import { Router, type Response } from 'express';
import { z } from 'zod';
import * as service from '../services/auth.service';
import { requireAuth, type AuthenticatedRequest } from '../middlewares/auth';
import { authRateLimiter } from '../middlewares/security';

const router = Router();
router.use(authRateLimiter);

// The refresh token lives in an httpOnly cookie instead of the response
// body/localStorage, so an XSS on the site can no longer read it. Scoped
// to the auth path only (not sent on every API call) and to the exact
// host (no Domain attribute) - api.forotrix.com and www.forotrix.com
// share the registrable domain forotrix.com, which is all SameSite=Lax
// needs to treat a fetch between them as same-site.
const REFRESH_COOKIE_NAME = 'forotrix_refresh';
const REFRESH_COOKIE_PATH = '/api/v1/auth';
const REFRESH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function refreshCookieOptions(persist: boolean) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: REFRESH_COOKIE_PATH,
    ...(persist ? { maxAge: REFRESH_COOKIE_MAX_AGE_MS } : {}),
  };
}

function setRefreshCookie(res: Response, refresh: string, persist: boolean) {
  res.cookie(REFRESH_COOKIE_NAME, refresh, refreshCookieOptions(persist));
}

function clearRefreshCookie(res: Response) {
  res.clearCookie(REFRESH_COOKIE_NAME, { path: REFRESH_COOKIE_PATH });
}

// Login only checks a stored password, it doesn't set one - keep this
// loose (no strength requirement) so users who registered before the
// 8-char minimum was enforced can still log in.
const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(200),
  remember: z.boolean().optional(),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(200),
  role: z.enum(['provider', 'agency', 'customer']),
  name: z.string().min(2).max(120).optional(),
  category: z.string().trim().optional(),
  location: z.string().trim().optional(),
  phone: z.string().trim().optional(),
});

router.post('/register', async (req, res, next) => {
  try {
    const body = registerSchema.parse(req.body);
    const { refresh, ...output } = await service.register(body.email, body.password, body.role, body.name, body.category, body.location, body.phone);
    setRefreshCookie(res, refresh, true);
    res.status(201).json(output);
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const body = credentialsSchema.parse(req.body);
    const { refresh, ...output } = await service.login(body.email, body.password);
    setRefreshCookie(res, refresh, body.remember ?? true);
    res.json(output);
  } catch (err) {
    next(err);
  }
});

router.post('/refresh', async (req, res, next) => {
  try {
    const rawRefresh = req.cookies?.[REFRESH_COOKIE_NAME];
    if (typeof rawRefresh !== 'string' || rawRefresh.length < 10) {
      clearRefreshCookie(res);
      res.status(401).json({ error: 'No session' });
      return;
    }
    const { refresh, ...output } = await service.refreshToken(rawRefresh);
    setRefreshCookie(res, refresh, true);
    res.json(output);
  } catch (err) {
    clearRefreshCookie(res);
    next(err);
  }
});

router.post('/logout', requireAuth(), async (req, res, next) => {
  try {
    const { user } = req as AuthenticatedRequest;
    await service.logout(user.sub);
    clearRefreshCookie(res);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

const contactsSchema = z
  .object({
    whatsapp: z.string().trim().min(3).max(60).optional(),
    telegram: z.string().trim().min(2).max(60).optional(),
    phone: z.string().trim().min(5).max(40).optional(),
    email: z.string().email().optional(),
    website: z.string().url().optional(),
  })
  .strict()
  .optional();

const avatarSchema = z
  .object({
    url: z.string().url(),
    publicId: z.string().trim().min(3).max(200),
  })
  .optional()
  .nullable();

const profileUpdateSchema = z
  .object({
    email: z.string().email().optional(),
    name: z.string().trim().min(2).max(120).optional(),
    contacts: contactsSchema,
    avatar: avatarSchema,
  })
  .strict();

router.get('/profile', requireAuth(), async (req, res, next) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const profile = await service.getProfile(user.sub);
    res.json(profile);
  } catch (err) {
    next(err);
  }
});

router.patch('/profile', requireAuth(), async (req, res, next) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const body = profileUpdateSchema.parse(req.body);
    const profile = await service.updateProfile(user.sub, body);
    res.json(profile);
  } catch (err) {
    next(err);
  }
});

const passwordSchema = z
  .object({
    // Loose on purpose: this checks against whatever the user's current
    // password already is, which may predate the 8-char minimum below.
    currentPassword: z.string().min(1).max(200),
    newPassword: z.string().min(8).max(200),
  })
  .strict();

router.patch('/password', requireAuth(), async (req, res, next) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const body = passwordSchema.parse(req.body);
    await service.updatePassword(user.sub, body.currentPassword, body.newPassword);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.delete('/account', requireAuth(), async (req, res, next) => {
  try {
    const { user } = req as AuthenticatedRequest;
    await service.deleteAccount(user.sub);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
