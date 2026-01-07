import React from "react";
import { ChicaFeedDestacada } from "@/components/ChicaFeedDestacada";
import type { Ad } from "@/lib/ads";

type Props = {
  ads: Ad[];
  favoriteIds: string[];
  onToggleFavorite: (id: string) => void;
};

export const WeeklyFavoritesSection = ({ ads, favoriteIds, onToggleFavorite }: Props) => {
  const cards = buildFavorites(ads);

  return (
    <div className="flex flex-col w-[1311px] items-start gap-10 absolute top-[908px] left-16">
      <div className="relative self-stretch h-[42px] mt-[-1.00px] font-h2-2-0 font-[number:var(--h2-2-0-font-weight)] text-[#ffffff] text-[length:var(--h2-2-0-font-size)] tracking-[var(--h2-2-0-letter-spacing)] leading-[var(--h2-2-0-line-height)] [font-style:var(--h2-2-0-font-style)]">
        Favoritas de la semana
      </div>

      <div className="flex flex-col h-[620px] items-start gap-2.5 px-[33px] py-[41px] relative self-stretch w-full rounded-[32px] border-[none] bg-blend-screen bg-[linear-gradient(119deg,rgba(135,0,5,0.3)_12%,rgba(172,7,13,0.3)_45%,rgba(208,29,35,0.3)_75%,rgba(236,76,81,0.3)_100%)] before:content-[''] before:absolute before:inset-0 before:p-0.5 before:rounded-[32px] before:[background:linear-gradient(119deg,rgba(135,0,5,1)_12%,rgba(172,7,13,1)_45%,rgba(208,29,35,1)_75%,rgba(236,76,81,1)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none">
        <div className="inline-flex items-center gap-[22px] relative flex-[0_0_auto]">
          {cards.map((card) => (
            <ChicaFeedDestacada
              key={card.id}
              rectangle={card.image}
              starStar="/img/star-1-27.svg"
              href={`/anuncio/${card.id}`}
              title={card.title}
              subtitle={card.subtitle}
              isFavorite={favoriteIds.includes(card.id)}
              onToggleFavorite={() => onToggleFavorite(card.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

function buildFavorites(ads: Ad[], total = 3) {
  if (!ads.length) {
    return Array.from({ length: total }, (_, index) => ({
      id: `favorite-${index}`,
      title: `Marina, ${23 + index} años`,
      subtitle: "Barcelona",
      image: "/img/valentina-hero.svg",
    }));
  }

  const normalized = ads.map((ad) => ({
    id: ad.id,
    title: ad.age ? `${ad.title}, ${ad.age} años` : ad.title ?? "Anuncio",
    subtitle: ad.city ?? "Sin ciudad",
    image: ad.images[0]?.url ?? "/img/valentina-hero.svg",
  }));

  const cards: typeof normalized = [];
  while (cards.length < total) {
    const next = normalized[cards.length % normalized.length];
    cards.push(next ?? { id: `favorite-${cards.length}`, title: "Anuncio", subtitle: "Ciudad", image: "/img/valentina-hero.svg" });
  }
  return cards.slice(0, total);
}


