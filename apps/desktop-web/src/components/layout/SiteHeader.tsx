"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { GenderIdentity, GenderSex } from "@anuncios/shared";
import { GenderToggleStack } from "@/components/GenderToggleStack";
import { BotonChicas } from "@/components/BotonChicas";
import { ASSETS } from "@/constants/assets";
import { useAuth } from "@/hooks/useAuth";
import { useAuthModal } from "@/hooks/useAuthModal";
import { useEffect, useState } from "react";

type Props = {
  genderSex?: GenderSex;
  genderIdentity?: GenderIdentity;
  onGenderSexChange?: (next: GenderSex) => void;
  onGenderIdentityChange?: (next: GenderIdentity) => void;
  profileToggleClassName?: string;
  logoHref?: string;
  onRegisterClick?: () => void;
};

const DEFAULT_PROFILE_TOGGLE_CLASS = "absolute left-[618px] top-1/2 -translate-y-1/2";
const MENU_ID = "siteheader-mobile-menu";

export const SiteHeader = ({
  genderSex,
  genderIdentity,
  onGenderSexChange,
  onGenderIdentityChange,
  profileToggleClassName = DEFAULT_PROFILE_TOGGLE_CLASS,
  logoHref = "/feed",
  onRegisterClick,
}: Props) => {
  const { isAuthenticated, user } = useAuth();
  const { openRegister } = useAuthModal();
  const canToggleGender = genderSex && genderIdentity && onGenderSexChange && onGenderIdentityChange;
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const handleRegisterClick = onRegisterClick ?? openRegister;
  const isProviderRole = user?.role === "provider" || user?.role === "agency";
  const handleLogoClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === "/feed") {
      event.preventDefault();
      window.scrollTo({ top: 0 });
    }
  };
  const handleProviderRequired = () => {
    window.alert("Solo disponible para anunciantes (provider/agency).");
  };

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const { style } = document.body;
    const prevOverflow = style.overflow;
    if (isMobileMenuOpen) {
      style.overflow = "hidden";
    } else {
      style.overflow = prevOverflow;
    }
    return () => {
      style.overflow = prevOverflow;
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <header className="fixed left-0 top-0 z-[240] w-full bg-black">
        <div className="mx-auto w-full max-w-[1440px]">
          <div className="relative h-[72px] w-full md:h-[168px]">
            {canToggleGender && (
              <div className={`hidden md:block ${profileToggleClassName}`}>
                <div className="flex flex-col items-center py-2">
                  <GenderToggleStack
                    sex={genderSex}
                    identity={genderIdentity}
                    onSexChange={onGenderSexChange}
                    onIdentityChange={onGenderIdentityChange}
                    gapClassName="gap-3"
                    className="items-center"
                  />
                </div>
              </div>
            )}

            <Link
              href={logoHref}
              onClick={handleLogoClick}
              className="absolute left-4 top-1/2 block h-[40px] w-[170px] -translate-y-1/2 md:left-[72px] md:h-[66px] md:w-[273px]"
              aria-label="Volver al inicio"
            >
              <img className="h-full w-full" alt="Logo Forotrix" src={ASSETS.logoPrimary} />
            </Link>

            <button
              type="button"
              className="absolute right-4 top-1/2 z-[260] inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white/80 backdrop-blur-sm transition hover:border-white/40 hover:text-white md:hidden"
              aria-label={isMobileMenuOpen ? "Cerrar menu" : "Abrir menu"}
              aria-expanded={isMobileMenuOpen}
              aria-controls={MENU_ID}
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            >
              <span className="text-lg leading-none">{isMobileMenuOpen ? "×" : "≡"}</span>
            </button>

            <div className="absolute right-[72px] top-1/2 hidden -translate-y-1/2 items-center gap-4 lg:flex">
              <BotonChicas
                buttonStyleDivClassName="!mr-[-20.50px] !mt-[-3.00px] !tracking-[var(--h4-letter-spacing)] !ml-[-20.50px] !text-[length:var(--h4-font-size)] ![font-style:var(--h4-font-style)] ![white-space:unset] !font-[number:var(--h4-font-weight)] !font-h4 !leading-[var(--h4-line-height)]"
                buttonStyleStyleFilledIconNoClassName="!self-stretch !flex-[0_0_auto] !px-[70px] !py-3.5 !flex !left-[unset] !w-full !top-[unset] !rounded-[30px] !bg-black"
                buttonStyleText="Anuncia"
                className={`!relative !left-[unset] !top-[unset] !p-[3px] !gap-0 !items-stretch !rounded-[32px] ${
                  isAuthenticated && !isProviderRole
                    ? "!bg-[#2a0b0e] !opacity-60 !cursor-not-allowed"
                    : "!bg-[linear-gradient(119deg,rgba(135,0,5,1)_12%,rgba(172,7,13,1)_45%,rgba(208,29,35,1)_75%,rgba(236,76,81,1)_100%)]"
                }`}
                propiedad1="predeterminada"
                {...(isAuthenticated
                  ? isProviderRole
                    ? { to: "/perfil/mi-anuncio" }
                    : { onClick: handleProviderRequired }
                  : { onClick: handleRegisterClick })}
              />

              {isAuthenticated ? (
                <Link
                  href={isProviderRole ? "/perfil/mi-anuncio" : "/perfil/cuenta"}
                  className="relative h-[66px] w-[273px]"
                  aria-label="Mi cuenta"
                >
                  <BotonChicas
                    buttonStyleDivClassName="!mr-[-40.00px] !mt-[-3.00px] !tracking-[var(--h4-letter-spacing)] !ml-[-40.00px] !text-[length:var(--h4-font-size)] ![font-style:var(--h4-font-style)] ![white-space:unset] !font-[number:var(--h4-font-weight)] !font-h4 !leading-[var(--h4-line-height)]"
                    buttonStyleStyleFilledIconNoClassName="!self-stretch !flex-[0_0_auto] !px-[70px] !py-3.5 !bg-blend-screen !flex !left-[unset] !bg-[linear-gradient(119deg,rgba(135,0,5,1)_12%,rgba(172,7,13,1)_45%,rgba(208,29,35,1)_75%,rgba(236,76,81,1)_100%)] !bg-[unset] !w-full !top-[unset]"
                    buttonStyleText="Mi cuenta"
                    className="!relative !left-[unset] !top-[unset]"
                    propiedad1="predeterminada"
                  />
                </Link>
              ) : (
                <BotonChicas
                  buttonStyleDivClassName="!mr-[-40.00px] !mt-[-3.00px] !tracking-[var(--h4-letter-spacing)] !ml-[-40.00px] !text-[length:var(--h4-font-size)] ![font-style:var(--h4-font-style)] ![white-space:unset] !font-[number:var(--h4-font-weight)] !font-h4 !leading-[var(--h4-line-height)]"
                  buttonStyleStyleFilledIconNoClassName="!self-stretch !flex-[0_0_auto] !px-[70px] !py-3.5 !bg-blend-screen !flex !left-[unset] !bg-[linear-gradient(119deg,rgba(135,0,5,1)_12%,rgba(172,7,13,1)_45%,rgba(208,29,35,1)_75%,rgba(236,76,81,1)_100%)] !bg-[unset] !w-full !top-[unset]"
                  buttonStyleText="Registrarse"
                  className="!relative !left-[unset] !top-[unset]"
                  propiedad1="predeterminada"
                  onClick={handleRegisterClick}
                />
              )}
            </div>
          </div>
        </div>
      </header>

      {isMobileMenuOpen && (
        <div id={MENU_ID} className="fixed inset-0 z-[250] md:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            aria-label="Cerrar menu"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <aside className="absolute right-0 top-0 flex h-full w-[85vw] max-w-[360px] flex-col gap-6 border-l border-white/10 bg-[#020404] px-6 py-6 shadow-[0_30px_80px_rgba(0,0,0,0.65)]">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">Menu</p>
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/80 transition hover:border-white/40 hover:text-white"
                aria-label="Cerrar menu"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                ×
              </button>
            </div>

            {canToggleGender && (
              <div className="rounded-[28px] border border-white/10 bg-[#07080c]/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/50">Preferencias</p>
                <div className="mt-4">
                  <GenderToggleStack
                    sex={genderSex}
                    identity={genderIdentity}
                    onSexChange={onGenderSexChange}
                    onIdentityChange={onGenderIdentityChange}
                    gapClassName="gap-3"
                  />
                </div>
              </div>
            )}

            <div className="mt-auto space-y-3">
              {isAuthenticated ? (
                isProviderRole ? (
                  <Link
                    href="/perfil/mi-anuncio"
                    className="inline-flex w-full items-center justify-center rounded-full border border-white/20 bg-white/5 px-6 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-white/85 transition hover:border-white/40 hover:text-white"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Anuncia
                  </Link>
                ) : (
                  <button
                    type="button"
                    className="inline-flex w-full cursor-not-allowed items-center justify-center rounded-full border border-white/10 bg-[#1a0a0b] px-6 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-white/50"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleProviderRequired();
                    }}
                  >
                    Anuncia
                  </button>
                )
              ) : onRegisterClick ? (
                <button
                  type="button"
                  className="inline-flex w-full items-center justify-center rounded-full border border-white/20 bg-white/5 px-6 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-white/85 transition hover:border-white/40 hover:text-white"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onRegisterClick();
                  }}
                >
                  Anuncia
                </button>
              ) : (
                <button
                  type="button"
                  className="inline-flex w-full items-center justify-center rounded-full border border-white/20 bg-white/5 px-6 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-white/85 transition hover:border-white/40 hover:text-white"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleRegisterClick();
                  }}
                >
                  Anuncia
                </button>
              )}

              {isAuthenticated ? (
                <Link
                  href={isProviderRole ? "/perfil/mi-anuncio" : "/perfil/cuenta"}
                  className="inline-flex w-full items-center justify-center rounded-full bg-[linear-gradient(119deg,rgba(135,0,5,1)_12%,rgba(172,7,13,1)_45%,rgba(208,29,35,1)_75%,rgba(236,76,81,1)_100%)] px-6 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-white shadow-shadow-g"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Mi cuenta
                </Link>
              ) : onRegisterClick ? (
                <button
                  type="button"
                  className="inline-flex w-full items-center justify-center rounded-full bg-[linear-gradient(119deg,rgba(135,0,5,1)_12%,rgba(172,7,13,1)_45%,rgba(208,29,35,1)_75%,rgba(236,76,81,1)_100%)] px-6 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-white shadow-shadow-g"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onRegisterClick();
                  }}
                >
                  Registrarse
                </button>
              ) : (
                <button
                  type="button"
                  className="inline-flex w-full items-center justify-center rounded-full bg-[linear-gradient(119deg,rgba(135,0,5,1)_12%,rgba(172,7,13,1)_45%,rgba(208,29,35,1)_75%,rgba(236,76,81,1)_100%)] px-6 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-white shadow-shadow-g"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleRegisterClick();
                  }}
                >
                  Registrarse
                </button>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  );
};
