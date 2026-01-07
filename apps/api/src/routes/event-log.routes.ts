import { Router } from 'express';
import { z } from 'zod';
import { storeEventLog } from '../services/event-log.service';

const router = Router();
const MAX_EVENT_DATA_CHARS = 4000;
const EVENT_TYPE_PATTERN = /^[a-z0-9][a-z0-9:._-]*$/i;

const parseDate = z
  .preprocess((value) => {
    if (!value) return undefined;
    if (value instanceof Date) return value;
    if (typeof value === 'string' || typeof value === 'number') {
      const parsed = new Date(value);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed;
      }
    }
    return undefined;
  }, z.date())
  .optional();

const dataSchema = z
  .record(z.string(), z.any())
  .optional()
  .superRefine((value, ctx) => {
    if (!value) return;
    try {
      const serialized = JSON.stringify(value);
      if (serialized.length > MAX_EVENT_DATA_CHARS) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Data payload too large (>${MAX_EVENT_DATA_CHARS} chars)`,
        });
      }
    } catch {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Data payload must be JSON serializable',
      });
    }
  });

const logEventSchema = z
  .object({
    visitorId: z.string().min(3).max(120),
    sessionId: z.string().min(3).max(160).optional(),
    type: z
      .string()
      .min(3)
      .max(160)
      .refine((value) => EVENT_TYPE_PATTERN.test(value.trim()), 'Invalid event type format'),
    createdAt: parseDate,
    data: dataSchema,
  })
  .strict();

router.post('/log', async (req, res, next) => {
  try {
    const body = logEventSchema.parse(req.body);
    await storeEventLog({
      ...body,
      type: body.type.trim(),
      userAgent: req.get('user-agent') ?? null,
      ip: req.ip ?? null,
    });
    res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
