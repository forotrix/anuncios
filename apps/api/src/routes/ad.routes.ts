import { Router } from 'express';
import createError from 'http-errors';
import { z } from 'zod';
import { requireAuth, type AuthenticatedRequest } from '../middlewares/auth';
import * as service from '../services/ad.service';
import * as commentService from '../services/comment.service';
import type { UserRole } from '@anuncios/shared';
import { adMutationLimiter } from '../middlewares/security';
import { AGE_FILTER_CONFIG, SERVICE_FILTER_OPTIONS } from '@anuncios/shared';

const router = Router();
const ownerRoles: UserRole[] = ['provider', 'agency'];

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

const listQuerySchema = z
  .object({
    text: z.string().trim().min(2).max(120).optional(),
    city: z.string().trim().min(2).max(120).optional(),
    plan: z.enum(['basic', 'premium']).optional(),
    services: z.preprocess(
      (value) => {
        if (Array.isArray(value)) return value;
        if (typeof value === 'string' && value.trim().length) return [value];
        return undefined;
      },
      z.array(z.string().trim().min(1)).optional()
    ),
    profileType: z.enum(['chicas', 'trans']).optional(),
    sex: z.enum(['female', 'male']).optional(),
    identity: z.enum(['cis', 'trans']).optional(),
    ageMin: z.coerce.number().int().min(18).max(99).optional(),
    ageMax: z.coerce.number().int().min(18).max(99).optional(),
    featured: z
      .union([z.literal('true'), z.literal('false')])
      .transform((val) => val === 'true')
      .optional(),
    weekly: z
      .union([z.literal('true'), z.literal('false')])
      .transform((val) => val === 'true')
      .optional(),
    excludeIds: z.preprocess(
      (value) => {
        if (Array.isArray(value)) return value;
        if (typeof value === 'string' && value.trim().length) return [value];
        return undefined;
      },
      z.array(objectId).optional(),
    ),
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(50).optional(),
  })
  .strict();

const contactSchema = z
  .object({
    whatsapp: z.string().trim().min(3).max(60).optional(),
    telegram: z.string().trim().min(2).max(60).optional(),
    phone: z.string().trim().min(5).max(40).optional(),
    email: z.string().email().optional(),
    website: z.string().url().optional(),
  })
  .strict();

const locationSchema = z
  .object({
    region: z.string().trim().min(2).max(120).optional(),
    city: z.string().trim().min(2).max(120).optional(),
    zone: z.string().trim().min(2).max(120).optional(),
    address: z.string().trim().min(2).max(200).optional(),
    reference: z.string().trim().min(2).max(200).optional(),
  })
  .strict();

