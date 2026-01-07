"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ReadonlyURLSearchParams } from "next/navigation";
import { logEvent } from "@/services/eventLogger";

type PopupOpenReason = "force" | "query" | "auto";
type PopupCloseReason = "user" | "dismiss";

type UseFeedPopupParams = {
  forcePopup?: boolean;
  searchParams: ReadonlyURLSearchParams;
};

export function useFeedPopup({ forcePopup = false, searchParams }: UseFeedPopupParams) {
  const [showPopup, setShowPopup] = useState(false);
  const forcedPopupRef = useRef(false);
  const currentReasonRef = useRef<PopupOpenReason | null>(null);

  const openPopup = useCallback(
    (reason: PopupOpenReason) => {
      if (showPopup) return;
      currentReasonRef.current = reason;
      setShowPopup(true);
      void logEvent("feed_popup:opened", { reason });
    },
    [showPopup],
  );

  const closePopup = useCallback(
    (reason: PopupCloseReason = "user") => {
      if (!showPopup) return;
      setShowPopup(false);
      if (typeof window !== "undefined") {
        window.sessionStorage?.setItem("desktopFeedPopupSeen", "true");
      }
      void logEvent("feed_popup:closed", { reason, openedWith: currentReasonRef.current });
    },
    [showPopup],
  );

  useEffect(() => {
    if (!forcePopup || forcedPopupRef.current) return;
    forcedPopupRef.current = true;
    openPopup("force");
  }, [forcePopup, openPopup]);

  useEffect(() => {
    if (forcePopup) return;
    if (typeof window === "undefined") return;
    const popupParam = searchParams.get("popup") === "true";
    const alreadySeen = window.sessionStorage?.getItem("desktopFeedPopupSeen") === "true";

    if (popupParam) {
      window.sessionStorage?.removeItem("desktopFeedPopupSeen");
      openPopup("query");
    } else if (!alreadySeen) {
      openPopup("auto");
    }
  }, [forcePopup, openPopup, searchParams]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const { style } = document.body;
    const prevOverflow = style.overflow;
    if (showPopup) {
      style.overflow = "hidden";
    } else {
      style.overflow = prevOverflow;
    }
    return () => {
      style.overflow = prevOverflow;
    };
  }, [showPopup]);

  return {
    showPopup,
    openPopup,
    closePopup,
  };
}
