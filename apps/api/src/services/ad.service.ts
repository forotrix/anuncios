import createError from 'http-errors';
import { type FilterQuery } from 'mongoose';
import { Ad, type IAd } from '../models/Ad';
import { detachMediaFromAd, replaceAdMedia } from './media.service';
import { recordAudit } from './audit.service';
import type { AdMetadata, GenderIdentity, GenderSex, Plan, ProfileType } from '@anuncios/shared';
import { normalizeAdTitle } from '../utils/normalizeTitle';

const MAX_LIMIT = 50;
type AvailabilitySlot = NonNullable<AdMetadata['availability']>[number];
const ALLOWED_DAYS: AvailabilitySlot['day'][] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];
const ALLOWED_STATUS: AvailabilitySlot['status'][] = ['all_day', 'custom', 'unavailable'];
const MAX_AVAILABILITY_RANGES = 5;

type RawImage = {
  _id?: unknown;
  url?: string;
  bytes?: number;
  width?: number;
  height?: number;
  format?: string;
};

function normalizeId(value: unknown) {
  if (!value) return undefined;
  return typeof value === 'string' ? value : value.toString();
}

function mapImages(images: unknown): Array<{
  id: string;
  url: string;
  bytes: number | null;
  width: number | null;
  height: number | null;
  format: string | null;
}> {
  if (!Array.isArray(images)) return [];
  return images
    .map((img) => img as RawImage)
    .filter((img) => Boolean(img?._id && img?.url))
    .map((img) => ({
      id: normalizeId(img._id)!,
      url: img.url!,
      bytes: img.bytes ?? null,
      width: img.width ?? null,
      height: img.height ?? null,
      format: img.format ?? null,
    }));
}

function serializeAd(ad: any) {
  const { _id, owner, images, __v, ...rest } = ad;
  return {
    id: normalizeId(_id)!,
    owner: normalizeId(owner),
    ...rest,
    metadata: rest.metadata ?? null,
    images: mapImages(images),
  };
}

function sanitizeString(value?: string | null) {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

function sanitizeFiniteNumber(value: unknown) {
  if (typeof value !== 'number') return undefined;
  return Number.isFinite(value) ? value : undefined;
}

function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function sanitizeTime(value?: string | null) {
  const trimmed = sanitizeString(value);
  if (!trimmed) return undefined;
  if (!/^\d{2}:\d{2}$/.test(trimmed)) return undefined;
  return trimmed;
}

function timeToNumber(time: string) {
  return Number(time.replace(':', ''));
}

function sanitizeAvailabilityRanges(value: unknown): Array<{ from: string; to: string }> | undefined {
  if (!Array.isArray(value)) return undefined;

  const parsed = value
    .map((entry) => {
      if (!entry || typeof entry !== 'object') return null;
      const raw = entry as { from?: unknown; to?: unknown };
      const from = sanitizeTime(typeof raw.from === 'string' ? raw.from : undefined);
      const to = sanitizeTime(typeof raw.to === 'string' ? raw.to : undefined);
      if (!from || !to) return null;
      const start = timeToNumber(from);
      const end = timeToNumber(to);
      if (!Number.isFinite(start) || !Number.isFinite(end) || start >= end) return null;
      return { from, to, start, end };
    })
    .filter(Boolean) as Array<{ from: string; to: string; start: number; end: number }>;

  if (!parsed.length) return undefined;

  parsed.sort((a, b) => a.start - b.start || a.end - b.end);

  const nonOverlapping: Array<{ from: string; to: string; start: number; end: number }> = [];
  for (const range of parsed) {
    const prev = nonOverlapping[nonOverlapping.length - 1];
    if (prev && range.start < prev.end) continue;
    nonOverlapping.push(range);
    if (nonOverlapping.length >= MAX_AVAILABILITY_RANGES) break;
  }

  return nonOverlapping.map(({ from, to }) => ({ from, to }));
}

function sanitizeIsoDate(value: unknown) {
  const trimmed = typeof value === 'string' ? sanitizeString(value) : undefined;
  if (!trimmed) return undefined;
  const timestamp = Date.parse(trimmed);
  if (!Number.isFinite(timestamp)) return undefined;
  return new Date(timestamp).toISOString();
}

function sanitizeRankingMetadata(value: unknown): AdMetadata['ranking'] | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const raw = value as Record<string, unknown>;

  const boostFeatured = sanitizeFiniteNumber(raw.boostFeatured);
  const favoritesWeekly = sanitizeFiniteNumber(raw.favoritesWeekly);
  const favoritesTotal = sanitizeFiniteNumber(raw.favoritesTotal);
  const lastActiveAt = sanitizeIsoDate(raw.lastActiveAt);

  const ranking: NonNullable<AdMetadata['ranking']> = {
    boostFeatured: clampNumber(boostFeatured ?? 0, 0, 100),
    favoritesWeekly: clampNumber(favoritesWeekly ?? 0, 0, Number.MAX_SAFE_INTEGER),
  };

  if (typeof favoritesTotal === 'number') {
    ranking.favoritesTotal = clampNumber(favoritesTotal, 0, Number.MAX_SAFE_INTEGER);
  }
  if (lastActiveAt) {
    ranking.lastActiveAt = lastActiveAt;
  }

  if (!Object.keys(ranking).length) return undefined;
  return ranking;
}

