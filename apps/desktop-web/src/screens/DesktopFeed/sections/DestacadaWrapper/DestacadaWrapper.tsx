"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { BotonChicas } from "@/components/BotonChicas";
import { CarouselIndicators } from "@/components/CarouselIndicators";
import type { Ad } from "@/lib/ads";
import { SERVICE_FILTER_OPTIONS } from "@anuncios/shared";

type Slide = {
  id: string;
  title: string;
  age?: number;
  city?: string;
  description: string;
  tags: string[];
  image: string;
  link?: string;
};

const HERO_FALLBACKS: Slide[] = [
  {
    id: "hero-marina",
    title: "Marina",
    age: 23,
    city: "Barcelona",
    description:
      "Soy Marina, una joven apasionada y discreta. Te ofrezco compañía, masajes eróticos y encuentros llenos de placer y complicidad.",
    tags: ["#masajes", "#BDSM", "#latina"],
    image: "https://res.cloudinary.com/dqhxthtby/image/upload/v1762882388/kiara-hero.svg",
  },
  {
    id: "hero-valentina",
    title: "Valentina",
    age: 25,
    city: "Madrid",
    description: "Sesiones exclusivas de tantra y mindfulness para reconectar con tus sentidos en un entorno seguro.",
    tags: ["#tantra", "#relax", "#mindfulness"],
    image: "https://res.cloudinary.com/dqhxthtby/image/upload/v1762882388/valentina-hero.svg",
  },
  {
    id: "hero-kiara",
    title: "Kiara",
    age: 27,
    city: "Valencia",
    description: "Compañía premium para viajes y eventos. Elegancia, discreción y experiencias diseñadas a tu medida.",
    tags: ["#lujo", "#viajes", "#gfe"],
    image: "https://res.cloudinary.com/dqhxthtby/image/upload/v1762882388/marina-hero.svg",
  },
] as const;

const FALLBACK_SLIDES: Slide[] = HERO_FALLBACKS.map((fallback) => ({
  ...fallback,
  tags: [...fallback.tags],
}));

type Props = {
  ads: Ad[];
};

