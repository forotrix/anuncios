import { Router } from 'express';
import { z } from 'zod';
import * as service from '../services/auth.service';
import { requireAuth, type AuthenticatedRequest } from '../middlewares/auth';
import { authRateLimiter } from '../middlewares/security';

const router = Router();
router.use(authRateLimiter);

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = credentialsSchema.extend({
  role: z.enum(['provider', 'agency', 'customer']),
  name: z.string().min(2).max(120).optional(),
});

router.post('/register', async (req, res, next) => {
  try {
    const body = registerSchema.parse(req.body);
    const output = await service.register(body.email, body.password, body.role, body.name);
    res.status(201).json(output);
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const body = credentialsSchema.parse(req.body);
    const output = await service.login(body.email, body.password);
    res.json(output);
  } catch (err) {
    next(err);
  }
});

router.post('/refresh', async (req, res, next) => {
  try {
    const { refresh } = z.object({ refresh: z.string().min(10) }).parse(req.body);
    const output = await service.refreshToken(refresh);
    res.json(output);
  } catch (err) {
    next(err);
  }
});

router.post('/logout', requireAuth(), async (req, res, next) => {
  try {
    const { user } = req as AuthenticatedRequest;
    await service.logout(user.sub);
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
    currentPassword: z.string().min(6),
    newPassword: z.string().min(6),
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
