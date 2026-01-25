
"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CitySelector } from "@/components/CitySelector";
import { SearchInput } from "@/components/SearchInput";
import { AgeRangeFilterControl } from "@/components/AgeRangeFilterControl";
import { ServiceFilterDropdown } from "@/components/ServiceFilterDropdown";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { useGenderPreference } from "@/hooks/useGenderPreference";
import type { Ad, AdsQuery, FiltersCatalog, CitySummary } from "@/lib/ads";
import { rankAds } from "@/lib/ranking";
import type { GenderIdentity, GenderSex } from "@anuncios/shared";
import { SERVICE_FILTER_OPTIONS } from "@anuncios/shared";
import { ASSETS } from "@/constants/assets";
import { useAuth } from "@/hooks/useAuth";
import { useAuthModal } from "@/hooks/useAuthModal";

const FALLBACK_IMAGE = "https://res.cloudinary.com/dqhxthtby/image/upload/v1762882388/marina-hero.svg";
const SERVICE_LABELS = Object.fromEntries(SERVICE_FILTER_OPTIONS.map((option) => [option.id, option.label]));

type PaginationMeta = {
  page: number;
  pages: number;
  total: number;
  limit: number;
};

type Props = {
  ads: Ad[];
  heroAds: Ad[];
  weeklyAds?: Ad[];
  filtersCatalog: FiltersCatalog;
  initialFilters: AdsQuery;
  isMock: boolean;
  pagination?: PaginationMeta;
  citySummary: CitySummary[];
};

