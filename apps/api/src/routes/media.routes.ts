import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, type AuthenticatedRequest } from '../middlewares/auth';
import * as service from '../services/media.service';
import type { UserRole } from '@anuncios/shared';
import { mediaRateLimiter } from '../middlewares/security';

const router = Router();
router.use(mediaRateLimiter);
const ownerRoles: UserRole[] = ['provider', 'agency'];

const registerSchema = z
  .object({
    publicId: z.string().min(3),
    url: z.string().url(),
    format: z.string().max(16).optional(),
    bytes: z.number().int().positive().optional(),
    width: z.number().int().positive().optional(),
    height: z.number().int().positive().optional(),
    adId: z.string().length(24).optional(),
  })
  .strict();

const signatureSchema = z.object({
  paramsToSign: z.record(z.string(), z.union([z.string(), z.number()])),
});

router.post('/upload-config', requireAuth(ownerRoles), async (req, res, next) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const config = await service.requestUploadConfig(user.sub);
    res.json(config);
  } catch (err) {
    next(err);
  }
});

router.post('/upload-signature', requireAuth(ownerRoles), async (req, res, next) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const { paramsToSign } = signatureSchema.parse(req.body);
    const payload = await service.signUploadParams(user.sub, paramsToSign);
    res.json(payload);
  } catch (err) {
    next(err);
  }
});

router.post('/', requireAuth(ownerRoles), async (req, res, next) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const body = registerSchema.parse(req.body);
    const media = await service.registerMedia(user.sub, body);
    res.status(201).json(media);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', requireAuth(ownerRoles), async (req, res, next) => {
  try {
    const { user } = req as AuthenticatedRequest;
    await service.deleteMedia(user.sub, req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
