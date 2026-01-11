import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  AdMetadata,
  AdStatus,
  AvailabilityRange,
  AvailabilitySlot,
  AvailabilityStatus,
  ContactChannels,
  MediaAsset,
  ProfileType,
  WeekDay,
} from "@anuncios/shared";
import { adService } from "@/services/ad.service";
import { logEvent } from "@/services/eventLogger";
import {
  AVAILABILITY_STATUS_OPTIONS,
  DATA_TAGS_BLUEPRINT,
  DEFAULT_SERVICE_OPTIONS,
  SOCIAL_TAGS_BLUEPRINT,
  WEEK_DAY_OPTIONS,
  type TagBlueprint,
} from "./constants";

export type AvatarMedia = {
  url: string;
  publicId: string;
};

export type ServiceItem = {
  label: string;
  active: boolean;
};

export type SelectableTag = TagBlueprint & { active: boolean };

type MiAnuncioDraft = {
  adId?: string;
  profileName: string;
  description: string;
  city: string;
  region: string;
  zone: string;
  images: MediaAsset[];
  services: ServiceItem[];
  contacts: ContactChannels;
  availability: AvailabilitySlot[];
  seed?: AdMetadata["seed"] | null;
  ranking?: AdMetadata["ranking"] | null;
  gender?: AdMetadata["gender"] | null;
  dataTags: SelectableTag[];
  socialTags: SelectableTag[];
  avatar: AvatarMedia | null;
  profileType: ProfileType;
  age?: number;
  status: AdStatus;
};

const defaultContacts: ContactChannels = {
  whatsapp: "",
  telegram: "",
  phone: "",
};

const defaultAvailability = (): AvailabilitySlot[] =>
  WEEK_DAY_OPTIONS.map(({ value }) => ({
    day: value,
    status: AVAILABILITY_STATUS_OPTIONS[0].value,
  }));

const defaultCustomRanges = (): AvailabilityRange[] => [{ from: "10:00", to: "18:00" }];

const buildTagState = (blueprint: TagBlueprint[]): SelectableTag[] =>
  blueprint.map((item) => ({ ...item, active: false }));

const createEmptyDraft = (): MiAnuncioDraft => ({
  profileName: "",
  description: "",
  city: "",
  region: "",
  zone: "",
  images: [],
  services: DEFAULT_SERVICE_OPTIONS.map((label) => ({ label, active: false })),
  contacts: { ...defaultContacts },
  availability: defaultAvailability(),
  seed: null,
  ranking: null,
  gender: null,
  dataTags: buildTagState(DATA_TAGS_BLUEPRINT),
  socialTags: buildTagState(SOCIAL_TAGS_BLUEPRINT),
  avatar: null,
  profileType: "chicas",
  status: "draft",
});

function mergeServices(active: string[]): ServiceItem[] {
  const normalized = new Set(DEFAULT_SERVICE_OPTIONS.map((label) => label.toLowerCase()));
  const base = DEFAULT_SERVICE_OPTIONS.map((label) => ({
    label,
    active: active.map((item) => item.toLowerCase()).includes(label.toLowerCase()),
  }));

  active.forEach((label) => {
    if (!normalized.has(label.toLowerCase())) {
      base.push({ label, active: true });
    }
  });

  return base;
}

function mergeTags(blueprint: TagBlueprint[], activeLabels: string[] | undefined): SelectableTag[] {
  const normalized = new Set((activeLabels ?? []).map((label) => label.toLowerCase()));
  return blueprint.map((item) => ({
    ...item,
    active: normalized.has(item.label.toLowerCase()),
  }));
}

