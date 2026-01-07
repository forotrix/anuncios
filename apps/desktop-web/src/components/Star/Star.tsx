/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import PropTypes from "prop-types";
import React from "react";

interface Props {
  propiedad1: "predeterminada";
  className: any;
  starClassName: any;
  star: string;
}

export const Star = ({
  propiedad1,
  className,
  starClassName,
  star = "/img/star-1-1.svg",
}: Props) => {
  return (
    <div className={`relative top-5 left-5 w-[43px] h-[43px] ${className}`}>
      <img
        className={`absolute w-full h-full top-[10.06%] left-[11.67%] ${starClassName}`}
        alt="Star"
        src={star}
      />
    </div>
  );
};

Star.propTypes = {
  propiedad1: PropTypes.oneOf(["predeterminada"]),
  star: PropTypes.string,
};

