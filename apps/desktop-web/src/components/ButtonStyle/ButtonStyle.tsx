/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import PropTypes from "prop-types";
import React from "react";

interface Props {
  style: "filled";
  icon: "no-icon";
  state: "hover";
  size: "large";
  borderRadius: "thirty-two";
  className: any;
  divClassName: any;
  text: string;
}

export const ButtonStyle = ({
  style,
  icon,
  state,
  size,
  borderRadius,
  className,
  divClassName,
  text = "Button",
}: Props) => {
  return (
    <button
      className={`all-[unset] box-border inline-flex items-center justify-center gap-1 px-[62px] py-5 relative rounded-[32px] ${className}`}
    >
      <div
        className={`relative w-fit mt-[-1.00px] font-caption-heavy font-[number:var(--caption-heavy-font-weight)] text-textwhite text-[length:var(--caption-heavy-font-size)] tracking-[var(--caption-heavy-letter-spacing)] leading-[var(--caption-heavy-line-height)] whitespace-nowrap [font-style:var(--caption-heavy-font-style)] ${divClassName}`}
      >
        {text}
      </div>
    </button>
  );
};

ButtonStyle.propTypes = {
  style: PropTypes.oneOf(["filled"]),
  icon: PropTypes.oneOf(["no-icon"]),
  state: PropTypes.oneOf(["hover"]),
  size: PropTypes.oneOf(["large"]),
  borderRadius: PropTypes.oneOf(["thirty-two"]),
  text: PropTypes.string,
};

