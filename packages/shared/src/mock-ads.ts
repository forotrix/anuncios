import type { AdMetadata, AdStatus, Plan, ProfileType } from './types';

export type MockBackendAd = {
  id: string;
  owner?: string;
  title: string;
  description: string;
  city?: string;
  services?: string[];
  priceFrom?: number;
  priceTo?: number;
  images: Array<{
    id: string;
    url: string;
    width?: number | null;
    height?: number | null;
    bytes?: number | null;
    format?: string | null;
  }>;
  status: AdStatus;
  plan: Plan;
  profileType?: ProfileType;
  tags?: string[];
  age?: number;
  highlighted?: boolean;
  createdAt: string;
  updatedAt: string;
  metadata?: AdMetadata | null;
};

export const MOCK_ADS: MockBackendAd[] = [
  {
    id: 'mock-1',
    owner: 'provider-123',
    title: 'Masajes relajantes en Barcelona',
    description:
      'Sesiones personalizadas de masaje relajante y descontracturante en pleno centro de Barcelona. Ambiente tranquilo, música suave y aceites esenciales.',
    city: 'Barcelona',
    services: ['Masajes', 'Spa'],
    priceFrom: 60,
    priceTo: 120,
    plan: 'premium',
    profileType: 'chicas',
    tags: ['masaje', 'spa'],
    age: 24,
    highlighted: true,
    metadata: {
      gender: { sex: 'female', identity: 'cis' },
    },
    images: [
      {
        id: 'mock-1-image',
        url: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=900&q=80',
        width: 900,
        height: 600,
        bytes: null,
        format: null,
      },
    ],
    status: 'published',
    createdAt: '2024-07-12T09:00:00.000Z',
    updatedAt: '2024-09-18T11:30:00.000Z',
  },
  {
    id: 'mock-2',
    owner: 'provider-456',
    title: 'Sesiones de yoga y mindfulness',
    description:
      'Clases particulares y en grupo de yoga restaurativo. Ideal para reducir el estrés diario y mejorar la flexibilidad.',
    city: 'Madrid',
    services: ['Yoga', 'Mindfulness'],
    priceFrom: 35,
    priceTo: 80,
    profileType: 'chicas',
    tags: ['yoga', 'mindfulness'],
    age: 29,
    plan: 'basic',
    metadata: {
      gender: { sex: 'female', identity: 'cis' },
    },
    images: [
      {
        id: 'mock-2-image',
        url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=900&q=80',
        width: 900,
        height: 600,
        bytes: null,
        format: null,
      },
    ],
    status: 'published',
    createdAt: '2024-06-03T15:20:00.000Z',
    updatedAt: '2024-10-01T08:45:00.000Z',
  },
  {
    id: 'mock-3',
    owner: 'provider-789',
    title: 'Acompañamiento premium en Valencia',
    description:
      'Experiencias personalizadas y discretas en la ciudad de Valencia. Atención exclusiva y profesionalidad garantizada.',
    city: 'Valencia',
    services: ['Acompañantes'],
    priceFrom: 120,
    priceTo: 250,
    profileType: 'chicas',
    tags: ['acompañantes'],
    age: 27,
    highlighted: true,
    plan: 'premium',
    metadata: {
      gender: { sex: 'female', identity: 'cis' },
    },
    images: [
      {
        id: 'mock-3-image',
        url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80',
        width: 900,
        height: 600,
        bytes: null,
        format: null,
      },
    ],
    status: 'published',
    createdAt: '2024-05-20T19:10:00.000Z',
    updatedAt: '2024-09-27T12:05:00.000Z',
  },
  {
    id: 'mock-4',
    owner: 'provider-321',
    title: 'Terapia sensorial en Sevilla',
    description:
      'Sesiones privadas de terapia sensorial y bienestar. Espacio seguro, confidencial y adaptado a tus necesidades.',
    city: 'Sevilla',
    services: ['Terapias'],
    priceFrom: 80,
    priceTo: 150,
    profileType: 'trans',
    tags: ['terapias'],
    age: 26,
    plan: 'basic',
    metadata: {
      gender: { sex: 'female', identity: 'trans' },
    },
    images: [
      {
        id: 'mock-4-image',
        url: 'https://images.unsplash.com/photo-1612157777902-5382bc6e864b?auto=format&fit=crop&w=900&q=80',
        width: 900,
        height: 600,
        bytes: null,
        format: null,
      },
    ],
    status: 'published',
    createdAt: '2024-08-08T17:40:00.000Z',
    updatedAt: '2024-10-05T09:15:00.000Z',
  },
];

