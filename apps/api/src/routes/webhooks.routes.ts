import { Router } from 'express';

const router = Router();

// Esqueleto: cuando se conecte Stripe de verdad, este handler necesitara el
// body en crudo (express.raw) para verificar la firma del webhook con
// stripe.webhooks.constructEvent - no puede pasar por el JSON parser global.
router.post('/stripe', (_req, res) => {
  res.status(501).json({ error: 'Stripe webhook not implemented yet' });
});

export default router;
