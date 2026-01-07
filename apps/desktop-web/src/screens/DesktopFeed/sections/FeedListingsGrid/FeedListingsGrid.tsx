import Link from "next/link";
import React from "react";
import type { Ad } from "@/lib/ads";

type Props = {
  ads: Ad[];
  favoriteIds: string[];
  onToggleFavorite: (id: string) => void;
};

const MARINA_HERO_URL = "https://res.cloudinary.com/dqhxthtby/image/upload/v1762882388/marina-hero.svg";

const FALLBACK_CARD = {
  id: "placeholder",
  adId: "placeholder",
  title: "Marina, 23 años",
  subtitle: "Barcelona",
  image: MARINA_HERO_URL,
};

export const FeedListingsGrid = ({ ads, favoriteIds, onToggleFavorite }: Props) => {
  const cards = buildCards(ads);

  return (
    <div className="grid grid-cols-3 grid-rows-3 w-[1354px] h-[1734px] gap-[52px_46px] absolute top-[1952px] left-[61px]">
      {cards.map((card, index) => {
        const isFavorite = favoriteIds.includes(card.adId);
        return (
          <article key={`${card.id}-${index}`} className="relative block w-[376px] h-[538px] rounded-[32px] overflow-hidden">
            <img
              className="absolute w-full h-full top-[-2.90%] left-[-9.47%] object-cover"
              alt={card.title}
              src={card.image}
            />

            <p className="absolute top-[424px] left-[21px] [text-shadow:1px_1px_4px_#000000bf] [font-family:'Plus_Jakarta_Sans',Helvetica] font-normal text-[#ffffff] text-[28px] tracking-[0] leading-[normal]">
              <span className="font-[number:var(--nombre-chica-feed-font-weight)] font-nombre-chica-feed [font-style:var(--nombre-chica-feed-font-style)] tracking-[var(--nombre-chica-feed-letter-spacing)] leading-[var(--nombre-chica-feed-line-height)] text-[length:var(--nombre-chica-feed-font-size)]">
                {card.title}
                <br />
              </span>

              <span className="text-[length:var(--h4-font-size)] font-h4 [font-style:var(--h4-font-style)] font-[number:var(--h4-font-weight)] tracking-[var(--h4-letter-spacing)] leading-[var(--h4-line-height)]">
                {card.subtitle}
              </span>
            </p>

            <div className="absolute bottom-6 left-6 flex items-center gap-3">
              <Link
                href={`/anuncio/${card.adId}`}
                prefetch={false}
                className="rounded-full bg-[linear-gradient(119deg,rgba(135,0,5,1)_12%,rgba(172,7,13,1)_45%,rgba(208,29,35,1)_75%,rgba(236,76,81,1)_100%)] px-4 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow-shadow-g"
              >
                Ver perfil
              </Link>
            </div>

            <button
              type="button"
              onClick={() => onToggleFavorite(card.adId)}
              className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-black/40 text-white shadow-[0_4px_12px_rgba(0,0,0,0.45)] transition hover:bg-black/60"
              aria-label={isFavorite ? "Eliminar de favoritos" : "Añadir a favoritos"}
            >
              <img src={isFavorite ? "/img/star-1-1.svg" : "/img/star-1-27.svg"} alt="" className="h-5 w-5" />
            </button>
          </article>
        );
      })}
    </div>
  );
};

function buildCards(ads: Ad[], total = 9) {
  if (!ads.length) {
    return Array.from({ length: total }, (_, index) => ({
      ...FALLBACK_CARD,
      id: `${FALLBACK_CARD.id}-${index}`,
      adId: FALLBACK_CARD.adId,
    }));
  }

  const normalized = ads.map((ad) => ({
    id: ad.id,
    adId: ad.id,
    title: buildTitle(ad),
    subtitle: ad.city ?? "Sin ciudad",
    image: ad.images[0]?.url ?? FALLBACK_CARD.image,
  }));

  const cards: typeof normalized = [];
  while (cards.length < total) {
    const next = normalized[cards.length % normalized.length] ?? FALLBACK_CARD;
    cards.push({ ...next, id: `${next.id}-${cards.length}` });
  }

  return cards.slice(0, total);
}

function buildTitle(ad: Ad) {
  if (ad.age) {
    return `${ad.title ?? "Anuncio"}, ${ad.age} años`;
  }
  return ad.title ?? FALLBACK_CARD.title;
}
