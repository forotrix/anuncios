"use client";

/*
We're constantly improving the code you see.
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import PropTypes from "prop-types";
import Link from "next/link";
import React from "react";

interface Props {
  rectangle: string;
  starStar: string;
  href?: string;
  title?: string;
  subtitle?: string;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export const ChicaFeedDestacada = ({
  rectangle = "/img/valentina-hero.svg",
  starStar = "/img/star-1-3.svg",
  href,
  title = "Marina, 23 años",
  subtitle = "Barcelona",
  isFavorite = false,
  onToggleFavorite,
}: Props) => {
  const content = (
    <div className="relative w-[400px] h-[538px] bg-[#b3063a33] rounded-[36px] border-[none] shadow-[0px_4px_4px_#00000040] before:content-[''] before:absolute before:inset-0 before:p-[3px] before:rounded-[36px] before:[background:linear-gradient(119deg,rgba(135,0,5,1)_12%,rgba(172,7,13,1)_45%,rgba(208,29,35,1)_75%,rgba(236,76,81,1)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none">
      <img className="absolute top-[23px] left-[22px] w-[355px] h-[400px] object-cover" alt="Rectangle" src={rectangle} />

      <p className="absolute top-[437px] left-[22px] [text-shadow:1px_1px_4px_#000000bf] [font-family:'Plus_Jakarta_Sans',Helvetica] font-normal text-[#ffffff] text-[28px] tracking-[0] leading-[normal]">
        <span className="font-[number:var(--nombre-chica-feed-font-weight)] font-nombre-chica-feed [font-style:var(--nombre-chica-feed-font-style)] tracking-[var(--nombre-chica-feed-letter-spacing)] leading-[var(--nombre-chica-feed-line-height)] text-[length:var(--nombre-chica-feed-font-size)]">
          {title}
          <br />
        </span>

        <span className="text-[length:var(--h4-font-size)] font-h4 [font-style:var(--h4-font-style)] font-[number:var(--h4-font-weight)] tracking-[var(--h4-letter-spacing)] leading-[var(--h4-line-height)]">
          {subtitle}
        </span>
      </p>

      <div className="inline-flex items-center justify-center gap-2.5 px-[17px] py-[5px] absolute top-[469px] left-[239px] rounded-[32px] bg-blend-screen bg-[linear-gradient(119deg,rgba(135,0,5,1)_12%,rgba(172,7,13,1)_45%,rgba(208,29,35,1)_75%,rgba(236,76,81,1)_100%)]">
        <div className="relative w-fit mt-[-1.00px] [font-family:'Plus_Jakarta_Sans',Helvetica] font-medium text-[#ffffff] text-base tracking-[0] leading-[normal]">
          Ver perfil
        </div>
      </div>

      <button
        type="button"
        onClick={onToggleFavorite}
        className="absolute bottom-6 right-6 flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-black/40 text-white shadow-[0_4px_12px_rgba(0,0,0,0.45)]"
        aria-label={isFavorite ? "Eliminar de favoritos" : "Añadir a favoritos"}
      >
        <img src={isFavorite ? "/img/star-1-1.svg" : starStar} alt="" className="h-5 w-5" />
      </button>
    </div>
  );

  if (href) {
    return (
      <Link href={href} aria-label="Abrir detalle del anuncio destacado" className="block">
        {content}
      </Link>
    );
  }

  return content;
};

ChicaFeedDestacada.propTypes = {
  rectangle: PropTypes.string,
  starStar: PropTypes.string,
  href: PropTypes.string,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  isFavorite: PropTypes.bool,
  onToggleFavorite: PropTypes.func,
};
