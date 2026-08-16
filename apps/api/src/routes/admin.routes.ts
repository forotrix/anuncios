import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, type AuthenticatedRequest } from '../middlewares/auth';
import * as adminService from '../services/admin.service';
import * as adService from '../services/ad.service';

const router = Router();

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

const listUsersQuerySchema = z
  .object({
    role: z.enum(['admin', 'agency', 'provider', 'customer']).optional(),
    status: z.enum(['active', 'suspended']).optional(),
    search: z.string().trim().min(2).max(120).optional(),
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(50).optional(),
  })
  .strict();

const updateUserSchema = z
  .object({
    role: z.enum(['admin', 'agency', 'provider', 'customer']).optional(),
    status: z.enum(['active', 'suspended']).optional(),
  })
  .strict()
  .refine((body) => body.role || body.status, 'No fields to update');

router.get('/users', requireAuth(['admin']), async (req, res, next) => {
  try {
    const { role, status, search, page = 1, limit = 20 } = listUsersQuerySchema.parse(req.query);
    const output = await adminService.listUsers({ role, status, search }, page, limit);
    res.json(output);
  } catch (err) {
    next(err);
  }
});

router.patch('/users/:id', requireAuth(['admin']), async (req, res, next) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const userId = objectId.parse(req.params.id);
    const updates = updateUserSchema.parse(req.body);
    const result = await adminService.updateUser(user.sub, userId, updates);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.delete('/users/:id', requireAuth(['admin']), async (req, res, next) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const userId = objectId.parse(req.params.id);
    await adminService.deleteUser(user.sub, userId);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

const listAdsQuerySchema = z
  .object({
    status: z.enum(['draft', 'published', 'blocked']).optional(),
    text: z.string().trim().min(2).max(120).optional(),
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(50).optional(),
  })
  .strict();

router.get('/ads', requireAuth(['admin']), async (req, res, next) => {
  try {
    const { status, text, page = 1, limit = 20 } = listAdsQuerySchema.parse(req.query);
    const output = await adService.listAdsForAdmin({ status, text }, page, limit);
    res.json(output);
  } catch (err) {
    next(err);
  }
});

router.post('/ads/:id/block', requireAuth(['admin']), async (req, res, next) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const adId = objectId.parse(req.params.id);
    const result = await adService.blockAd(user.sub, adId);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post('/ads/:id/unblock', requireAuth(['admin']), async (req, res, next) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const adId = objectId.parse(req.params.id);
    const result = await adService.unblockAd(user.sub, adId);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