function sanitizeSeedMetadata(value: unknown): AdMetadata['seed'] | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const raw = value as Record<string, unknown>;

  const seedBatch = sanitizeString(typeof raw.seedBatch === 'string' ? raw.seedBatch : undefined);
  const isMock = typeof raw.isMock === 'boolean' ? raw.isMock : undefined;

  if (!seedBatch || typeof isMock !== 'boolean') return undefined;
  return { seedBatch: seedBatch.slice(0, 80), isMock };
}

function sanitizeGenderMetadata(value: unknown): AdMetadata['gender'] | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const raw = value as Record<string, unknown>;
  const sex = sanitizeString(typeof raw.sex === 'string' ? raw.sex : undefined)?.toLowerCase();
  const identity = sanitizeString(typeof raw.identity === 'string' ? raw.identity : undefined)?.toLowerCase();
  if (sex !== 'female' && sex !== 'male') return undefined;
  if (identity !== 'cis' && identity !== 'trans') return undefined;
  return { sex, identity } as NonNullable<AdMetadata['gender']>;
}

function sanitizeMetadata(metadata?: AdMetadata | null): AdMetadata | null {
  if (!metadata || typeof metadata !== 'object') return null;
  const result: AdMetadata = {};

  if (metadata.contacts) {
    const contacts: NonNullable<AdMetadata['contacts']> = {};
    (['whatsapp', 'telegram', 'phone', 'email', 'website'] as const).forEach((key) => {
      const value = sanitizeString(metadata.contacts?.[key]);
      if (value) contacts[key] = value;
    });
    if (Object.keys(contacts).length) {
      result.contacts = contacts;
    }
  }

  if (metadata.location) {
    const location: NonNullable<AdMetadata['location']> = {};
    (['region', 'city', 'zone', 'address', 'reference'] as const).forEach((key) => {
      const value = sanitizeString(metadata.location?.[key]);
      if (value) location[key] = value;
    });
    if (Object.keys(location).length) {
      result.location = location;
    }
  }

  const ranking = sanitizeRankingMetadata(metadata.ranking);
  if (ranking) {
    result.ranking = ranking;
  }

  const seed = sanitizeSeedMetadata(metadata.seed);
  if (seed) {
    result.seed = seed;
  }

  const gender = sanitizeGenderMetadata(metadata.gender);
  if (gender) {
    result.gender = gender;
  }

  if (Array.isArray(metadata.availability)) {
    const slots = metadata.availability
      .map((slot) => {
        if (!slot || typeof slot !== 'object') return null;
        const rawDay = sanitizeString(slot.day as string)?.toLowerCase();
        const rawStatus = sanitizeString(slot.status as string)?.toLowerCase();
        if (!rawDay || !rawStatus) return null;
        if (!ALLOWED_DAYS.includes(rawDay as AvailabilitySlot['day'])) return null;
        if (!ALLOWED_STATUS.includes(rawStatus as AvailabilitySlot['status'])) return null;
        const status = rawStatus as AvailabilitySlot['status'];

        const ranges =
          status === 'custom'
            ? sanitizeAvailabilityRanges((slot as any).ranges) ?? undefined
            : undefined;
        const legacyFrom = status === 'custom' ? sanitizeTime((slot as any).from ?? undefined) : undefined;
        const legacyTo = status === 'custom' ? sanitizeTime((slot as any).to ?? undefined) : undefined;

        const derivedRanges =
          status === 'custom' && !ranges && legacyFrom && legacyTo
            ? sanitizeAvailabilityRanges([{ from: legacyFrom, to: legacyTo }])
            : undefined;

        const finalRanges = ranges ?? derivedRanges;
        const single = finalRanges?.length === 1 ? finalRanges[0] : undefined;

        return {
          day: rawDay as AvailabilitySlot['day'],
          status,
          from: status === 'custom' ? single?.from ?? legacyFrom : undefined,
          to: status === 'custom' ? single?.to ?? legacyTo : undefined,
          ranges: status === 'custom' ? finalRanges : undefined,
        };
      })
      .filter(Boolean) as AvailabilitySlot[];
    if (slots.length) {
      result.availability = slots;
    }
  }

  if (metadata.attributes && typeof metadata.attributes === 'object') {
    const attributes: Record<string, string | number | boolean | null | string[]> = {};
    Object.entries(metadata.attributes).forEach(([key, value]) => {
      if (value === null) {
        attributes[key] = null;
      } else if (Array.isArray(value)) {
        const items = value
          .filter((item): item is string => typeof item === 'string')
          .map((item) => item.trim())
          .filter(Boolean)
          .slice(0, 20);
        if (items.length) {
          attributes[key] = items;
        }
      } else if (['string', 'number', 'boolean'].includes(typeof value)) {
        attributes[key] = value as string | number | boolean;
      }
    });
    if (Object.keys(attributes).length) {
      result.attributes = attributes;
    }
  }

  return Object.keys(result).length ? result : null;
}

