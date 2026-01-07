/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import PropTypes from "prop-types";
import React from "react";
import Link from "next/link";
import { ButtonStyle } from "../ButtonStyle";

interface Props {
  propiedad1: "predeterminada";
  className?: string;
  buttonStyleStyleFilledIconNoClassName?: string;
  buttonStyleDivClassName?: string;
  buttonStyleText?: string;
  to?: string;
  onClick?: () => void;
}

export const BotonChicas = ({
  propiedad1,
  className = "",
  buttonStyleStyleFilledIconNoClassName,
  buttonStyleDivClassName,
  buttonStyleText = "Chicas",
  to,
  onClick,
}: Props) => {
  const Wrapper: React.ElementType = to ? Link : "div";

  return (
    <Wrapper
      className={`flex flex-col w-[210px] items-start gap-2.5 p-2.5 relative top-5 left-5 ${className}`}
      {...(to ? { href: to } : {})}
      {...(onClick ? { onClick } : {})}
    >
      <ButtonStyle
        borderRadius="thirty-two"
        className={buttonStyleStyleFilledIconNoClassName}
        divClassName={buttonStyleDivClassName}
        icon="no-icon"
        size="large"
        state="hover"
        style="filled"
        text={buttonStyleText}
      />
    </Wrapper>
  );
};

BotonChicas.propTypes = {
  propiedad1: PropTypes.oneOf(["predeterminada"]),
  buttonStyleText: PropTypes.string,
  to: PropTypes.string,
};

