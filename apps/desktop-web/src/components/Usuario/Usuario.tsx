/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import React from "react";

interface Props {
  className: any;
  usuario: string;
}

export const Usuario = ({
  className,
  usuario = "/img/anuncio/usuario.svg",
}: Props) => {
  return (
    <img
      className={`absolute top-0 left-0 w-16 h-16 ${className}`}
      alt="Usuario"
      src={usuario}
    />
  );
};