export type CreateAdInput = {
  title: string;
  description: string;
  city?: string;
  services?: string[];
  tags?: string[];
  age?: number;
  priceFrom?: number;
  priceTo?: number;
  profileType?: ProfileType;
  highlighted?: boolean;
  imageIds?: string[];
  metadata?: AdMetadata | null;
};

export type UpdateAdInput = Partial<Omit<CreateAdInput, 'title'>> & {
  title?: string;
};

export type ListFilters = {
  text?: string;
  city?: string;
  plan?: Plan;
  services?: string[];
  profileType?: ProfileType;
  sex?: GenderSex;
  identity?: GenderIdentity;
  ageMin?: number;
  ageMax?: number;
  featured?: boolean;
  weekly?: boolean;
  excludeIds?: string[];
};

function clampPagination(page = 1, limit = 20) {
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(Math.floor(limit), MAX_LIMIT) : 20;
  return { page: safePage, limit: safeLimit, skip: (safePage - 1) * safeLimit };
}

export async function createAd(ownerId: string, data: CreateAdInput) {
  const {
    title,
    imageIds = [],
    services = [],
    tags = [],
    profileType = 'chicas',
    highlighted = false,
    metadata,
    ...fields
  } = data;
  const ad = await Ad.create({
    ...fields,
    title: normalizeAdTitle(title),
    services,
    tags,
    profileType,
    highlighted,
    owner: ownerId,
    status: 'draft',
    images: [],
    metadata: sanitizeMetadata(metadata),
  });

  let result;
  if (imageIds.length) {
    const updated = await replaceAdMedia(ownerId, ad.id, imageIds);
    result = serializeAd(updated.toObject());
  } else {
    const fresh = await Ad.findById(ad.id).populate('images').lean();
    result = serializeAd(fresh!);
  }

  await recordAudit({
    action: 'ad:create',
    actorId: ownerId,
    targetId: result.id,
    metadata: { imageCount: result.images.length },
  });

  return result;
}

