import { Router } from 'express';
import { HERO_ASSETS } from '@anuncios/shared';
import { env } from '../config/env';

const router = Router();

router.get('/hero', (_req, res) => {
  const items = HERO_ASSETS.map((asset) => {
    const publicId = `${env.storage.cloudinary.baseFolder}/${asset.publicId}`;
    return {
      ...asset,
      publicId,
      url: `https://res.cloudinary.com/${env.storage.cloudinary.cloudName}/image/upload/${publicId}`,
    };
  });
  res.json({ items });
});

export default router;
