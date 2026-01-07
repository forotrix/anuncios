"use client";

import type { ComponentProps } from "react";
import { DesktopFeed } from "@/screens/DesktopFeed";

type DesktopFeedProps = ComponentProps<typeof DesktopFeed>;

export const DesktopFeedPopUp = (props: DesktopFeedProps) => {
  return <DesktopFeed {...props} />;
};
