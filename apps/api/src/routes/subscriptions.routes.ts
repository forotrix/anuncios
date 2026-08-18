import { Router } from 'express';
import { SUBSCRIPTION_PLANS } from '@anuncios/shared';

const router = Router();

// Catalogo estatico - no depende de Stripe. El estado real de suscripcion
// por usuario (current/changePlan/autoRenew) todavia no existe: se
// implementara cuando se conecte una cuenta de Stripe real.
router.get('/plans', (_req, res) => {
  res.json(SUBSCRIPTION_PLANS);
});

export default router;