function mapMetadataToAvailability(metadata?: AdMetadata | null) {
  if (!metadata?.availability || !metadata.availability.length) {
    return defaultAvailability();
  }
  return WEEK_DAY_OPTIONS.map(({ value }) => {
    const slot = metadata.availability?.find((item) => item.day === value);
    if (!slot) {
      return { day: value, status: "all_day" as AvailabilityStatus };
    }
    const rangesFromV2 = Array.isArray((slot as any).ranges) ? ((slot as any).ranges as AvailabilityRange[]) : undefined;
    const rangesFromV1 = slot.from && slot.to ? [{ from: slot.from, to: slot.to } satisfies AvailabilityRange] : undefined;
    const ranges = slot.status === "custom" ? rangesFromV2 ?? rangesFromV1 : undefined;

    return {
      day: slot.day,
      status: slot.status,
      from: slot.from,
      to: slot.to,
      ranges,
    };
  });
}

function mapAdToDraft(ad: MiAnuncioDraft & { adId: string }): MiAnuncioDraft;
function mapAdToDraft(ad: any): MiAnuncioDraft;
function mapAdToDraft(ad: any): MiAnuncioDraft {
  const metadata = (ad.metadata ?? null) as AdMetadata | null;
  const attributes = (metadata?.attributes as Record<string, unknown>) ?? {};
  const activeDataTags = Array.isArray(attributes.dataTags) ? (attributes.dataTags as string[]) : ad.tags ?? [];
  const activeSocialTags = Array.isArray(attributes.socialTags) ? (attributes.socialTags as string[]) : [];

  return {
    adId: ad.id,
    profileName: ad.title ?? "",
    description: ad.description ?? "",
    city: ad.city ?? metadata?.location?.city ?? "",
    region: metadata?.location?.region ?? "",
    zone: metadata?.location?.zone ?? "",
    images: Array.isArray(ad.images) ? ad.images : [],
    services: mergeServices(ad.services ?? []),
    contacts: {
      ...defaultContacts,
      ...(metadata?.contacts ?? {}),
    },
    availability: mapMetadataToAvailability(metadata),
    seed: metadata?.seed ?? null,
    ranking: metadata?.ranking ?? null,
    gender: metadata?.gender ?? null,
    dataTags: mergeTags(DATA_TAGS_BLUEPRINT, activeDataTags),
    socialTags: mergeTags(SOCIAL_TAGS_BLUEPRINT, activeSocialTags),
    avatar:
      attributes.avatarUrl && attributes.avatarPublicId
        ? {
            url: String(attributes.avatarUrl),
            publicId: String(attributes.avatarPublicId),
          }
        : null,
    profileType: ad.profileType ?? "chicas",
    age: ad.age ?? undefined,
    status: ad.status ?? "draft",
  };
}

function buildMetadata(state: MiAnuncioDraft): AdMetadata | null {
  const selectedDataTags = state.dataTags.filter((tag) => tag.active).map((tag) => tag.label);
  const selectedSocialTags = state.socialTags.filter((tag) => tag.active).map((tag) => tag.label);
  const attributes: Record<string, string | number | boolean | null | string[]> = {};
  if (state.avatar) {
    attributes.avatarUrl = state.avatar.url;
    attributes.avatarPublicId = state.avatar.publicId;
  }
  if (selectedDataTags.length) {
    attributes.dataTags = selectedDataTags;
  }
  if (selectedSocialTags.length) {
    attributes.socialTags = selectedSocialTags;
  }

  const metadata: AdMetadata = {
    contacts: state.contacts,
    location: {
      region: state.region || undefined,
      city: state.city || undefined,
      zone: state.zone || undefined,
    },
    availability: state.availability.map((slot) => {
      if (slot.status !== "custom") {
        return { day: slot.day, status: slot.status };
      }

      const ranges =
        Array.isArray((slot as any).ranges) && (slot as any).ranges.length
          ? ((slot as any).ranges as AvailabilityRange[])
          : slot.from && slot.to
            ? ([{ from: slot.from, to: slot.to }] as AvailabilityRange[])
            : defaultCustomRanges();

      const first = ranges[0];
      return {
        day: slot.day,
        status: slot.status,
        ranges,
        from: first?.from,
        to: first?.to,
      };
    }),
    attributes,
  };

  if (state.seed) {
    metadata.seed = state.seed;
  }
  if (state.ranking) {
    metadata.ranking = state.ranking;
  }
  if (state.gender) {
    metadata.gender = state.gender;
  }

  return metadata;
}

