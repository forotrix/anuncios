import { Router } from 'express';
import auth from './auth.routes';
import ads from './ad.routes';
import media from './media.routes';
import assets from './assets.routes';
import events from './event-log.routes';
import admin from './admin.routes';
import subscriptions from './subscriptions.routes';
import webhooks from './webhooks.routes';

const router = Router();
router.get('/health', (_req, res) => res.json({ ok: true }));
router.use('/auth', auth);
router.use('/ads', ads);
router.use('/media', media);
router.use('/assets', assets);
router.use('/events', events);
router.use('/admin', admin);
router.use('/subscriptions', subscriptions);
router.use('/webhooks', webhooks);

export default router;
