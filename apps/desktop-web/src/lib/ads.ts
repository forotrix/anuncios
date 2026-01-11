import type { AdMetadata, AdStatus, GenderIdentity, GenderSex, Plan, ProfileType } from "@anuncios/shared";
import { AGE_FILTER_CONFIG, SERVICE_FILTER_OPTIONS, MOCK_ADS } from "@anuncios/shared";
import type { MockBackendAd } from "@anuncios/shared";

export type MediaAsset = {
  id: string;
  url: string;
  width?: number | null;
  height?: number | null;
  bytes?: number | null;
  format?: string | null;
};

export type Ad = {
  id: string;
  ownerId?: string;
  title: string;
  description: string;
  city?: string;
  services: string[];
  tags: string[];
  age?: number;
  priceFrom?: number;
  priceTo?: number;
  plan: Plan;
  images: MediaAsset[];
  status: AdStatus;
  profileType?: ProfileType;
  highlighted?: boolean;
  createdAt: string;
  updatedAt: string;
  metadata?: AdMetadata | null;
};

type BackendAd = MockBackendAd & { plan: string };

const FALLBACK_ADS: Ad[] = MOCK_ADS.map(mapBackendAd);

export type AdsQuery = {
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
  page?: number;
  limit?: number;
  excludeIds?: string[];
};

export type FiltersCatalog = {
  services: typeof SERVICE_FILTER_OPTIONS;
  age: typeof AGE_FILTER_CONFIG;
};

export type CitySummary = {
  city: string;
  count: number;
};

export type AdsResult = {
  ads: Ad[];
  isMock: boolean;
  total: number;
  page: number;
  pages: number;
  limit: number;
  citySummary: CitySummary[];
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ?? "";

function mapBackendAd(ad: BackendAd): Ad {
  const services = ad.services ?? [];
  return {
    id: ad.id,
    ownerId: ad.owner,
    title: ad.title,
    description: ad.description,
    city: ad.city,
    services,
    tags: ad.tags ?? [],
    age: ad.age,
    priceFrom: ad.priceFrom,
    priceTo: ad.priceTo,
    plan: (ad.plan ?? "basic") as Plan,
    images: (ad.images ?? []).map((image) => ({
      id: image.id,
      url: image.url,
      width: image.width ?? null,
      height: image.height ?? null,
      bytes: image.bytes ?? null,
      format: image.format ?? null,
    })),
    status: ad.status,
    profileType: ad.profileType,
    highlighted: ad.highlighted ?? false,
    createdAt: ad.createdAt,
    updatedAt: ad.updatedAt,
    metadata: (ad as Partial<Ad>).metadata ?? null,
  };
}

const parseBackendResponse = (
  payload: unknown,
): { items: BackendAd[]; total: number; page: number; pages: number; limit: number; cities: CitySummary[] } => {
  if (!payload) {
    return { items: [], total: 0, page: 1, pages: 1, limit: 9, cities: [] };
  }

  if (Array.isArray(payload)) {
    const items = payload as BackendAd[];
    return { items, total: items.length, page: 1, pages: 1, limit: items.length, cities: [] };
  }

  if (typeof payload === "object" && payload) {
    const maybe = payload as {
      items?: unknown;
      total?: number;
      page?: number;
      pages?: number;
      limit?: number;
      cities?: unknown;
    };
    if (Array.isArray(maybe.items)) {
      return {
        items: maybe.items as BackendAd[],
        total: maybe.total ?? (maybe.items as BackendAd[]).length,
        page: maybe.page ?? 1,
        pages: maybe.pages ?? 1,
        limit: maybe.limit ?? (maybe.items as BackendAd[]).length,
        cities: Array.isArray(maybe.cities) ? normalizeCitySummary(maybe.cities) : [],
      };
    }
  }

  throw new Error("Formato de respuesta inesperado");
};

export function parseFiltersFromSearch(searchParams: Record<string, string | string[] | undefined>): AdsQuery {
  const services = normalizeArray(searchParams.services);
  const profileType = normalizeString(searchParams.profileType) as ProfileType | undefined;
  const sexRaw = normalizeString(searchParams.sex);
  const identityRaw = normalizeString(searchParams.identity);
  const sex = (sexRaw === "female" || sexRaw === "male" ? sexRaw : undefined) as GenderSex | undefined;
  const identity = (identityRaw === "cis" || identityRaw === "trans" ? identityRaw : undefined) as
    | GenderIdentity
    | undefined;
  const ageMax = toNumber(searchParams.ageMax);
  const ageMin = toNumber(searchParams.ageMin);
  const featured = normalizeBoolean(searchParams.featured);
  const page = toNumber(searchParams.page) ?? 1;
  const limit = toNumber(searchParams.limit) ?? 9;

  const inferredFromLegacy =
    !sex && !identity && profileType
      ? profileType === "trans"
        ? ({ sex: "female", identity: "trans" } as const)
        : ({ sex: "female", identity: "cis" } as const)
      : null;

  return {
    services,
    profileType: inferredFromLegacy ? undefined : profileType,
    sex: sex ?? inferredFromLegacy?.sex,
    identity: identity ?? inferredFromLegacy?.identity,
    ageMax,
    ageMin,
    featured,
    plan: normalizeString(searchParams.plan) as Plan | undefined,
    city: normalizeString(searchParams.city),
    text: normalizeString(searchParams.text),
    page,
    limit,
  };
}

function normalizeString(value?: string | string[]) {
  if (Array.isArray(value)) return value[0];
  return value;
}

function normalizeArray(value?: string | string[]) {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value];
}

