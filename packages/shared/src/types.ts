// packages/shared/src/types.ts

// Roles de usuario en la plataforma
export type UserRole = 'admin' | 'agency' | 'provider' | 'customer';

// Estado de un anuncio
export type AdStatus = 'draft' | 'published' | 'blocked';

// Plan de suscripción asociado a un anuncio
export type Plan = 'basic' | 'premium';

// Tipos de perfil mostrados en el marketplace
export type ProfileType = 'chicas' | 'trans';

export type WeekDay =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export type AvailabilityStatus = 'all_day' | 'custom' | 'unavailable';

export type AvailabilityRange = {
  from: string;
  to: string;
};

export type AvailabilitySlot = {
  day: WeekDay;
  status: AvailabilityStatus;
  from?: string;
  to?: string;
  ranges?: AvailabilityRange[];
};

export type ContactChannels = {
  whatsapp?: string;
  telegram?: string;
  phone?: string;
  email?: string;
  website?: string;
};

export type LocationInfo = {
  region?: string;
  city?: string;
  zone?: string;
  address?: string;
  reference?: string;
};

export type MediaAsset = {
  id: string;
  url: string;
  width?: number | null;
  height?: number | null;
  bytes?: number | null;
  format?: string | null;
};

export type GenderSex = 'female' | 'male';
export type GenderIdentity = 'cis' | 'trans';

export type GenderMetadata = {
  sex: GenderSex;
  identity: GenderIdentity;
};

export type RankingMetadata = {
  boostFeatured: number;
  favoritesWeekly: number;
  favoritesTotal?: number;
  lastActiveAt?: string;
};

export type SeedMetadata = {
  seedBatch: string;
  isMock: boolean;
};

export type AdMetadata = {
  availability?: AvailabilitySlot[];
  contacts?: ContactChannels;
  location?: LocationInfo;
  ranking?: RankingMetadata;
  seed?: SeedMetadata;
  gender?: GenderMetadata;
  attributes?: Record<string, string | number | boolean | null | string[]>;
};

export type AdRecord = {
  id: string;
  owner?: string | null;
  title: string;
  description: string;
  city?: string | null;
  services: string[];
  tags: string[];
  age?: number;
  priceFrom?: number;
  priceTo?: number;
  plan: Plan;
  profileType?: ProfileType;
  highlighted: boolean;
  status: AdStatus;
  images: MediaAsset[];
  metadata?: AdMetadata | null;
  createdAt: string;
  updatedAt: string;
};

export type SubscriptionPeriod = 'monthly' | 'quarterly' | 'yearly';

export type SubscriptionPlanDefinition = {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  period: SubscriptionPeriod;
  features: string[];
  highlightColor?: string;
  badge?: string;
};

export type SubscriptionStatus = {
  planId: string;
  planName: string;
  status: 'trialing' | 'active' | 'past_due' | 'canceled';
  startedAt: string;
  renewsAt: string | null;
  autoRenew: boolean;
};

export type AnalyticsTimeseriesPoint = {
  date: string;
  value: number;
};

export type AnalyticsSummary = {
  totalViews: number;
  totalContacts: number;
  viewSeries: AnalyticsTimeseriesPoint[];
  contactSeries: AnalyticsTimeseriesPoint[];
  contactsByChannel: Record<string, number>;
  topAds: Array<{
    adId: string;
    title: string;
    views: number;
    contacts: number;
  }>;
};
