/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import PropTypes from "prop-types";
import React from "react";
import { Switch } from "../Switch";

interface Props {
  propiedad1: "chicas";
  className?: string;
  frameClassName?: string;
  divClassName?: string;
  slice?: string;
}

export const BotonElegirChicas = ({
  propiedad1,
  className = "",
  frameClassName = "",
  divClassName = "",
  slice = "/img/slice-1.png",
}: Props) => {
  return (
    <div
      className={`flex w-[204px] h-[70px] items-center gap-2.5 px-0 py-6 relative top-[11px] left-[26px] ${className}`}
    >
      <img className="relative w-1 h-[3px]" alt="Slice" src={slice} />

      <div
        className={`inline-flex h-[70px] items-center justify-center gap-5 pl-[83px] pr-[29px] pt-[13px] pb-[22px] absolute top-0 left-0 bg-rojo-pasion300 rounded-[100px_32px_32px_100px] ${frameClassName}`}
      >
        <div
          className={`relative w-fit mt-[-1.00px] font-h3-subdivisiones font-[number:var(--h3-subdivisiones-font-weight)] text-[#ffffff] text-[length:var(--h3-subdivisiones-font-size)] tracking-[var(--h3-subdivisiones-letter-spacing)] leading-[var(--h3-subdivisiones-line-height)] [font-style:var(--h3-subdivisiones-font-style)] ${divClassName}`}
        >
          Chicas
        </div>
      </div>

      <Switch
        className="!h-[62px] !rounded-[31px] !shadow-switch-in-shadow !absolute !left-1.5 !w-[62px] !top-1"
        property1="switch-btn-3d"
      />
    </div>
  );
};

BotonElegirChicas.propTypes = {
  propiedad1: PropTypes.oneOf(["chicas"]),
  slice: PropTypes.string,
};

