"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { GenderIdentity, GenderSex } from "@anuncios/shared";

const SESSION_KEY = "forotrix:entryGateAccepted";
const SEX_KEY = "forotrix:lastGenderSex";
const IDENTITY_KEY = "forotrix:lastGenderIdentity";

type GenderChoice = {
  label: string;
  sex: GenderSex;
  identity: GenderIdentity;
};

const CHOICES: GenderChoice[] = [
  { label: "Chicas", sex: "female", identity: "cis" },
  { label: "Chicas trans", sex: "female", identity: "trans" },
  { label: "Chicos", sex: "male", identity: "cis" },
  { label: "Chicos trans", sex: "male", identity: "trans" },
];

export function EntryGate() {
  const router = useRouter();
  const pathname = usePathname();
  const [accepted, setAccepted] = useState(false);
  const [confirmedAdult, setConfirmedAdult] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const alreadyAccepted = window.sessionStorage.getItem(SESSION_KEY) === "true";
    setAccepted(alreadyAccepted);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const { style } = document.body;
    const prevOverflow = style.overflow;
    if (!accepted) {
      style.overflow = "hidden";
    } else {
      style.overflow = prevOverflow;
    }
    return () => {
      style.overflow = prevOverflow;
    };
  }, [accepted]);

  const handleSelect = (sex: GenderSex, identity: GenderIdentity) => {
    if (!confirmedAdult) return;
    if (typeof window !== "undefined") {
      window.localStorage.setItem(SEX_KEY, sex);
      window.localStorage.setItem(IDENTITY_KEY, identity);
      window.sessionStorage.setItem(SESSION_KEY, "true");
    }
    setAccepted(true);

    if (pathname?.startsWith("/feed")) {
      const next = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
      next.delete("profileType");
      next.set("sex", sex);
      next.set("identity", identity);
      const query = next.toString();
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    }
  };

  if (accepted) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 px-6">
      <div className="absolute inset-0" aria-hidden="true" />
      <section
        role="dialog"
        aria-modal="true"
        aria-label="Confirmación de edad"
        className="relative w-full max-w-[640px] rounded-[32px] border border-white/10 bg-[#07080c] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.7)]"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">Acceso</p>
        <h1 className="mt-3 text-2xl font-semibold text-white">Contenido solo para mayores de 18</h1>
        <p className="mt-3 text-sm text-white/70">
          Confirma que eres mayor de edad y elige qué tipo de perfiles quieres ver.
        </p>

        <label className="mt-6 flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 accent-rojo-cereza400"
            checked={confirmedAdult}
            onChange={(event) => setConfirmedAdult(event.target.checked)}
          />
          <span>Confirmo que soy mayor de 18 años.</span>
        </label>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {CHOICES.map((choice) => (
            <button
              key={`${choice.sex}:${choice.identity}`}
              type="button"
              disabled={!confirmedAdult}
              onClick={() => handleSelect(choice.sex, choice.identity)}
              className="rounded-[24px] border border-white/15 bg-white/5 px-5 py-4 text-left text-sm font-semibold text-white/90 transition hover:border-white/30 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {choice.label}
            </button>
          ))}
        </div>

        <p className="mt-6 text-xs text-white/50">
          Preferencia recordada en este dispositivo; la confirmación de edad solo se recuerda durante esta sesión.
        </p>
      </section>
    </div>
  );
}
