/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import PropTypes from "prop-types";
import React from "react";

interface Props {
  className?: string;
  star?: string;
  rectangleClassName?: string;
}

export const FavoriteProfileCard = ({
  className = "",
  star = "/img/star-1-2.svg",
  rectangleClassName = "",
}: Props) => {
  return (
    <div
      className={`relative top-[1586px] left-[-7010px] w-[400px] h-[538px] bg-[#b3063a33] rounded-[36px] border-[none] shadow-[0px_4px_4px_#00000040] before:content-[''] before:absolute before:inset-0 before:p-[3px] before:rounded-[36px] before:[background:linear-gradient(119deg,rgba(135,0,5,1)_12%,rgba(172,7,13,1)_45%,rgba(208,29,35,1)_75%,rgba(236,76,81,1)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none ${className}`}
    >
      <div className="absolute top-[196px] left-24 [font-family:'Inter',Helvetica] font-normal text-black text-2xl tracking-[0] leading-[normal]">
        foto de la chica
      </div>

      <div
        className={`absolute top-4 left-[21px] w-[357px] h-[435px] bg-[#d9d9d9] rounded-[36px] ${rectangleClassName}`}
      />

      <div className="absolute top-[451px] left-[21px] font-h3-subdivisiones font-[number:var(--h3-subdivisiones-font-weight)] text-[#ffffff] text-[length:var(--h3-subdivisiones-font-size)] tracking-[var(--h3-subdivisiones-letter-spacing)] leading-[var(--h3-subdivisiones-line-height)] [font-style:var(--h3-subdivisiones-font-style)]">
        Barcelona
      </div>

      <img
        className="absolute top-[472px] left-[315px] w-[41px] h-[39px]"
        alt="Star"
        src={star}
      />

      <div className="absolute top-[486px] left-[21px] font-h3-subdivisiones font-[number:var(--h3-subdivisiones-font-weight)] text-[#ffffff] text-[length:var(--h3-subdivisiones-font-size)] tracking-[var(--h3-subdivisiones-letter-spacing)] leading-[var(--h3-subdivisiones-line-height)] [font-style:var(--h3-subdivisiones-font-style)]">
        Marina, 23 años
      </div>
    </div>
  );
};

FavoriteProfileCard.propTypes = {
  star: PropTypes.string,
};