function buildPayload(state: MiAnuncioDraft) {
  const services = state.services.filter((service) => service.active).map((service) => service.label);
  const tags = [
    ...state.dataTags.filter((tag) => tag.active).map((tag) => tag.label),
    ...state.socialTags.filter((tag) => tag.active).map((tag) => tag.label),
  ];

  return {
    title: state.profileName || "Mi anuncio",
    description: state.description || "Sin descripcion",
    city: state.city || undefined,
    services,
    tags,
    profileType: state.profileType,
    age: state.age,
    imageIds: state.images.map((image) => image.id),
    metadata: buildMetadata(state),
  };
}

export function useMiAnuncioForm(accessToken?: string | null) {
  const [draft, setDraft] = useState<MiAnuncioDraft>(() => createEmptyDraft());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [saving, setSaving] = useState(false);
  const [publishState, setPublishState] = useState<"idle" | "publishing" | "unpublishing">("idle");

  const load = useCallback(async () => {
    if (!accessToken) {
      setDraft(createEmptyDraft());
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await adService.fetchOwnAds(accessToken, { page: 1, limit: 1 });
      const ad = response.items[0];
      setDraft(ad ? mapAdToDraft(ad) : createEmptyDraft());
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void load();
  }, [load]);

  const updateField = useCallback(
    (field: keyof MiAnuncioDraft, value: MiAnuncioDraft[keyof MiAnuncioDraft]) => {
      setDraft((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const updateContacts = useCallback((field: keyof ContactChannels, value: string) => {
    setDraft((prev) => ({
      ...prev,
      contacts: {
        ...prev.contacts,
        [field]: value,
      },
    }));
  }, []);

  const toggleService = useCallback((label: string) => {
    setDraft((prev) => ({
      ...prev,
      services: prev.services.map((service) =>
        service.label === label ? { ...service, active: !service.active } : service,
      ),
    }));
  }, []);

  const addService = useCallback((label: string) => {
    if (!label.trim()) return;
    setDraft((prev) => {
      if (prev.services.some((service) => service.label.toLowerCase() === label.toLowerCase())) {
        return prev;
      }
      return {
        ...prev,
        services: [...prev.services, { label, active: true }],
      };
    });
  }, []);

  const removeService = useCallback((label: string) => {
    setDraft((prev) => ({
      ...prev,
      services: prev.services.filter((service) => service.label !== label),
    }));
  }, []);

  const toggleTag = useCallback((collection: "dataTags" | "socialTags", id: string) => {
    setDraft((prev) => ({
      ...prev,
      [collection]: prev[collection].map((tag) => (tag.id === id ? { ...tag, active: !tag.active } : tag)),
    }));
  }, []);

  const updateAvailability = useCallback(
    (day: WeekDay, patch: Partial<AvailabilitySlot>) => {
      setDraft((prev) => ({
        ...prev,
        availability: prev.availability.map((slot) =>
          slot.day === day
            ? {
                ...slot,
                ...patch,
              }
            : slot,
        ),
      }));
    },
    [],
  );

  const addAvailabilityRange = useCallback((day: WeekDay) => {
    setDraft((prev) => ({
      ...prev,
      availability: prev.availability.map((slot) => {
        if (slot.day !== day) return slot;
        if (slot.status !== "custom") return slot;
        const current = (Array.isArray((slot as any).ranges) ? (slot as any).ranges : undefined) as AvailabilityRange[] | undefined;
        const ranges = (current?.length ? current : slot.from && slot.to ? [{ from: slot.from, to: slot.to }] : defaultCustomRanges()).slice(0, 5);
        if (ranges.length >= 5) return { ...slot, ranges };
        return { ...slot, ranges: [...ranges, { from: "16:00", to: "20:00" }] };
      }),
    }));
  }, []);

  const removeAvailabilityRange = useCallback((day: WeekDay, index: number) => {
    setDraft((prev) => ({
      ...prev,
      availability: prev.availability.map((slot) => {
        if (slot.day !== day) return slot;
        if (slot.status !== "custom") return slot;
        const current = (Array.isArray((slot as any).ranges) ? (slot as any).ranges : undefined) as AvailabilityRange[] | undefined;
        const ranges = (current?.length ? current : slot.from && slot.to ? [{ from: slot.from, to: slot.to }] : defaultCustomRanges()).slice(0, 5);
        const next = ranges.filter((_, i) => i !== index);
        const first = next[0];
        return { ...slot, ranges: next, from: first?.from, to: first?.to };
      }),
    }));
  }, []);

  const updateAvailabilityRange = useCallback((day: WeekDay, index: number, patch: Partial<AvailabilityRange>) => {
    setDraft((prev) => ({
      ...prev,
      availability: prev.availability.map((slot) => {
        if (slot.day !== day) return slot;
        if (slot.status !== "custom") return slot;
        const current = (Array.isArray((slot as any).ranges) ? (slot as any).ranges : undefined) as AvailabilityRange[] | undefined;
        const ranges = (current?.length ? current : slot.from && slot.to ? [{ from: slot.from, to: slot.to }] : defaultCustomRanges()).slice(0, 5);
        const next = ranges.map((range, i) => (i === index ? { ...range, ...patch } : range));
        const first = next[0];
        return { ...slot, ranges: next, from: first?.from, to: first?.to };
      }),
    }));
  }, []);

  const setAvatar = useCallback((avatar: AvatarMedia | null) => {
    setDraft((prev) => ({ ...prev, avatar }));
  }, []);

  const addImage = useCallback((media: MediaAsset) => {
    setDraft((prev) => {
      if (prev.images.some((image) => image.id === media.id)) {
        return prev;
      }
      return { ...prev, images: [...prev.images, media] };
    });
  }, []);

  const removeImage = useCallback((mediaId: string) => {
    setDraft((prev) => ({
      ...prev,
      images: prev.images.filter((image) => image.id !== mediaId),
    }));
  }, []);

  const saveDraft = useCallback(async () => {
    if (!accessToken) return;
    setSaving(true);
    setError(null);
    try {
      const payload = buildPayload(draft);
      const result = draft.adId
        ? await adService.updateAd(accessToken, draft.adId, payload)
        : await adService.createAd(accessToken, payload);
      setDraft(mapAdToDraft(result));
      logEvent("mi-anuncio:save", { adId: result.id });
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [accessToken, draft]);

  const publishAd = useCallback(async () => {
    if (!accessToken || !draft.adId) return;
    setPublishState("publishing");
    setError(null);
    try {
      const result = await adService.publishAd(accessToken, draft.adId);
      setDraft(mapAdToDraft(result));
      logEvent("mi-anuncio:publish", { adId: result.id });
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setPublishState("idle");
    }
  }, [accessToken, draft.adId]);

  const unpublishAd = useCallback(async () => {
    if (!accessToken || !draft.adId) return;
    setPublishState("unpublishing");
    setError(null);
    try {
      const result = await adService.unpublishAd(accessToken, draft.adId);
      setDraft(mapAdToDraft(result));
      logEvent("mi-anuncio:unpublish", { adId: result.id });
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setPublishState("idle");
    }
  }, [accessToken, draft.adId]);

  const meta = useMemo(
    () => ({
      hasPublishedAd: draft.status === "published",
      activeServices: draft.services.filter((service) => service.active).length,
      adId: draft.adId,
    }),
    [draft],
  );

  return {
    draft,
    loading,
    saving,
    publishState,
    error,
    meta,
    updateField,
    updateContacts,
    toggleService,
    addService,
    removeService,
    toggleDataTag: (id: string) => toggleTag("dataTags", id),
    toggleSocialTag: (id: string) => toggleTag("socialTags", id),
    updateAvailability,
    addAvailabilityRange,
    removeAvailabilityRange,
    updateAvailabilityRange,
    setAvatar,
    addImage,
    removeImage,
    saveDraft,
    publishAd,
    unpublishAd,
    refresh: load,
  };
}
