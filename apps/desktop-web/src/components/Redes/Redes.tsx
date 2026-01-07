/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import React from "react";

interface Props {
  property1: "telegram" | "tlf" | "whatsapp";
  className?: string;
  whatsapp?: string;
  telegram?: string;
  callClassName?: string;
}

export const Redes = ({
  property1,
  className = "",
  whatsapp = "/img/anuncio/whatsapp.svg",
  telegram = "/img/anuncio/telegram.svg",
  callClassName = "",
}: Props) => {
  return (
    <div
      className={`w-[67px] relative ${property1 === "tlf" ? "bg-[linear-gradient(119deg,rgba(135,0,5,1)_12%,rgba(172,7,13,1)_45%,rgba(208,29,35,1)_75%,rgba(236,76,81,1)_100%)]" : ""} ${["telegram", "tlf"].includes(property1) ? "left-5" : ""} ${property1 === "tlf" ? "flex" : ""} ${property1 === "telegram" ? "top-[86px]" : (property1 === "tlf") ? "top-[152px]" : "top-5"} ${property1 === "tlf" ? "h-[58px]" : "h-[46px]"} ${property1 === "tlf" ? "rounded-[15px]" : ""} ${className}`}
    >
      {["telegram", "whatsapp"].includes(property1) && (
        <>
          <div className="bg-[linear-gradient(119deg,rgba(135,0,5,1)_12%,rgba(172,7,13,1)_45%,rgba(208,29,35,1)_75%,rgba(236,76,81,1)_100%)] w-[67px] left-[calc(50.00%_-_34px)] top-[calc(50.00%_-_29px)] h-[58px] rounded-[15px] bg-blend-screen absolute" />

          <img
            className={`aspect-[1] top-2 h-[29px] absolute ${property1 === "telegram" ? "w-[29px]" : "w-[43.28%]"} ${property1 === "telegram" ? "left-[19px]" : "left-[28.36%]"}`}
            alt="Whatsapp"
            src={property1 === "telegram" ? telegram : whatsapp}
          />
        </>
      )}

      {property1 === "tlf" && (
        <img
          className={`mt-2 w-[29px] h-[32.75px] ml-[19px] aspect-[1] ${callClassName}`}
          alt="Call"
          src="/img/anuncio/call-02-1.svg"
        />
      )}
    </div>
  );
};