export async function listAds(filters: ListFilters, page = 1, limit = 20) {
  const { text, city, plan, services, profileType, sex, identity, ageMin, ageMax, featured, weekly, excludeIds } = filters;
  const { limit: safeLimit, skip, page: safePage } = clampPagination(page, limit);

  const query: FilterQuery<IAd> = { status: 'published' };
  if (excludeIds && excludeIds.length) {
    query._id = { $nin: excludeIds };
  }
  if (city) query.city = city;
  if (plan) query.plan = plan;
  if (text) query.title = { $regex: text, $options: 'i' };
  if (profileType) query.profileType = profileType;
  const genderClauses: any[] = [];
  if (sex) {
    if (sex === 'female') {
      genderClauses.push({
        $or: [
          { 'metadata.gender.sex': 'female' },
          { 'metadata.gender.sex': { $exists: false } },
          { 'metadata.gender': { $exists: false } },
          { metadata: { $exists: false } },
        ],
      });
    } else {
      genderClauses.push({ 'metadata.gender.sex': sex });
    }
  }
  if (identity) {
    if (identity === 'cis') {
      genderClauses.push({
        $or: [
          { 'metadata.gender.identity': 'cis' },
          { 'metadata.gender.identity': { $exists: false } },
          { 'metadata.gender': { $exists: false } },
          { metadata: { $exists: false } },
        ],
      });
    } else {
      genderClauses.push({ 'metadata.gender.identity': identity });
    }
  }
  if (genderClauses.length) {
    (query as any).$and = [...(((query as any).$and as any[]) ?? []), ...genderClauses];
  }
  if (typeof featured === 'boolean') query.highlighted = featured;
  if (services && services.length) {
    query.services = { $all: services };
  }
  if (typeof ageMin === 'number' || typeof ageMax === 'number') {
    const ageQuery: { $gte?: number; $lte?: number } = {};
    if (typeof ageMin === 'number') ageQuery.$gte = ageMin;
    if (typeof ageMax === 'number') ageQuery.$lte = ageMax;
    query.age = ageQuery as any;
  }

  const cityCountersQuery: FilterQuery<IAd> = { ...query };
  delete cityCountersQuery.city;

  const sort: Record<string, 1 | -1> = weekly
    ? { 'metadata.ranking.favoritesWeekly': -1, createdAt: -1 }
    : { plan: -1, createdAt: -1 };

  const [items, total, citySummary] = await Promise.all([
    Ad.find(query)
      .sort(sort)
      .skip(skip)
      .limit(safeLimit)
      .populate('images')
      .lean(),
    Ad.countDocuments(query),
    Ad.aggregate([
      { $match: cityCountersQuery },
      {
        $group: {
          _id: { $ifNull: ['$city', 'Sin zona'] },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          city: '$_id',
          count: 1,
        },
      },
      { $sort: { count: -1, city: 1 } },
    ]),
  ]);

  return {
    items: items.map(serializeAd),
    total,
    page: safePage,
    pages: Math.ceil(total / safeLimit),
    limit: safeLimit,
    cities: citySummary,
  };
}