function normalizeBoolean(value?: string | string[]) {
  const raw = normalizeString(value);
  if (raw === undefined) return undefined;
  if (raw === "true") return true;
  if (raw === "false") return false;
  return undefined;
}

function toNumber(value?: string | string[]) {
  const raw = normalizeString(value);
  if (!raw) return undefined;
  const num = Number(raw);
  return Number.isFinite(num) ? num : undefined;
}

function buildQueryString(filters?: AdsQuery) {
  if (!filters) return "";
  const params = new URLSearchParams();

  if (filters.text) params.set("text", filters.text);
  if (filters.city) params.set("city", filters.city);
  if (filters.plan) params.set("plan", filters.plan);
  if (filters.profileType) params.set("profileType", filters.profileType);
  if (filters.sex) params.set("sex", filters.sex);
  if (filters.identity) params.set("identity", filters.identity);
  if (typeof filters.ageMin === "number") params.set("ageMin", String(filters.ageMin));
  if (typeof filters.ageMax === "number") params.set("ageMax", String(filters.ageMax));
  if (typeof filters.featured === "boolean") params.set("featured", String(filters.featured));
  if (typeof filters.weekly === "boolean") params.set("weekly", String(filters.weekly));
  if (typeof filters.page === "number") params.set("page", String(filters.page));
  if (typeof filters.limit === "number") params.set("limit", String(filters.limit));
  filters.services?.forEach((service) => params.append("services", service));
  filters.excludeIds?.forEach((id) => params.append("excludeIds", id));

  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function fetchAds(filters?: AdsQuery): Promise<AdsResult> {
  if (!API_BASE_URL) {
    const citySummary = buildCitySummaryFromAds(FALLBACK_ADS);
    return {
      ads: FALLBACK_ADS,
      isMock: true,
      total: FALLBACK_ADS.length,
      page: 1,
      pages: 1,
      limit: filters?.limit ?? 9,
      citySummary,
    };
  }

  const query = buildQueryString(filters);

  try {
    const response = await fetch(`${API_BASE_URL}/ads${query}`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) throw new Error(`Respuesta ${response.status}`);
    const payload = await response.json();
    const { items, total, page, pages, limit, cities } = parseBackendResponse(payload);
    const mappedAds = items.map(mapBackendAd);
    const citySummary = cities.length ? cities : buildCitySummaryFromAds(mappedAds);
    return { ads: mappedAds, isMock: false, total, page, pages, limit, citySummary };
  } catch (error) {
    console.warn("[desktop-web] No se pudo contactar con la API, usando mocks", error);
    const citySummary = buildCitySummaryFromAds(FALLBACK_ADS);
    return {
      ads: FALLBACK_ADS,
      isMock: true,
      total: FALLBACK_ADS.length,
      page: 1,
      pages: 1,
      limit: filters?.limit ?? 9,
      citySummary,
    };
  }
}

export async function fetchFiltersCatalog(): Promise<FiltersCatalog> {
  if (!API_BASE_URL) {
    return { services: SERVICE_FILTER_OPTIONS, age: AGE_FILTER_CONFIG };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/ads/filters`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) throw new Error(`Respuesta ${response.status}`);
    const payload = (await response.json()) as Partial<FiltersCatalog>;
    return {
      services: payload.services ?? SERVICE_FILTER_OPTIONS,
      age: payload.age ?? AGE_FILTER_CONFIG,
    };
  } catch (error) {
    console.warn("[desktop-web] No se pudo obtener el catálogo de filtros, usando mocks", error);
    return { services: SERVICE_FILTER_OPTIONS, age: AGE_FILTER_CONFIG };
  }
}



function normalizeCitySummary(input: unknown): CitySummary[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null;
      const { city, count } = entry as { city?: unknown; count?: unknown };
      const label = typeof city === "string" && city.trim().length ? city : "Sin zona";
      const safeCount = Number(count ?? 0);
      return {
        city: label,
        count: Number.isFinite(safeCount) ? safeCount : 0,
      };
    })
    .filter((item): item is CitySummary => Boolean(item));
}

function buildCitySummaryFromAds(ads: Ad[]): CitySummary[] {
  const counts = ads.reduce<Record<string, number>>((acc, ad) => {
    const city = ad.city ?? "Sin zona";
    acc[city] = (acc[city] ?? 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts)
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return a.city.localeCompare(b.city);
    });
}

export async function fetchAdById(id: string): Promise<{ ad: Ad; isMock: boolean }> {
  if (!id) {
    throw new Error("Id de anuncio requerido");
  }

  if (!API_BASE_URL) {
    const fallback = FALLBACK_ADS.find((ad) => ad.id === id) ?? FALLBACK_ADS[0];
    if (!fallback) throw new Error("No hay anuncios disponibles");
    return { ad: fallback, isMock: true };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/ads/${id}`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) {
      throw new Error(`Respuesta ${response.status}`);
    }
    const payload = (await response.json()) as BackendAd;
    return { ad: mapBackendAd(payload), isMock: false };
  } catch (error) {
    console.warn("[desktop-web] No se pudo obtener el anuncio, usando mocks", error);
    const fallback = FALLBACK_ADS.find((ad) => ad.id === id) ?? FALLBACK_ADS[0];
    if (!fallback) throw error;
    return { ad: fallback, isMock: true };
  }
}