export const DestacadaWrapper = ({ ads }: Props) => {
  const serviceLabelMap = useMemo(
    () => Object.fromEntries(SERVICE_FILTER_OPTIONS.map((option) => [option.id, option.label])),
    [],
  );
  const slides = useMemo<Slide[]>(() => {
    if (!ads.length) {
      return FALLBACK_SLIDES;
    }

    const slidesFromAds = ads.reduce<Slide[]>((allSlides, ad, adIndex) => {
      const fallback = HERO_FALLBACKS[adIndex % HERO_FALLBACKS.length];
      const base: Slide = {
        id: ad.id ?? fallback.id,
        title: ad.title ?? fallback.title,
        age: ad.age ?? fallback.age,
        city: ad.city ?? fallback.city,
        description: ad.description ?? fallback.description,
        tags:
          ad.tags && ad.tags.length
            ? ad.tags.slice(0, 3).map((raw) => {
                const cleaned = raw.startsWith("#") ? raw.slice(1) : raw;
                const label = serviceLabelMap[cleaned] ?? cleaned;
                return `#${label}`;
              })
            : [...fallback.tags],
        image: ad.images?.[0]?.url ?? fallback.image,
        link: ad.id ? `/anuncio/${ad.id}` : undefined,
      };

      const photoSources = (ad.images ?? [])
        .map((image) => image.url)
        .filter((url): url is string => Boolean(url));

      const uniqueSources = photoSources.filter((url, index, arr) => arr.indexOf(url) === index);
      const sources = uniqueSources.length ? uniqueSources : [base.image];

      sources.forEach((image, index) => {
        allSlides.push({
          ...base,
          id: `${base.id}-photo-${index}`,
          image,
        });
      });

      return allSlides;
    }, []);

    if (slidesFromAds.length >= HERO_FALLBACKS.length) {
      return slidesFromAds;
    }

    const usedTitles = new Set(slidesFromAds.map((slide) => slide.title));
    const fillerNeeded = Math.max(0, HERO_FALLBACKS.length - slidesFromAds.length);
    const filler = FALLBACK_SLIDES.filter((slide) => !usedTitles.has(slide.title))
      .slice(0, fillerNeeded)
      .map((slide, index) => ({
        ...slide,
        id: `${slide.id}-fallback-${index}`,
        tags: [...slide.tags],
      }));

    return [...slidesFromAds, ...filler];
  }, [ads, serviceLabelMap]);

  const sliderRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
    sliderRef.current?.scrollTo({ left: 0 });
  }, [slides]);

  const handleScroll = () => {
    const container = sliderRef.current;
    if (!container) return;
    const nextIndex = Math.round(container.scrollLeft / container.clientWidth);
    if (nextIndex !== activeIndex) {
      setActiveIndex(Math.max(0, Math.min(slides.length - 1, nextIndex)));
    }
  };

  const handleSelect = (index: number) => {
    const container = sliderRef.current;
    if (!container) return;
    const clamped = Math.max(0, Math.min(slides.length - 1, index));
    container.scrollTo({ left: clamped * container.clientWidth, behavior: "smooth" });
    setActiveIndex(clamped);
  };

  return (
    <div className="absolute left-[132px] top-[230px] flex w-[1177px] flex-col items-end gap-[18px]">
      <div
        ref={sliderRef}
        className="flex w-full snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        onScroll={handleScroll}
      >
        {slides.map((slide) => (
          <article key={slide.id} className="flex w-full flex-none items-end gap-[142px] pr-6 snap-start">
            <div className="flex w-[550px] flex-col items-start gap-9">
              <div className="flex flex-col items-start gap-10 self-stretch">
                <div className="flex w-[220px] flex-col items-start">
                  <span className="font-h1-2-0 text-[length:var(--h1-2-0-font-size)] leading-[var(--h1-2-0-line-height)] text-white">
                    {slide.title}
                  </span>
                  {slide.age && (
                    <span className="font-h2-subtitulos-o-secciones text-[length:var(--h2-subtitulos-o-secciones-font-size)] leading-[var(--h2-subtitulos-o-secciones-line-height)] text-white">
                      {slide.age} años
                    </span>
                  )}
                  {slide.city && (
                    <span className="font-h2-subtitulos-o-secciones text-[length:var(--h2-subtitulos-o-secciones-font-size)] leading-[var(--h2-subtitulos-o-secciones-line-height)] text-white">
                      {slide.city}
                    </span>
                  )}
                </div>

                <p className="font-h4 text-[length:var(--h4-font-size)] leading-[var(--h4-line-height)] text-white">{slide.description}</p>
              </div>

              <img className="h-[19px] w-[20px]" alt="Decoración" src="/img/vector-10.svg" />

              <div className="flex w-full flex-col items-start gap-[22px]">
                <div className="flex flex-wrap items-end gap-[0px_18px]">
                  {slide.tags.map((tag) => (
                    <span
                      key={`${slide.id}-${tag}`}
                      className="font-h4 text-[length:var(--h4-font-size)] leading-[var(--h4-line-height)] text-white"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <BotonChicas
                  buttonStyleDivClassName="!mr-[-20.00px] !mt-[-3.00px] !tracking-[var(--h4-letter-spacing)] !ml-[-20.00px] !text-[length:var(--h4-font-size)] ![font-style:var(--h4-font-style)] ![white-space:unset] !font-[number:var(--h4-font-weight)] !font-h4 !leading-[var(--h4-line-height)]"
                  buttonStyleStyleFilledIconNoClassName="!self-stretch !flex-[0_0_auto] !px-[70px] !py-3.5 !bg-blend-screen !flex !left-[unset] !bg-[linear-gradient(119deg,rgba(135,0,5,1)_12%,rgba(172,7,13,1)_45%,rgba(208,29,35,1)_75%,rgba(236,76,81,1)_100%)] !bg-[unset] !w-full !top-[unset]"
                  buttonStyleText="Ver perfil"
                  className="!h-[78px] !w-full"
                  to={slide.link ?? "/anuncio"}
                  propiedad1="predeterminada"
                />
              </div>
            </div>

            <img className="h-[612px] w-[485px] rounded-[64px] object-cover" alt={slide.title} src={slide.image} />
          </article>
        ))}
      </div>

      <CarouselIndicators
        count={slides.length}
        activeIndex={activeIndex}
        onSelect={handleSelect}
        className="!flex-[0_0_auto]"
      />
    </div>
  );
};