export async function listOwnAds(ownerId: string, page = 1, limit = 20) {
  const { limit: safeLimit, skip, page: safePage } = clampPagination(page, limit);

  const [items, total] = await Promise.all([
    Ad.find({ owner: ownerId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .populate('images')
      .lean(),
    Ad.countDocuments({ owner: ownerId }),
  ]);

  return {
    items: items.map(serializeAd),
    total,
    page: safePage,
    pages: Math.ceil(total / safeLimit),
  };
}

export async function getPublicAd(id: string) {
  const ad = await Ad.findOne({ _id: id, status: 'published' }).populate('images').lean();
  if (!ad) throw createError(404, 'Not found');
  return serializeAd(ad);
}

export async function updateAd(ownerId: string, id: string, data: UpdateAdInput) {
  const ad = await Ad.findOne({ _id: id, owner: ownerId });
  if (!ad) throw createError(404, 'Not found');
  if (ad.status === 'blocked') throw createError(403, 'Ad blocked by admin');

  const { imageIds, services, tags, metadata, ...fields } = data;

  Object.assign(ad, fields);
  if (typeof fields.title === 'string') {
    ad.title = normalizeAdTitle(fields.title);
  }
  if (services) {
    ad.services = services;
  }
  if (tags) {
    ad.tags = tags;
  }
  if (metadata !== undefined) {
    ad.metadata = sanitizeMetadata(metadata);
  }

  let response;
  if (imageIds) {
    const updated = await replaceAdMedia(ownerId, ad.id, imageIds);
    response = serializeAd(updated.toObject());
  } else {
    await ad.save();
    const fresh = await Ad.findById(ad.id).populate('images').lean();
    response = serializeAd(fresh!);
  }

  await recordAudit({
    action: 'ad:update',
    actorId: ownerId,
    targetId: response.id,
    metadata: { imageCount: response.images.length },
  });

  return response;
}

export async function publishAd(ownerId: string, id: string) {
  const ad = await Ad.findOne({ _id: id, owner: ownerId });
  if (!ad) throw createError(404, 'Not found');
  if (ad.status === 'blocked') throw createError(403, 'Ad blocked by admin');
  if (ad.status === 'published') {
    await ad.populate('images');
    const current = serializeAd(ad.toObject());
    await recordAudit({
      action: 'ad:publish:noop',
      actorId: ownerId,
      targetId: current.id,
    });
    return current;
  }

  if (!ad.title || !ad.description) {
    throw createError(400, 'Missing required fields to publish');
  }

  if (!ad.images.length) {
    throw createError(400, 'Anuncio requiere al menos una imagen para publicar');
  }

  ad.status = 'published';
  await ad.save();
  await ad.populate('images');
  const result = serializeAd(ad.toObject());

  await recordAudit({
    action: 'ad:publish',
    actorId: ownerId,
    targetId: result.id,
  });

  return result;
}

export async function unpublishAd(ownerId: string, id: string) {
  const ad = await Ad.findOne({ _id: id, owner: ownerId });
  if (!ad) throw createError(404, 'Not found');

  if (ad.status === 'blocked') throw createError(403, 'Ad blocked by admin');
  if (ad.status === 'draft') {
    await ad.populate('images');
    const current = serializeAd(ad.toObject());
    await recordAudit({
      action: 'ad:unpublish:noop',
      actorId: ownerId,
      targetId: current.id,
    });
    return current;
  }

  ad.status = 'draft';
  await ad.save();
  await ad.populate('images');
  const result = serializeAd(ad.toObject());

  await recordAudit({
    action: 'ad:unpublish',
    actorId: ownerId,
    targetId: result.id,
  });

  return result;
}

export async function deleteAd(ownerId: string, id: string) {
  const ad = await Ad.findOneAndDelete({ _id: id, owner: ownerId });
  if (!ad) throw createError(404, 'Not found');
  await detachMediaFromAd(id);

  await recordAudit({
    action: 'ad:delete',
    actorId: ownerId,
    targetId: id,
  });
}
