"use client";

import { useCallback, useEffect, useState } from "react";
import type { GenderIdentity, GenderSex } from "@anuncios/shared";

const SEX_KEY = "forotrix:lastGenderSex";
const IDENTITY_KEY = "forotrix:lastGenderIdentity";

const DEFAULT_SEX: GenderSex = "female";
const DEFAULT_IDENTITY: GenderIdentity = "cis";

export function useGenderPreference(initial?: { sex?: GenderSex; identity?: GenderIdentity }) {
  const [sex, setSex] = useState<GenderSex | undefined>(
    initial?.sex ?? (initial?.identity === "trans" ? undefined : DEFAULT_SEX),
  );
  const [identity, setIdentity] = useState<GenderIdentity>(initial?.identity ?? DEFAULT_IDENTITY);

  useEffect(() => {
    if (initial?.sex || initial?.identity) {
      const nextSex = initial?.sex ?? (initial?.identity === "trans" ? undefined : DEFAULT_SEX);
      setSex(nextSex);
      persistSex(nextSex);
      if (initial?.identity) {
        setIdentity(initial.identity);
        persistIdentity(initial.identity);
      }
      return;
    }
    if (typeof window === "undefined") return;

    const storedSex = window.localStorage.getItem(SEX_KEY) as GenderSex | null;
    const storedIdentity = window.localStorage.getItem(IDENTITY_KEY) as GenderIdentity | null;

    if (storedIdentity === "cis" || storedIdentity === "trans") setIdentity(storedIdentity);
    if (storedSex === "female" || storedSex === "male") setSex(storedSex);
    else if (storedIdentity === "trans") setSex(undefined);
  }, [initial?.sex, initial?.identity]);

  const updateSex = useCallback((next: GenderSex | undefined) => {
    setSex(next);
    persistSex(next);
  }, []);

  const updateIdentity = useCallback((next: GenderIdentity) => {
    setIdentity(next);
    persistIdentity(next);
  }, []);

  return { sexPreference: sex, identityPreference: identity, setSexPreference: updateSex, setIdentityPreference: updateIdentity };
}

function persistSex(value: GenderSex | undefined) {
  if (typeof window === "undefined") return;
  if (value) {
    window.localStorage.setItem(SEX_KEY, value);
  } else {
    window.localStorage.removeItem(SEX_KEY);
  }
}

function persistIdentity(value: GenderIdentity) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(IDENTITY_KEY, value);
}

