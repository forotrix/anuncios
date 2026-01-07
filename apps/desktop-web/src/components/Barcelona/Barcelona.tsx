/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import React from "react";

interface Props {
  className: any;
}

export const Barcelona = ({ className }: Props) => {
  return (
    <div
      className={`inline-flex items-start gap-1.5 relative top-[218px] left-[-6651px] ${className}`}
    >
      <div className="relative w-fit mt-[-1.00px] [font-family:'Plus_Jakarta_Sans',Helvetica] font-medium text-[#ffffff] text-xl tracking-[0] leading-[normal]">
        Barcelona
      </div>

      <div className="flex w-[33px] h-[33px] items-center gap-2.5 p-2 relative bg-[#292929] rounded-[100px]">
        <img
          className="relative w-[12.4px] h-[11px]"
          alt="Polygon"
          src="/img/polygon-1.svg"
        />
      </div>
    </div>
  );
};

