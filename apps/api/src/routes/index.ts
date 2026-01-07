import { Router } from 'express';
import auth from './auth.routes';
import ads from './ad.routes';
import media from './media.routes';
import assets from './assets.routes';
import events from './event-log.routes';

const router = Router();
router.get('/health', (_req, res) => res.json({ ok: true }));
router.use('/auth', auth);
router.use('/ads', ads);
router.use('/media', media);
router.use('/assets', assets);
router.use('/events', events);
export default router;
