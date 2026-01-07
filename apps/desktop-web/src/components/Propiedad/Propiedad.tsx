/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import PropTypes from "prop-types";
import React from "react";
import { BotonChicas } from "../BotonChicas";

interface Props {
  className: any;
  to: string;
  to1: string;
}

export const Propiedad = ({ className, to, to1 }: Props) => {
  return (
    <div
      className={`relative top-5 left-5 w-[682px] h-[260px] flex flex-col bg-collection-1-fondo rounded-[25px] overflow-hidden ${className}`}
    >
      <div className="flex ml-[13px] w-[521px] h-[97px] relative mt-4 flex-col items-center">
        <div className="relative self-stretch mt-[-1.00px] [font-family:'Plus_Jakarta_Sans',Helvetica] font-semibold text-rojo-pasion300 text-[28px] tracking-[0] leading-[normal]">
          Bienvenido a ForoTrix
        </div>

        <div className="flex h-[70px] items-center gap-2.5 px-0 py-2.5 relative self-stretch w-full -mt-2">
          <p className="relative w-[501px] mt-[-1.00px] [font-family:'Plus_Jakarta_Sans',Helvetica] font-normal text-[#ffffff] text-xl tracking-[0] leading-[normal]">
            <span className="font-h5 font-[number:var(--h5-font-weight)] text-[#ffffff] text-[length:var(--h5-font-size)] tracking-[var(--h5-letter-spacing)] [font-style:var(--h5-font-style)] leading-[var(--h5-line-height)]">
              Un mundo de placer y compañía exclusiva, reservado solo{" "}
            </span>

            <span className="font-semibold">para mayores de 18 años</span>

            <span className="font-h5 font-[number:var(--h5-font-weight)] text-[#ffffff] text-[length:var(--h5-font-size)] tracking-[var(--h5-letter-spacing)] [font-style:var(--h5-font-style)] leading-[var(--h5-line-height)]">
              .
            </span>
          </p>
        </div>
      </div>

      <p className="ml-[-76px] h-[30px] w-[374px] self-center mt-[7px] font-h4 font-[number:var(--h4-font-weight)] text-rojo-pasion300 text-[length:var(--h4-font-size)] tracking-[var(--h4-letter-spacing)] leading-[var(--h4-line-height)] [font-style:var(--h4-font-style)]">
        ¿Con quién deseas disfrutar hoy?
      </p>

      <div className="inline-flex ml-[104px] w-[432px] h-[90px] relative items-center gap-3">
        <BotonChicas
          buttonStyleDivClassName="!mr-[-6.50px] !tracking-[var(--h4-letter-spacing)] !ml-[-6.50px] !text-[length:var(--h4-font-size)] ![font-style:var(--h4-font-style)] ![white-space:unset] !font-[number:var(--h4-font-weight)] !font-h4 !leading-[var(--h4-line-height)]"
          buttonStyleStyleFilledIconNoClassName="!self-stretch !flex-[0_0_auto] !flex !left-[unset] !bg-rojo-pasion300 !w-full !top-[unset]"
          buttonStyleText="Chicas"
          className="!left-[unset] !top-[unset]"
          propiedad1="predeterminada"
          to={to}
        />
        <BotonChicas
          buttonStyleDivClassName="!tracking-[var(--h4-letter-spacing)] !text-[length:var(--h4-font-size)] ![font-style:var(--h4-font-style)] ![white-space:unset] !font-[number:var(--h4-font-weight)] !font-h4 !leading-[var(--h4-line-height)]"
          buttonStyleStyleFilledIconNoClassName="!self-stretch !flex-[0_0_auto] !flex !left-[unset] !bg-rojo-pasion300 !w-full !top-[unset]"
          buttonStyleText="Trans"
          className="!left-[unset] !top-[unset]"
          propiedad1="predeterminada"
          to={to1}
        />
      </div>
    </div>
  );
};

Propiedad.propTypes = {
  to: PropTypes.string,
  to1: PropTypes.string,
};

