"use client";

import { useCallback, useEffect, useState } from "react";
import type { ProfileType } from "@anuncios/shared";

const STORAGE_KEY = "forotrix:lastProfileType";
const DEFAULT_PROFILE: ProfileType = "chicas";

export function useProfileTypePreference(initial?: ProfileType) {
  const [profileType, setProfileType] = useState<ProfileType>(initial ?? DEFAULT_PROFILE);

  useEffect(() => {
    if (initial) {
      setProfileType(initial);
      persist(initial);
      return;
    }

    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(STORAGE_KEY) as ProfileType | null;
    if (stored) {
      setProfileType(stored);
    }
  }, [initial]);

  const updatePreference = useCallback((next: ProfileType) => {
    setProfileType(next);
    persist(next);
  }, []);

  return { profileTypePreference: profileType, setProfileTypePreference: updatePreference };
}

function persist(value: ProfileType) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, value);
}
