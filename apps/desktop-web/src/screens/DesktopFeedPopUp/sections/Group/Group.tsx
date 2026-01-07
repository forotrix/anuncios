import React from "react";
import { FavoriteProfileCard } from "@/components/FavoriteProfileCard";

export const Group = () => {
  return (
    <div className="absolute top-[859px] left-16 w-[1313px] h-[729px] flex gap-[529px]">
      <div className="w-[500px] h-[42px] font-h2-2-0 font-[number:var(--h2-2-0-font-weight)] text-[#ffffff] text-[length:var(--h2-2-0-font-size)] tracking-[var(--h2-2-0-letter-spacing)] leading-[var(--h2-2-0-line-height)] [font-style:var(--h2-2-0-font-style)]">
        Favoritas de la semana
      </div>

      <div className="mt-[159px] w-[282px] h-[570px] flex">
        <div className="flex mt-[-63px] w-[1310px] h-[633px] ml-[-1027px] relative flex-col items-start gap-2.5 px-[31px] py-[47px] rounded-[32px] bg-blend-screen bg-[linear-gradient(119deg,rgba(135,0,5,0.38)_12%,rgba(172,7,13,0.38)_45%,rgba(208,29,35,0.38)_75%,rgba(236,76,81,0.38)_100%)]">
          <div className="inline-flex items-center gap-6 relative flex-[0_0_auto]">
            <FavoriteProfileCard
              className="!left-[unset] !top-[unset]"
              star="/img/star-1-4.svg"
            />
            <FavoriteProfileCard
              className="!left-[unset] !top-[unset]"
              rectangleClassName="!rounded-[unset] !bg-[unset]"
              star="/img/star-1-2.svg"
            />
            <FavoriteProfileCard
              className="!left-[unset] !top-[unset]"
              star="/img/star-1-2.svg"
            />
          </div>
        </div>
      </div>
    </div>
  );
};


