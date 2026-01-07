/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import React from "react";
import { Tag } from "../Tag";

interface Props {
  property1: "label-1" | "label-2";
  className?: string;
  tagText?: string;
  tagTagClassName?: string;
}

export const Label = ({
  property1,
  className = "",
  tagText = "label",
  tagTagClassName,
}: Props) => {
  return (
    <div
      className={`inline-flex items-start relative top-5 left-5 ${className}`}
    >
      <Tag
        className={tagTagClassName}
        divClassName="!tracking-[var(--h5-letter-spacing)] !text-[length:var(--h5-font-size)] ![font-style:var(--h5-font-style)] !font-[number:var(--h5-font-weight)] !font-h5 !leading-[var(--h5-line-height)]"
        text={tagText}
      />
    </div>
  );
};

