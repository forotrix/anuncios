
"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CitySelector } from "@/components/CitySelector";
import { RegistrationModal } from "@/components/RegistrationModal/RegistrationModal";
import { SearchInput } from "@/components/SearchInput";
import { AgeRangeFilterControl } from "@/components/AgeRangeFilterControl";
import { ServiceFilterDropdown } from "@/components/ServiceFilterDropdown";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { useGenderPreference } from "@/hooks/useGenderPreference";
import type { Ad, AdsQuery, FiltersCatalog, CitySummary } from "@/lib/ads";
import { rankAds } from "@/lib/ranking";
import type { GenderIdentity, GenderSex } from "@anuncios/shared";

const FALLBACK_IMAGE = "https://res.cloudinary.com/dqhxthtby/image/upload/v1762882388/marina-hero.svg";

type PaginationMeta = {
  page: number;
  pages: number;
  total: number;
  limit: number;
};

type Props = {
  ads: Ad[];
  heroAds: Ad[];
  filtersCatalog: FiltersCatalog;
  initialFilters: AdsQuery;
  isMock: boolean;
  pagination?: PaginationMeta;
  citySummary: CitySummary[];
};

export const DesktopFeed = ({ ads, heroAds, filtersCatalog, initialFilters, pagination, citySummary }: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ageConfig = filtersCatalog.age;
  const defaultAgeMax = ageConfig?.defaultValue ?? ageConfig.max;
  const [ageRange, setAgeRange] = useState({
    min: initialFilters.ageMin ?? ageConfig.min,
    max: initialFilters.ageMax ?? defaultAgeMax,
  });
  const [showRegistration, setShowRegistration] = useState(false);
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
    const handleScroll = () => {
      setIsAtTop(window.scrollY <= 0);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const rankingSeed = `${sex}:${identity}:${initialFilters.city ?? "all"}`;
  const heroShowcase = useMemo(() => {
    if (heroAds.length) return rankAds(heroAds, "featured", rankingSeed);
    return rankAds(ads.slice(0, 3), "featured", rankingSeed);
  }, [ads, heroAds, rankingSeed]);
  const heroTotal = heroShowcase.length;
  const heroAd = heroShowcase[heroIndex] ?? heroShowcase[0] ?? ads[0] ?? null;
  const heroMeta = heroAd
    ? [heroAd.age ? `${heroAd.age} anos` : null, heroAd.city ?? null].filter(Boolean).join(" / ")
    : "";
  const heroTags = buildTagList(heroAd).slice(0, 4);
  const heroImage = heroAd ? getAdImage(heroAd) : FALLBACK_IMAGE;
  const heroGenderLabel = formatGenderLabel(sex, identity);

  const favoritesStart = heroAds.length ? 0 : heroTotal;
  const favoriteAds = ads.slice(favoritesStart, favoritesStart + 3);
  const gridAds = ads.slice(favoritesStart + favoriteAds.length);
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
    <div className="bg-[#020404] text-white">
      <div className="flex min-h-screen w-full flex-col">
        <SiteHeader
          genderSex={sex}
          genderIdentity={identity}
          onGenderSexChange={handleSexToggle}
          onGenderIdentityChange={handleIdentityToggle}
          logoHref={logoHref}
          onRegisterClick={() => setShowRegistration(true)}
        />

        <main className={`w-full flex-1 ${isAtTop ? "pt-[72px]" : ""}`}>
          <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-10 px-4 pb-24 pt-10 sm:px-6 lg:px-10">
            <section className="space-y-6">
              <div className="flex flex-col gap-3 rounded-[28px] border border-white/5 bg-[#050608]/60 p-4 text-sm text-white/60 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/50">Filtra por ciudad</p>
                  <p>Selecciona tu zona para personalizar los anuncios destacados.</p>
                </div>
                <div className="w-full sm:w-auto sm:min-w-[260px]">
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
              </div>

              <div className="rounded-[40px] border border-white/10 bg-[#050608]/95 px-6 py-8 shadow-[0_30px_80px_rgba(0,0,0,0.55)] sm:px-10 sm:py-12">
                {heroAd ? (
                  <>
                    <div className="flex flex-col gap-2 border-b border-white/5 pb-6 lg:flex-row lg:items-end lg:justify-between">
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/50">Anfitriona destacada</p>
                        <h1 className="font-h1-2-0 text-[length:var(--h1-2-0-font-size)] leading-[var(--h1-2-0-line-height)]">
                          {heroAd.title}
                        </h1>
                        <p className="text-base text-white/70">{heroMeta || "Sin datos"}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 pt-4 text-xs uppercase tracking-[0.3em]">
                        <span className="rounded-full border border-white/15 px-4 py-1 text-white/70">
                          {formatPlanLabel(heroAd.plan)}
                        </span>
                        <span className="rounded-full border border-white/15 px-4 py-1 text-white/70">{heroGenderLabel}</span>
                      </div>
                    </div>

                    <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr,0.9fr]">
                      <div className="space-y-6">
                        <p className="text-base text-white/70">
                          {heroAd.description?.trim().length ? heroAd.description :
                            "Monitorea anfitrionas con fotos verificadas y agendas activas para vivir experiencias premium."}
                        </p>
                        <div className="flex flex-wrap gap-2 text-xs text-white/70">
                          {heroTags.length ? (
                            heroTags.map((tag) => (
                              <span
                                key={`${heroAd.id}-${tag}`}
                                className="rounded-full border border-white/15 px-3 py-1 uppercase tracking-[0.25em]"
                              >
                                {tag.startsWith("#") ? tag : `#${tag}`}
                              </span>
                            ))
                          ) : (
                            <span className="text-white/50">Sin etiquetas disponibles.</span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                          <Link
                            href={heroAd.id ? `/anuncio/${heroAd.id}` : "/anuncio"}
                            className="rounded-full bg-[linear-gradient(119deg,rgba(135,0,5,1)_12%,rgba(172,7,13,1)_45%,rgba(208,29,35,1)_75%,rgba(236,76,81,1)_100%)] px-8 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-white shadow-shadow-g"
                          >
                            Ver perfil
                          </Link>
                          <p className="text-xs text-white/50">ID #{heroAd.id}</p>
                        </div>
                      </div>

                      <div className="relative">
                        <div className="overflow-hidden rounded-[32px] border border-white/10 bg-black/30 p-4">
                          <img src={heroImage} alt={heroAd.title} className="h-[420px] w-full rounded-[24px] object-cover" />
                        </div>
                        {heroAd.highlighted && (
                          <span className="absolute right-8 top-8 rounded-full bg-[#ec4c51] px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em]">
                            Top
                          </span>
                        )}
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
                          index === heroIndex ? "bg-rojo-cereza400" : "bg-white/20"
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

            <section className="rounded-[36px] border border-[#7a0f11]/40 bg-[#090204] px-6 py-8 shadow-[0_25px_60px_rgba(0,0,0,0.5)] sm:px-10">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">Seleccion semanal</p>
                <h2 className="font-h2-2-0 text-[length:var(--h2-2-0-font-size)] leading-[var(--h2-2-0-line-height)]">
                  Favoritas de la semana
                </h2>
                <p className="text-base text-white/70">
                  Curamos perfiles destacados segun actividad reciente y valoraciones de la comunidad.
                </p>
              </div>
              <div className="mt-8 grid gap-6 md:grid-cols-3">
                {displayedFavoriteAds.map((ad) => (
                  <FavoriteCard
                    key={ad.id}
                    ad={ad}
                    isFavorite={favoriteIds.includes(ad.id)}
                    onToggleFavorite={() => toggleFavorite(ad.id)}
                  />
                ))}
              </div>
            </section>

            <section className="rounded-[36px] border border-white/10 bg-[#050608]/80 px-6 py-8 shadow-[0_25px_60px_rgba(0,0,0,0.45)] sm:px-10">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">Catalogo completo</p>
                <h2 className="font-h2-2-0 text-[length:var(--h2-2-0-font-size)] leading-[var(--h2-2-0-line-height)]">
                  Las favoritas de ForoTrix
                </h2>
                <p className="text-base text-white/70">
                  Ajusta filtros para encontrar anuncios segun tus preferencias y guarda tus perfiles preferidos.
                </p>
              </div>

              <div className="mt-6 flex flex-col gap-4 md:flex-row md:flex-wrap md:items-center">
                <AgeRangeFilterControl
                  className="w-full md:w-auto"
                  label={ageConfig.label}
                  min={ageConfig.min}
                  max={ageConfig.max}
                  value={ageRange.max}
                  isOpen={isAgeOpen}
                  onToggle={toggleAge}
                  onChange={(value) =>
                    setAgeRange((prev) => ({
                      ...prev,
                      max: value ?? prev.max,
                    }))
                  }
                  onApply={(value) => {
                    const nextRange = {
                      ...ageRange,
                      max: value ?? ageRange.max,
                    };
                    setIsAgeOpen(false);
                    setAgeRange(nextRange);
                    applyFilters({ ageMin: nextRange.min, ageMax: nextRange.max });
                  }}
                />
                <ServiceFilterDropdown
                  className="w-full md:w-auto"
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
                <SearchInput
                  className="w-full md:max-w-md"
                  value={searchValue}
                  onChange={(val) => setSearchValue(val)}
                  onSubmit={() => applyFilters({ text: searchValue })}
                  isFocused={isSearchFocused}
                  onFocusChange={setIsSearchFocused}
                />
              </div>

              {displayedGridAds.length ? (
                <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
                className="justify-center pt-8"
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </section>
          </div>
        </main>

        <SiteFooter />
      </div>

      {showRegistration && (
        <RegistrationModal
          onClose={() => setShowRegistration(false)}
          variant="default"
        />
      )}
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
    "flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white transition hover:border-white/60 disabled:opacity-40";
  const pages = getVisiblePages(totalPages, currentPage);

  return (
    <div className={`inline-flex items-center gap-4 ${className}`}>
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={arrowButtonClass}
        aria-label="Pagina anterior"
      >
        &lt;
      </button>

      <div className="inline-flex items-center gap-1">
        {pages.map((item, index) =>
          item === "ellipsis" ? (
            <span
              key={`ellipsis-${index}`}
              className="flex h-10 w-10 items-center justify-center text-lg font-semibold text-white/40"
            >
              ...
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold transition ${
                item === currentPage
                  ? "border-rojo-cereza400 bg-rojo-cereza400/10 text-white"
                  : "border-transparent text-white/70 hover:border-white/40"
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
    return [{ city: "", label: "Espana", count: 0, isAll: true }];
  }
  const normalized = base
    .map((item) => ({
      city: item.city ?? "Sin zona",
      label: item.city ?? "Sin zona",
      count: item.count,
    }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

  const total = normalized.reduce((sum, option) => sum + option.count, 0);
  return [{ city: "", label: "Espana", count: total, isAll: true }, ...normalized];
}

type FavoriteCardProps = {
  ad: Ad;
  isFavorite: boolean;
  onToggleFavorite: () => void;
};

const FavoriteCard = ({ ad, isFavorite, onToggleFavorite }: FavoriteCardProps) => {
  const image = getAdImage(ad);
  const subtitle = [ad.city ?? "Sin ciudad", ad.age ? `${ad.age} anos` : null].filter(Boolean).join(" / ");
  const tags = buildTagList(ad).slice(0, 2);
  const isMock = Boolean(ad.metadata?.seed?.isMock);

  return (
    <article className="relative overflow-hidden rounded-[32px] border border-[#d52b33]/40 bg-[#0b0406] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.45)]">
      <div className="overflow-hidden rounded-[24px] border border-white/10">
        <img src={image} alt={ad.title ?? "Anuncio destacado"} className="h-56 w-full object-cover" />
      </div>
      <div className="mt-4 space-y-1">
        <h3 className="text-lg font-semibold">{ad.title ?? "Anuncio destacado"}</h3>
        <p className="text-sm text-white/60">{subtitle}</p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/60">
        {tags.length ? (
          tags.map((tag) => (
            <span key={`${ad.id}-${tag}`} className="rounded-full border border-white/15 px-3 py-1">
              {tag.startsWith("#") ? tag : `#${tag}`}
            </span>
          ))
        ) : (
          <span className="text-white/40">Sin etiquetas</span>
        )}
      </div>
      <div className="mt-5 flex items-center justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-white/15 px-3 py-1 text-[11px] uppercase tracking-[0.35em] text-white/60">
            {formatPlanLabel(ad.plan)}
          </span>
          {isMock && (
            <span className="rounded-full border border-white/15 px-3 py-1 text-[11px] uppercase tracking-[0.35em] text-white/60">
              Perfil de prueba
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/anuncio/${ad.id}`}
            className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/80 transition hover:border-white/40"
          >
            Ver perfil
          </Link>
          <button
            type="button"
            onClick={onToggleFavorite}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-black/30 text-white transition hover:border-white/60"
            aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
          >
            <img src={isFavorite ? "/img/star-1-1.svg" : "/img/star-1-27.svg"} alt="" className="h-5 w-5" />
          </button>
        </div>
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
  const subtitle = [ad.city ?? "Sin ciudad", ad.age ? `${ad.age} anos` : null].filter(Boolean).join(" / ");
  const tags = buildTagList(ad).slice(0, 3);
  const isMock = Boolean(ad.metadata?.seed?.isMock);

  return (
    <article className="group relative overflow-hidden rounded-[32px] border border-white/10 bg-[#060709] shadow-[0_25px_60px_rgba(0,0,0,0.45)]">
      <div className="relative h-72 w-full overflow-hidden">
        <img
          src={image}
          alt={ad.title ?? "Anuncio"}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute left-4 top-4 flex gap-2 text-xs uppercase tracking-[0.35em]">
          <span className="rounded-full bg-black/60 px-3 py-1 text-white">{formatPlanLabel(ad.plan)}</span>
          {ad.highlighted && <span className="rounded-full bg-[#ec4c51] px-3 py-1 text-white">Top</span>}
          {isMock && <span className="rounded-full bg-black/60 px-3 py-1 text-white">Perfil de prueba</span>}
        </div>
        <button
          type="button"
          onClick={onToggleFavorite}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-black/50 text-white transition hover:border-white/70"
          aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
        >
          <img src={isFavorite ? "/img/star-1-1.svg" : "/img/star-1-27.svg"} alt="" className="h-5 w-5" />
        </button>
      </div>
      <div className="space-y-4 px-6 py-6">
        <div>
          <h3 className="text-xl font-semibold">{ad.title ?? "Anuncio destacado"}</h3>
          <p className="text-sm text-white/60">{subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-white/60">
          {tags.length ? (
            tags.map((tag) => (
              <span key={`${ad.id}-${tag}`} className="rounded-full border border-white/15 px-3 py-1">
                {tag.startsWith("#") ? tag : `#${tag}`}
              </span>
            ))
          ) : (
            <span className="text-white/40">Sin etiquetas</span>
          )}
        </div>
        <Link
          href={`/anuncio/${ad.id}`}
          className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(119deg,rgba(135,0,5,1)_12%,rgba(172,7,13,1)_45%,rgba(208,29,35,1)_75%,rgba(236,76,81,1)_100%)] px-6 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-shadow-g"
        >
          Ver perfil
        </Link>
      </div>
    </article>
  );
};

function buildTagList(ad?: Ad | null) {
  if (!ad) return [];
  if (Array.isArray(ad.tags) && ad.tags.length) return ad.tags;
  if (Array.isArray(ad.services) && ad.services.length) return ad.services;
  return [];
}

function getAdImage(ad?: Ad | null) {
  if (!ad) return FALLBACK_IMAGE;
  return ad.images?.[0]?.url ?? FALLBACK_IMAGE;
}

function formatPlanLabel(plan?: string | null) {
  if (plan === "premium") return "Plan premium";
  if (plan === "featured") return "Plan destacado";
  return "Plan basico";
}

function formatGenderLabel(sex: GenderSex, identity: GenderIdentity) {
  if (sex === "male") return identity === "trans" ? "Chicos trans" : "Chicos";
  return identity === "trans" ? "Chicas trans" : "Chicas";
}