export const DesktopFeed = ({ ads, heroAds, weeklyAds, filtersCatalog, initialFilters, pagination, citySummary }: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
  const { openRegister } = useAuthModal();
  const ageConfig = filtersCatalog.age;
  const defaultAgeMax = ageConfig?.defaultValue ?? ageConfig.max;
  const [ageRange, setAgeRange] = useState({
    min: initialFilters.ageMin ?? ageConfig.min,
    max: initialFilters.ageMax ?? defaultAgeMax,
  });
  const [isAgeOpen, setIsAgeOpen] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>(initialFilters.services ?? []);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState(initialFilters.text ?? "");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const { sexPreference, identityPreference, setSexPreference, setIdentityPreference } = useGenderPreference({
    sex: initialFilters.sex,
    identity: initialFilters.identity,
  });
  const [sex, setSex] = useState<GenderSex>(initialFilters.sex ?? sexPreference ?? "female");
  const [identity, setIdentity] = useState<GenderIdentity>(initialFilters.identity ?? identityPreference ?? "cis");
  const [heroIndex, setHeroIndex] = useState(0);
  const [isAtTop, setIsAtTop] = useState(true);
  const topSentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSex(initialFilters.sex ?? sexPreference ?? "female");
  }, [initialFilters.sex, sexPreference]);

  useEffect(() => {
    setIdentity(initialFilters.identity ?? identityPreference ?? "cis");
  }, [initialFilters.identity, identityPreference]);

  useEffect(() => {
    setHeroIndex(0);
  }, [heroAds, ads]);

  useEffect(() => {
    const sentinel = topSentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsAtTop(entry.isIntersecting);
      },
      { threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const rankingSeed = `${sex}:${identity}:${initialFilters.city ?? "all"}`;
  const heroShowcase = useMemo(() => {
    if (heroAds.length) return rankAds(heroAds, "featured", rankingSeed);
    return rankAds(ads.slice(0, 3), "featured", rankingSeed);
  }, [ads, heroAds, rankingSeed]);
  const heroTotal = heroShowcase.length;
  const heroAd = heroShowcase[heroIndex] ?? heroShowcase[0] ?? ads[0] ?? null;
  const heroMeta = heroAd
    ? [heroAd.age ? `${heroAd.age} años` : null, heroAd.city ?? null].filter(Boolean).join(" / ")
    : "";
  const heroTags = buildTagList(heroAd).slice(0, 4);
  const heroImage = heroAd ? getAdImage(heroAd) : FALLBACK_IMAGE;
  const heroSrcSet = buildCloudinarySrcSet(heroImage, [520, 720, 960, 1200]);
  const heroGenderLabel = formatGenderLabel(sex, identity);

  const favoritesStart = heroAds.length ? 0 : heroTotal;
  const favoriteAds = weeklyAds?.length ? weeklyAds : ads.slice(favoritesStart, favoritesStart + 3);
  const gridAds = weeklyAds?.length ? ads : ads.slice(favoritesStart + favoriteAds.length);
  const displayedFavoriteAds = favoriteAds.length
    ? rankAds(favoriteAds, "weekly", rankingSeed)
    : heroShowcase.length
      ? heroShowcase
      : ads.slice(0, 3);
  const displayedGridAds = gridAds.length ? gridAds : ads.slice(Math.min(favoritesStart, ads.length));
  const currentPage = initialFilters.page ?? 1;
  const limit = pagination?.limit ?? initialFilters.limit ?? 9;
  const totalPages = pagination?.pages ?? Math.max(1, Math.ceil((pagination?.total ?? displayedGridAds.length) / limit));
  const cityOptions = useMemo(() => buildCityOptions(citySummary, ads), [citySummary, ads]);
  const [selectedCity, setSelectedCity] = useState(initialFilters.city ?? "");

  useEffect(() => {
    setSelectedCity(initialFilters.city ?? "");
  }, [initialFilters.city]);

  useEffect(() => {
    setAgeRange({
      min: initialFilters.ageMin ?? ageConfig.min,
      max: initialFilters.ageMax ?? defaultAgeMax,
    });
  }, [initialFilters.ageMin, initialFilters.ageMax, ageConfig.min, defaultAgeMax]);

  const toggleAge = () => {
    setIsAgeOpen((prev) => !prev);
    setIsServicesOpen(false);
  };

  const toggleServices = () => {
    setIsServicesOpen((prev) => !prev);
    setIsAgeOpen(false);
  };

  const applyFilters = (changes: Partial<AdsQuery>) => {
    const nextSex = changes.sex ?? sex ?? initialFilters.sex ?? sexPreference;
    const nextIdentity = changes.identity ?? identity ?? initialFilters.identity ?? identityPreference;
    const currentAgeMin = "ageMin" in changes ? changes.ageMin : ageRange.min;
    const currentAgeMax = "ageMax" in changes ? changes.ageMax : ageRange.max;
    const current = {
      ...initialFilters,
      profileType: undefined,
      sex: nextSex,
      identity: nextIdentity,
      services: selectedServices,
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
      "profileType" in changes ||
      "sex" in changes ||
      "identity" in changes;

    if (shouldResetPage && !("page" in changes)) {
      current.page = 1;
    }
    const params = new URLSearchParams(searchParams.toString());

    params.delete("profileType");
    updateParam(params, "sex", current.sex);
    updateParam(params, "identity", current.identity);
    updateParam(params, "text", current.text);
    updateParam(params, "city", current.city);
    updateParam(params, "plan", current.plan);
    updateParam(params, "ageMax", current.ageMax?.toString());
    updateParam(params, "ageMin", current.ageMin?.toString());
    updateParam(params, "featured", typeof current.featured === "boolean" ? String(current.featured) : undefined);
    updateParam(params, "page", current.page && current.page > 1 ? String(current.page) : undefined);
    updateParam(params, "limit", current.limit ? String(current.limit) : undefined);

    params.delete("services");
    current.services?.forEach((service) => params.append("services", service));

    const query = params.toString();
    if (nextSex) setSexPreference(nextSex);
    if (nextIdentity) setIdentityPreference(nextIdentity);
    router.push(query ? `?${query}` : "/feed", { scroll: false });
  };

  const servicesOptions = useMemo(() => filtersCatalog.services, [filtersCatalog.services]);

  const toggleFavorite = (id: string) => {
    if (!isAuthenticated) {
      openRegister();
      return;
    }
    setFavoriteIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleSexToggle = (next: GenderSex) => {
    if (next === sex) return;
    setSex(next);
    applyFilters({ sex: next, profileType: undefined, page: 1 });
  };

  const handleIdentityToggle = (next: GenderIdentity) => {
    if (next === identity) return;
    setIdentity(next);
    applyFilters({ identity: next, profileType: undefined, page: 1 });
  };

  const handlePageChange = (page: number) => {
    if (page === currentPage || page < 1 || page > totalPages) return;
    applyFilters({ page });
  };

  const goHeroPrevious = () => {
    if (!heroTotal) return;
    setHeroIndex((prev) => (prev - 1 + heroTotal) % heroTotal);
  };

  const goHeroNext = () => {
    if (!heroTotal) return;
    setHeroIndex((prev) => (prev + 1) % heroTotal);
  };

  const handleHeroSelect = (index: number) => {
    if (!heroTotal) return;
    setHeroIndex(index);
  };

  const logoHref = sex === "female" && identity === "cis" ? "/feed" : `/feed?sex=${sex}&identity=${identity}`;

  return (
    <div className="bg-black text-white">
      <div className="flex min-h-screen w-full flex-col">
        <SiteHeader
          genderSex={sex}
          genderIdentity={identity}
          onGenderSexChange={handleSexToggle}
          onGenderIdentityChange={handleIdentityToggle}
          logoHref={logoHref}
          onRegisterClick={openRegister}
        />

        <main
          className={`w-full flex-1 transition-[padding-top] duration-200 ease-out ${
            isAtTop ? "pt-[72px] md:pt-[168px]" : ""
          }`}
        >
          <div ref={topSentinelRef} aria-hidden="true" />
          <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6 px-3 pb-20 pt-6 sm:px-6 md:gap-10 md:pt-10 lg:px-10">
            <section className="space-y-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="w-full sm:w-auto sm:min-w-[220px]">
                  <CitySelector
                    className="w-full"
                    options={cityOptions}
                    value={selectedCity}
                    onSelect={(city) => {
                      setSelectedCity(city);
                      applyFilters({ city: city || undefined });
                    }}
                  />
                </div>
                <div className="inline-flex h-[42px] items-center gap-2 self-end rounded-full border border-white/50 bg-transparent px-4 text-white shadow-[0_6px_20px_rgba(0,0,0,0.45)] sm:self-auto">
                  <img
                    src={ASSETS.flagEs}
                    alt="España"
                    className="h-6 w-8 rounded-sm object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path d="M5 7.5 10 12.5 15 7.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>

              <div className="px-2 py-4 sm:px-4 sm:py-6">
                {heroAd ? (
                  <>
                    <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
                      <div className="space-y-3">
                        <p className="text-[19px] font-semibold tracking-[0.01em] text-white">Perfiles destacados</p>
                      </div>
                    </div>

                    <div className="mt-6 grid items-stretch gap-6 lg:grid-cols-[0.9fr,1.1fr]">
                      <div className="order-2 flex min-h-[0] flex-col justify-between lg:order-1 lg:min-h-[460px]">
                        <div className="space-y-3 text-center lg:text-left">
                          <h1 className="text-xl font-semibold leading-tight sm:text-2xl lg:text-4xl">
                            {heroAd.title}
                          </h1>
                          <div className="text-sm text-white/70">
                            <p>{heroAd.age ? `${heroAd.age} años` : "Sin edad"}</p>
                            <p>{heroAd.city ?? "Sin ciudad"}</p>
                          </div>
                          <p className="text-sm text-white/70 sm:max-w-[420px]">
                            {heroAd.description?.trim().length ? heroAd.description :
                              "Monitorea anfitrionas con fotos verificadas y agendas activas para vivir experiencias premium."}
                          </p>
                          <div className="flex flex-wrap gap-2 text-xs text-white/70">
                            {heroTags.length ? (
                              heroTags.map((tag) => (
                                <span key={`${heroAd.id}-${tag}`} className="tracking-[0.02em]">
                                  {tag.startsWith("#") ? tag : `#${tag}`}
                                </span>
                              ))
                            ) : (
                              <span className="text-white/50">Sin etiquetas disponibles.</span>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-center lg:justify-start">
                          <Link
                            href={heroAd.id ? `/anuncio/${heroAd.id}` : "/anuncio"}
                            className="rounded-full bg-[linear-gradient(119deg,rgba(135,0,5,1)_12%,rgba(172,7,13,1)_45%,rgba(208,29,35,1)_75%,rgba(236,76,81,1)_100%)] px-6 py-2.5 text-sm font-semibold text-white shadow-shadow-g"
                          >
                            Ver perfil
                          </Link>
                        </div>
                      </div>

                      <div className="order-1 relative lg:order-2">
                        <img
                          src={heroImage}
                          srcSet={heroSrcSet}
                          sizes="(max-width: 1024px) 100vw, 600px"
                          alt={heroAd.title}
                          className="h-[260px] w-full rounded-[40px] object-cover object-top shadow-[0_30px_80px_rgba(0,0,0,0.6)] sm:h-[360px] lg:h-[460px]"
                          loading="eager"
                          decoding="async"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-white/60">No hay anuncios destacados disponibles por ahora.</p>
                )}
              </div>

              {heroTotal > 1 && (
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={goHeroPrevious}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white transition hover:border-white/60"
                    aria-label="Anuncio anterior"
                  >
                    &lt;
                  </button>
                  <div className="flex items-center gap-2">
                    {heroShowcase.map((item, index) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleHeroSelect(index)}
                        className={`h-2.5 w-6 rounded-full transition ${
                          index === heroIndex
                            ? "bg-[linear-gradient(119deg,rgba(135,0,5,1)_12%,rgba(172,7,13,1)_45%,rgba(208,29,35,1)_75%,rgba(236,76,81,1)_100%)]"
                            : "bg-white/20"
                        }`}
                        aria-label={`Ver ${item.title}`}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={goHeroNext}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white transition hover:border-white/60"
                    aria-label="Anuncio siguiente"
                  >
                    &gt;
                  </button>
                </div>
              )}
            </section>

            <section className="space-y-4">
              <h2 className="text-[19px] font-semibold tracking-[0.01em] text-white">Perfiles de la semana</h2>
              <div className="rounded-[28px] border border-[#7a0f11]/60 bg-[#090204] p-4 shadow-[0_25px_60px_rgba(0,0,0,0.5)] sm:p-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {displayedFavoriteAds.map((ad) => (
                    <FavoriteCard
                      key={ad.id}
                      ad={ad}
                      isFavorite={favoriteIds.includes(ad.id)}
                      onToggleFavorite={() => toggleFavorite(ad.id)}
                    />
                  ))}
                </div>
              </div>
            </section>

            <section className="space-y-6 pt-2">
              <h2 className="text-[19px] font-semibold tracking-[0.01em] text-white">Explora perfiles</h2>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3 overflow-x-auto pb-1 sm:overflow-visible sm:pb-0">
                  <AgeRangeFilterControl
                    className="!h-[52px] !w-[120px] shrink-0 sm:!w-[130px]"
                    label={ageConfig.label}
                    min={ageConfig.min}
                    max={ageConfig.max}
                    minValue={ageRange.min}
                    maxValue={ageRange.max}
                    isOpen={isAgeOpen}
                    onToggle={toggleAge}
                    onChange={({ min, max }) =>
                      setAgeRange(() => ({
                        min,
                        max,
                      }))
                    }
                    onApply={({ min, max }) => {
                      const nextRange = {
                        min,
                        max,
                      };
                      setIsAgeOpen(false);
                      setAgeRange(nextRange);
                      applyFilters({ ageMin: nextRange.min, ageMax: nextRange.max });
                    }}
                  />
                  <ServiceFilterDropdown
                    className="!h-[52px] !w-[132px] shrink-0 sm:!w-[140px]"
                    label="Filtrar"
                    options={servicesOptions}
                    selectedOptions={selectedServices}
                    isOpen={isServicesOpen}
                    onToggle={toggleServices}
                    onChange={setSelectedServices}
                    onApply={(selected) => {
                      setIsServicesOpen(false);
                      setSelectedServices(selected);
                      applyFilters({ services: selected });
                    }}
                  />
                </div>
                <SearchInput
                  className="!h-[52px] !w-full !rounded-full !px-5 sm:!w-[260px]"
                  value={searchValue}
                  onChange={(val) => setSearchValue(val)}
                  onSubmit={() => applyFilters({ text: searchValue })}
                  isFocused={isSearchFocused}
                  onFocusChange={setIsSearchFocused}
                />
              </div>

              {displayedGridAds.length ? (
                <div className="mt-8 grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {displayedGridAds.map((ad) => (
                    <FeedCard
                      key={ad.id}
                      ad={ad}
                      isFavorite={favoriteIds.includes(ad.id)}
                      onToggleFavorite={() => toggleFavorite(ad.id)}
                    />
                  ))}
                </div>
              ) : (
                <p className="mt-8 text-sm text-white/60">No hay anuncios para los filtros seleccionados.</p>
              )}

              <PaginationControls
                className="justify-center pt-8 w-full"
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </section>
          </div>
        </main>

        <SiteFooter />
      </div>

    </div>
  );
};

