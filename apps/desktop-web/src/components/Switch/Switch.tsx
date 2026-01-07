/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import PropTypes from "prop-types";
import React from "react";

interface Props {
  property1: "switch-btn-3d";
  className: any;
}

export const Switch = ({ property1, className }: Props) => {
  return (
    <div
      className={`relative top-5 left-5 w-[70px] h-[70px] rounded-[35px] shadow-[2px_1px_6px_#00000040] bg-[linear-gradient(180deg,rgba(255,255,255,1)_0%,rgba(232,234,234,1)_100%)] ${className}`}
    />
  );
};

Switch.propTypes = {
  property1: PropTypes.oneOf(["switch-btn-3d"]),
};

