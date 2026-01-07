/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import React from "react";

interface Props {
  className: any;
  divClassName: any;
  text: string;
}

export const Tag = ({
  className,
  divClassName,
  text = "Tag or button",
}: Props) => {
  return (
    <div
      className={`inline-flex items-end justify-center gap-2.5 p-2 relative top-[42px] left-[39px] bg-[#3c3c43] rounded-[100px] border border-solid border-[#3c3c43] ${className}`}
    >
      <div
        className={`relative flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Source_Code_Pro',Helvetica] font-normal text-white text-xs tracking-[0] leading-[normal] ${divClassName}`}
      >
        {text}
      </div>
    </div>
  );
};

