"use client";

import React from "react";
import { SearchBar } from "@/components/SearchBar/SearchBar";

interface Props {
  className?: string;
  propiedad1?: string;
}

export const Buscae = ({ className }: Props) => {
  return <SearchBar className={className} />;
};
