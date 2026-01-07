import {
  MOCK_ADS,
  type AdRecord,
  type Plan,
  type ProfileType,
  type AdStatus,
  type AdMetadata,
} from "@anuncios/shared";
import { isApiConfigured } from "./httpClient";
import { authorizedJsonRequest, authorizedRequest, buildQueryString, ensureAccessToken } from "./apiClient";

export type OwnAdsFilters = {
  page?: number;
  limit?: number;
};

export type OwnAdsResponse = {
  items: AdRecord[];
  total: number;
  page: number;
  pages: number;
  limit: number;
};

export type BaseAdPayload = {
  title: string;
  description: string;
  city?: string;
  services?: string[];
  tags?: string[];
  profileType?: ProfileType;
  age?: number;
  priceFrom?: number;
  priceTo?: number;
  highlighted?: boolean;
  imageIds?: string[];
  metadata?: AdMetadata | null;
};

export type UpdateAdPayload = Partial<BaseAdPayload>;

const mockOwnAds: AdRecord[] = MOCK_ADS.map((ad) => ({
  id: ad.id,
  owner: ad.owner ?? null,
  title: ad.title,
  description: ad.description,
  city: ad.city ?? null,
  services: ad.services ?? [],
  tags: ad.tags ?? [],
  age: ad.age,
  priceFrom: ad.priceFrom,
  priceTo: ad.priceTo,
  plan: ad.plan,
  profileType: ad.profileType,
  highlighted: Boolean(ad.highlighted),
  status: ad.status,
  images: ad.images.map((image) => ({
    id: image.id,
    url: image.url,
    width: image.width ?? null,
    height: image.height ?? null,
    bytes: image.bytes ?? null,
    format: image.format ?? null,
  })),
  createdAt: ad.createdAt,
  updatedAt: ad.updatedAt,
  metadata: ad.metadata ?? null,
}));

function paginateMockAds(filters: OwnAdsFilters = {}): OwnAdsResponse {
  const total = mockOwnAds.length;
  const limit = filters.limit && filters.limit > 0 ? filters.limit : total || 1;
  const pages = Math.max(1, Math.ceil(total / limit));
  const page = filters.page && filters.page > 0 ? Math.min(filters.page, pages) : 1;
  const start = (page - 1) * limit;
  const items = mockOwnAds.slice(start, start + limit);
  return { items, total, page, pages, limit };
}

function buildQuery(filters?: OwnAdsFilters) {
  if (!filters) return "";
  return buildQueryString({
    page: filters.page,
    limit: filters.limit,
  });
}

export const adService = {
  async fetchOwnAds(token: string | null | undefined, filters?: OwnAdsFilters): Promise<OwnAdsResponse> {
    ensureAccessToken(token);
    if (!isApiConfigured()) {
      return paginateMockAds(filters);
    }
    const query = buildQuery(filters);
    return authorizedRequest<OwnAdsResponse>(`/ads/mine${query}`, token);
  },
  async createAd(token: string | null | undefined, payload: BaseAdPayload): Promise<AdRecord> {
    ensureAccessToken(token);
    return authorizedJsonRequest<AdRecord>("/ads", token, "POST", payload);
  },
  async updateAd(token: string | null | undefined, adId: string, payload: UpdateAdPayload): Promise<AdRecord> {
    ensureAccessToken(token);
    return authorizedJsonRequest<AdRecord>(`/ads/${adId}`, token, "PATCH", payload);
  },
  async publishAd(token: string | null | undefined, adId: string): Promise<AdRecord> {
    ensureAccessToken(token);
    return authorizedJsonRequest<AdRecord>(`/ads/${adId}/publish`, token, "POST");
  },
  async unpublishAd(token: string | null | undefined, adId: string): Promise<AdRecord> {
    ensureAccessToken(token);
    return authorizedJsonRequest<AdRecord>(`/ads/${adId}/unpublish`, token, "POST");
  },
  async deleteAd(token: string | null | undefined, adId: string): Promise<void> {
    ensureAccessToken(token);
    await authorizedJsonRequest<undefined>(`/ads/${adId}`, token, "DELETE");
  },
};

export type { AdRecord, Plan, ProfileType, AdStatus };