const availabilitySlotSchema = z
  .object({
    day: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
    status: z.enum(['all_day', 'custom', 'unavailable']),
    from: z
      .string()
      .regex(/^\d{2}:\d{2}$/)
      .optional(),
    to: z
      .string()
      .regex(/^\d{2}:\d{2}$/)
      .optional(),
    ranges: z
      .array(
        z
          .object({
            from: z.string().regex(/^\d{2}:\d{2}$/),
            to: z.string().regex(/^\d{2}:\d{2}$/),
          })
          .strict(),
      )
      .max(5)
      .optional(),
  })
  .superRefine((value, ctx) => {
    if (value.status === 'custom') {
      const hasLegacy = Boolean(value.from && value.to);
      const hasRanges = Array.isArray(value.ranges) && value.ranges.length > 0;
      if (!hasLegacy && !hasRanges) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Custom availability requires from/to or ranges',
        });
      }

      const ranges = (value.ranges ?? []).slice();
      if (!ranges.length && value.from && value.to) {
        ranges.push({ from: value.from, to: value.to });
      }

      const parsed = ranges
        .map((range) => {
          const start = Number(range.from.replace(':', ''));
          const end = Number(range.to.replace(':', ''));
          return { start, end, from: range.from, to: range.to };
        })
        .filter((range) => Number.isFinite(range.start) && Number.isFinite(range.end))
        .sort((a, b) => a.start - b.start || a.end - b.end);

      for (const range of parsed) {
        if (range.start >= range.end) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Invalid range ${range.from}-${range.to}`,
          });
          break;
        }
      }

      for (let i = 1; i < parsed.length; i += 1) {
        if (parsed[i].start < parsed[i - 1].end) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Availability ranges cannot overlap',
          });
          break;
        }
      }
    }
  });

const metadataSchema = z
  .object({
    contacts: contactSchema.partial().optional(),
    location: locationSchema.partial().optional(),
    availability: z.array(availabilitySlotSchema).max(7).optional(),
    ranking: z
      .object({
        boostFeatured: z.number().min(0).max(100),
        favoritesWeekly: z.number().int().min(0),
        favoritesTotal: z.number().int().min(0).optional(),
        lastActiveAt: z.string().datetime().optional(),
      })
      .strict()
      .optional(),
    seed: z
      .object({
        seedBatch: z.string().trim().min(3).max(80),
        isMock: z.boolean(),
      })
      .strict()
      .optional(),
    gender: z
      .object({
        sex: z.enum(['female', 'male']),
        identity: z.enum(['cis', 'trans']),
      })
      .strict()
      .optional(),
    attributes: z
      .record(
        z.string(),
        z.union([
          z.string().trim().min(1).max(200),
          z.number(),
          z.boolean(),
          z.null(),
          z.array(z.string().trim().min(1).max(120)).max(20),
        ]),
      )
      .optional(),
  })
  .strict()
  .optional();

const baseAdSchema = z
  .object({
    title: z.string().trim().min(3).max(120),
    description: z.string().trim().min(10).max(2000),
    city: z.string().trim().min(2).max(120).optional(),
    services: z.array(z.string().trim().min(2).max(60)).max(20).optional(),
    tags: z.array(z.string().trim().min(2).max(60)).max(30).optional(),
    profileType: z.enum(['chicas', 'trans']).optional(),
    age: z.number().int().min(18).max(99).optional(),
    priceFrom: z.number().min(0).max(1000000).optional(),
    priceTo: z.number().min(0).max(1000000).optional(),
    highlighted: z.boolean().optional(),
    imageIds: z.array(objectId).max(10).optional(),
    metadata: metadataSchema,
  })
  .strict();

const createAdSchema = baseAdSchema;
const updateAdSchema = baseAdSchema.partial().strict();

const paginationSchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
  })
  .strict();

const commentSchema = z
  .object({
    text: z.string().trim().min(2).max(500),
  })
  .strict();

router.get('/', async (req, res, next) => {
  try {
    const {
      text,
      city,
      plan,
      page = 1,
      limit = 20,
      services,
      profileType,
      sex,
      identity,
      ageMin,
      ageMax,
      featured,
      weekly,
      excludeIds,
    } =
      listQuerySchema.parse(req.query);
    const output = await service.listAds(
      { text, city, plan, services, profileType, sex, identity, ageMin, ageMax, featured, weekly, excludeIds },
      page,
      limit,
    );
    res.json(output);
  } catch (err) {
    next(err);
  }
});

router.get('/filters', (_req, res) => {
  res.json({
    services: SERVICE_FILTER_OPTIONS,
    age: AGE_FILTER_CONFIG,
  });
});

router.get('/mine', requireAuth(ownerRoles), async (req, res, next) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const { page, limit } = paginationSchema.parse(req.query);
    const output = await service.listOwnAds(user.sub, page, limit);
    res.json(output);
  } catch (err) {
    next(err);
  }
});

router.get('/:id/comments', async (req, res, next) => {
  try {
    const { page, limit } = paginationSchema.parse(req.query);
    const adId = objectId.parse(req.params.id);
    const output = await commentService.listComments(adId, page, limit);
    res.json(output);
  } catch (err) {
    next(err);
  }
});

router.post('/:id/comments', adMutationLimiter, requireAuth(), async (req, res, next) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const adId = objectId.parse(req.params.id);
    const { text } = commentSchema.parse(req.body);
    const comment = await commentService.createComment(adId, user.sub, text);
    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const ad = await service.getPublicAd(req.params.id);
    res.json(ad);
  } catch (err) {
    next(err);
  }
});

router.post('/', adMutationLimiter, requireAuth(ownerRoles), async (req, res, next) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const body = createAdSchema.parse(req.body);
    const ad = await service.createAd(user.sub, body);
    res.status(201).json(ad);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', adMutationLimiter, requireAuth(ownerRoles), async (req, res, next) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const body = updateAdSchema.parse(req.body);
    if (Object.keys(body).length === 0) {
      return next(createError(400, 'No fields to update'));
    }
    const ad = await service.updateAd(user.sub, req.params.id, body);
    res.json(ad);
  } catch (err) {
    next(err);
  }
});

router.post('/:id/publish', adMutationLimiter, requireAuth(ownerRoles), async (req, res, next) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const ad = await service.publishAd(user.sub, req.params.id);
    res.json(ad);
  } catch (err) {
    next(err);
  }
});

router.post('/:id/unpublish', adMutationLimiter, requireAuth(ownerRoles), async (req, res, next) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const ad = await service.unpublishAd(user.sub, req.params.id);
    res.json(ad);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', adMutationLimiter, requireAuth(ownerRoles), async (req, res, next) => {
  try {
    const { user } = req as AuthenticatedRequest;
    await service.deleteAd(user.sub, req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
