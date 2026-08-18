// packages/shared/src/subscriptions.ts
// Catalogo de planes: fuente unica compartida por frontend y backend. Los
// precios de Stripe (stripePriceId) se rellenan cuando exista la cuenta real;
// hasta entonces esto es solo informativo, no hay cobro real en ningun sitio.

import type { SubscriptionPlanDefinition } from './types';

export const SUBSCRIPTION_PLANS: SubscriptionPlanDefinition[] = [
  {
    id: 'basic',
    name: 'Básico',
    description: 'Presencia esencial dentro del marketplace.',
    price: 29,
    currency: 'EUR',
    period: 'monthly',
    features: ['Hasta 1 anuncio publicado', 'Soporte estandar', 'Visibilidad en listados'],
    highlightColor: '#C2185B',
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Mayor exposición y herramientas adicionales.',
    price: 59,
    currency: 'EUR',
    period: 'monthly',
    features: [
      'Hasta 3 anuncios publicados',
      'Acceso a estadísticas',
      'Prioridad en listados',
      'Soporte prioritario',
    ],
    highlightColor: '#FF7043',
    badge: 'Popular',
  },
  {
    id: 'vip',
    name: 'VIP',
    description: 'Máxima visibilidad y soporte dedicado.',
    price: 99,
    currency: 'EUR',
    period: 'monthly',
    features: [
      'Anuncios ilimitados',
      'Destacados permanentes',
      'Reportes avanzados',
      'Account manager dedicado',
    ],
    highlightColor: '#FFD54F',
    badge: 'Exclusive',
  },
];
