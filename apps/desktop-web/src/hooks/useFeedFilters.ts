"use client";

import { useCallback, useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import type { ReadonlyURLSearchParams } from "next/navigation";
import type { AdsQuery, FiltersCatalog } from "@/lib/ads";
import type { ProfileType } from "@anuncios/shared";

type AgeRangeState = {
  min: number;
  max: number;
};

type UseFeedFiltersParams = {
  initialFilters: AdsQuery;
  searchParams: ReadonlyURLSearchParams;
  router: {
    push: (href: string, options?: { scroll?: boolean }) => void;
  };
  profileTypePreference?: ProfileType | null;
  setProfileTypePreference: (profile: ProfileType) => void;
  ageConfig: FiltersCatalog["age"];
};

export type UseFeedFiltersResult = {
  profileType: ProfileType;
  ageRange: AgeRangeState;
  selectedServices: string[];
  selectedCity: string;
  searchValue: string;
  setSearchValue: Dispatch<SetStateAction<string>>;
  setSelectedServices: Dispatch<SetStateAction<string[]>>;
  setAgeRange: Dispatch<SetStateAction<AgeRangeState>>;
  applyFilters: (changes: Partial<AdsQuery>) => void;
  handleProfileToggle: (next: ProfileType) => void;
  handleCitySelect: (city: string) => void;
  handleServicesApply: (services: string[]) => void;
  handleAgeApply: (value?: number) => void;
  handleSearchSubmit: () => void;
};

export function useFeedFilters({
  initialFilters,
  router,
  searchParams,
  profileTypePreference,
  setProfileTypePreference,
  ageConfig,
}: UseFeedFiltersParams): UseFeedFiltersResult {
  const defaultAgeMax = ageConfig?.defaultValue ?? ageConfig.max;
  const [profileType, setProfileType] = useState<ProfileType>(
    initialFilters.profileType ?? profileTypePreference ?? "chicas",
  );
  const [ageRange, setAgeRange] = useState<AgeRangeState>({
    min: initialFilters.ageMin ?? ageConfig.min,
    max: initialFilters.ageMax ?? defaultAgeMax,
  });
  const [selectedServices, setSelectedServices] = useState<string[]>(initialFilters.services ?? []);
  const [selectedCity, setSelectedCity] = useState(initialFilters.city ?? "");
  const [searchValue, setSearchValue] = useState(initialFilters.text ?? "");

  useEffect(() => {
    setProfileType(initialFilters.profileType ?? profileTypePreference ?? "chicas");
  }, [initialFilters.profileType, profileTypePreference]);

  useEffect(() => {
    setAgeRange({
      min: initialFilters.ageMin ?? ageConfig.min,
      max: initialFilters.ageMax ?? defaultAgeMax,
    });
  }, [initialFilters.ageMin, initialFilters.ageMax, ageConfig.min, defaultAgeMax]);

  useEffect(() => {
    setSelectedServices(initialFilters.services ?? []);
  }, [initialFilters.services]);

  useEffect(() => {
    setSelectedCity(initialFilters.city ?? "");
  }, [initialFilters.city]);

  useEffect(() => {
    setSearchValue(initialFilters.text ?? "");
  }, [initialFilters.text]);

  const buildNavigationTarget = useCallback(
    (changes: Partial<AdsQuery>) => {
      const nextProfileType =
        changes.profileType ?? profileType ?? initialFilters.profileType ?? profileTypePreference ?? "chicas";
      const currentAgeMin = "ageMin" in changes ? changes.ageMin : ageRange.min;
      const currentAgeMax = "ageMax" in changes ? changes.ageMax : ageRange.max;
      const services = changes.services ?? selectedServices;
      const current = {
        ...initialFilters,
        profileType: nextProfileType,
        services,
        ageMin: currentAgeMin,
        ageMax: currentAgeMax,
        ...changes,
      };

      const shouldResetPage =
        "text" in changes ||
        "city" in changes ||
        "plan" in changes ||
        "services" in changes ||
        "ageMax" in changes ||
        "ageMin" in changes ||
        "profileType" in changes;

      if (shouldResetPage && !("page" in changes)) {
        current.page = 1;
      }
      const params = new URLSearchParams(searchParams.toString());

      updateParam(params, "profileType", current.profileType);
      updateParam(params, "text", current.text);
      updateParam(params, "city", current.city);
      updateParam(params, "plan", current.plan);
      updateParam(params, "ageMax", current.ageMax?.toString());
      updateParam(params, "ageMin", current.ageMin?.toString());
      updateParam(
        params,
        "featured",
        typeof current.featured === "boolean" ? String(current.featured) : undefined,
      );
      updateParam(params, "page", current.page && current.page > 1 ? String(current.page) : undefined);
      updateParam(params, "limit", current.limit ? String(current.limit) : undefined);

      params.delete("services");
      current.services?.forEach((service) => params.append("services", service));

      const query = params.toString();
      if (nextProfileType) {
        setProfileTypePreference(nextProfileType);
      }
      return query ? `?${query}` : "/feed";
    },
    [
      ageRange.max,
      ageRange.min,
      initialFilters,
      profileType,
      profileTypePreference,
      searchParams,
      selectedServices,
      setProfileTypePreference,
    ],
  );

  const applyFilters = useCallback(
    (changes: Partial<AdsQuery>) => {
      const target = buildNavigationTarget(changes);
      router.push(target, { scroll: false });
    },
    [buildNavigationTarget, router],
  );

  const handleProfileToggle = useCallback(
    (next: ProfileType) => {
      if (next === profileType) return;
      setProfileType(next);
      applyFilters({ profileType: next, page: 1 });
    },
    [applyFilters, profileType],
  );

  const handleCitySelect = useCallback(
    (city: string) => {
      setSelectedCity(city);
      applyFilters({ city: city || undefined });
    },
    [applyFilters],
  );

  const handleServicesApply = useCallback(
    (services: string[]) => {
      setSelectedServices(services);
      applyFilters({ services });
    },
    [applyFilters],
  );

  const handleAgeApply = useCallback(
    (value?: number) => {
      const nextRange: AgeRangeState = {
        ...ageRange,
        max: typeof value === "number" ? value : ageRange.max,
      };
      setAgeRange(nextRange);
      applyFilters({ ageMin: nextRange.min, ageMax: nextRange.max });
    },
    [ageRange, applyFilters],
  );

  const handleSearchSubmit = useCallback(() => {
    applyFilters({ text: searchValue || undefined });
  }, [applyFilters, searchValue]);

  return useMemo(
    () => ({
      profileType,
      ageRange,
      selectedServices,
      selectedCity,
      searchValue,
      setSearchValue,
      setSelectedServices,
      setAgeRange,
      applyFilters,
      handleProfileToggle,
      handleCitySelect,
      handleServicesApply,
      handleAgeApply,
      handleSearchSubmit,
    }),
    [
      ageRange,
      applyFilters,
      handleAgeApply,
      handleCitySelect,
      handleProfileToggle,
      handleSearchSubmit,
      handleServicesApply,
      profileType,
      searchValue,
      selectedCity,
      selectedServices,
    ],
  );
}

function updateParam(params: URLSearchParams, key: string, value?: string) {
  if (!value) {
    params.delete(key);
  } else {
    params.set(key, value);
  }
}