type PaginationControlsProps = {
  className?: string;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

function PaginationControls({ className = "", currentPage, totalPages, onPageChange }: PaginationControlsProps) {
  const arrowButtonClass =
    "flex h-9 w-9 items-center justify-center rounded-full border border-white/30 text-sm text-white transition hover:border-white/60 disabled:opacity-40 sm:h-10 sm:w-10";
  const pages = getVisiblePages(totalPages, currentPage);

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={arrowButtonClass}
        aria-label="Pagina anterior"
      >
        &lt;
      </button>

      <div className="inline-flex items-center gap-2">
        {pages.map((item, index) =>
          item === "ellipsis" ? (
            <span
              key={`ellipsis-${index}`}
              className="flex h-9 w-9 items-center justify-center text-base font-semibold text-white/40 sm:h-10 sm:w-10"
            >
              ...
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold transition sm:h-10 sm:w-10 ${
                item === currentPage
                  ? "border-rojo-cereza400 text-white"
                  : "border-white/30 text-white/70 hover:border-white/60"
              }`}
              aria-label={`Ir a la pagina ${item}`}
            >
              {item}
            </button>
          ),
        )}
      </div>

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={arrowButtonClass}
        aria-label="Pagina siguiente"
      >
        &gt;
      </button>
    </div>
  );
}

function getVisiblePages(totalPages: number, currentPage: number) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }
  const pages: Array<number | "ellipsis"> = [];
  const addPage = (page: number) => {
    if (!pages.includes(page)) pages.push(page);
  };

  addPage(1);
  if (currentPage > 3) {
    pages.push("ellipsis");
  }
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  for (let page = start; page <= end; page += 1) {
    addPage(page);
  }

  if (currentPage < totalPages - 2) {
    pages.push("ellipsis");
  }

  addPage(totalPages);
  return pages;
}

function updateParam(params: URLSearchParams, key: string, value?: string) {
  if (!value) {
    params.delete(key);
  } else {
    params.set(key, value);
  }
}

function buildCityOptions(summary: CitySummary[], ads: Ad[]) {
  let base = summary;
  if (!base.length) {
    const counts = ads.reduce<Record<string, number>>((acc, ad) => {
      const city = ad.city ?? "Sin zona";
      acc[city] = (acc[city] ?? 0) + 1;
      return acc;
    }, {});
    base = Object.entries(counts).map(([city, count]) => ({ city, count }));
  }

  if (!base.length) {
    return [{ city: "", label: "España", count: 0, isAll: true }];
  }
  const normalized = base
    .map((item) => ({
      city: item.city ?? "Sin zona",
      label: item.city ?? "Sin zona",
      count: item.count,
    }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

  const total = normalized.reduce((sum, option) => sum + option.count, 0);
  return [{ city: "", label: "España", count: total, isAll: true }, ...normalized];
}

type FavoriteCardProps = {
  ad: Ad;
  isFavorite: boolean;
  onToggleFavorite: () => void;
};

const FavoriteCard = ({ ad, isFavorite, onToggleFavorite }: FavoriteCardProps) => {
  const image = getAdImage(ad);
  const srcSet = buildCloudinarySrcSet(image, [360, 520, 720]);
  const subtitle = [ad.city ?? "Sin ciudad", ad.age ? `${ad.age} años` : null].filter(Boolean).join(" / ");
  const tags = buildTagList(ad).slice(0, 2);
  const isMock = Boolean(ad.metadata?.seed?.isMock);

  return (
    <article className="relative overflow-hidden rounded-[20px] border border-[#d52b33]/60 bg-[linear-gradient(135deg,#3a0d15_0%,#200608_70%,#140405_100%)] p-2.5 shadow-[0_22px_50px_rgba(213,43,51,0.2)] sm:p-3">
      <div className="overflow-hidden rounded-[16px]">
        <img
          src={image}
          srcSet={srcSet}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
          alt={ad.title ?? "Anuncio destacado"}
          className="h-48 w-full rounded-[16px] object-cover object-[50%_20%] sm:h-56"
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className="mt-3 space-y-1">
        <h3 className="text-base font-semibold">{ad.title ?? "Anuncio destacado"}</h3>
        <p className="text-xs text-white/70">{subtitle}</p>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <Link
          href={`/anuncio/${ad.id}`}
          className="rounded-full bg-[linear-gradient(119deg,rgba(135,0,5,1)_12%,rgba(172,7,13,1)_45%,rgba(208,29,35,1)_75%,rgba(236,76,81,1)_100%)] px-4 py-2 text-[13px] font-semibold text-white"
        >
          Ver perfil
        </Link>
        <button
          type="button"
          onClick={onToggleFavorite}
          className={`flex h-8 w-8 items-center justify-center rounded-full border transition ${
            isFavorite
              ? "border-[#ec4c51] bg-[#ec4c51]/20 text-white"
              : "border-white/30 bg-black/30 text-white"
          }`}
          aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
        >
          <img src={isFavorite ? "/img/star-1-1.svg" : "/img/star-1-27.svg"} alt="" className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
};

type FeedCardProps = {
  ad: Ad;
  isFavorite: boolean;
  onToggleFavorite: () => void;
};

const FeedCard = ({ ad, isFavorite, onToggleFavorite }: FeedCardProps) => {
  const image = getAdImage(ad);
  const srcSet = buildCloudinarySrcSet(image, [360, 520, 720]);
  const subtitle = ad.city ?? "Sin ciudad";
  const titleLine = `${ad.title ?? "Anuncio"}${ad.age ? `, ${ad.age} años` : ""}`;
  const isMock = Boolean(ad.metadata?.seed?.isMock);

  return (
    <article className="group relative overflow-hidden rounded-[28px] border border-[#7a0f11]/60 bg-[#090204] shadow-[0_20px_50px_rgba(0,0,0,0.5)] ring-1 ring-[#7a0f11]/25">
      <div className="relative h-60 w-full overflow-hidden sm:h-72">
        <img
          src={image}
          srcSet={srcSet}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
          alt={ad.title ?? "Anuncio"}
          className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-105"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        {isMock && (
          <span className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-white">
            Perfil de prueba
          </span>
        )}
        <button
          type="button"
          onClick={onToggleFavorite}
          className={`absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border transition ${
            isFavorite
              ? "border-[#ec4c51] bg-[#ec4c51]/20 text-white"
              : "border-white/30 bg-black/30 text-white hover:border-white/60"
          }`}
          aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
        >
          <img src={isFavorite ? "/img/star-1-1.svg" : "/img/star-1-27.svg"} alt="" className="h-4 w-4" />
        </button>
        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-white">{titleLine}</h3>
            <p className="text-xs text-white/70">{subtitle}</p>
          </div>
          <Link
            href={`/anuncio/${ad.id}`}
            className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(119deg,rgba(135,0,5,1)_12%,rgba(172,7,13,1)_45%,rgba(208,29,35,1)_75%,rgba(236,76,81,1)_100%)] px-3 py-1 text-[11px] font-semibold text-white shadow-shadow-g"
          >
            Ver perfil
          </Link>
        </div>
      </div>
    </article>
  );
};

function buildTagList(ad?: Ad | null) {
  if (!ad) return [];
  if (Array.isArray(ad.tags) && ad.tags.length) {
    return ad.tags.map((tag) => SERVICE_LABELS[tag] ?? tag);
  }
  if (Array.isArray(ad.services) && ad.services.length) {
    return ad.services.map((service) => SERVICE_LABELS[service] ?? service);
  }
  return [];
}

function getAdImage(ad?: Ad | null) {
  if (!ad) return FALLBACK_IMAGE;
  return ad.images?.[0]?.url ?? FALLBACK_IMAGE;
}

function buildCloudinaryUrl(url: string, width: number) {
  if (!url.includes("/image/upload/")) return url;
  return url.replace("/image/upload/", `/image/upload/w_${width},c_fill,q_auto,f_auto/`);
}

function buildCloudinarySrcSet(url?: string | null, widths: number[] = [360, 520, 720]) {
  if (!url) return undefined;
  if (!url.includes("/image/upload/")) return undefined;
  return widths.map((width) => `${buildCloudinaryUrl(url, width)} ${width}w`).join(", ");
}

function formatPlanLabel(plan?: string | null) {
  if (plan === "premium") return "Plan premium";
  if (plan === "featured") return "Plan destacado";
  return "Plan básico";
}

function formatGenderLabel(sex: GenderSex, identity: GenderIdentity) {
  if (sex === "male") return identity === "trans" ? "Chicos trans" : "Chicos";
  return identity === "trans" ? "Chicas trans" : "Chicas";
}
