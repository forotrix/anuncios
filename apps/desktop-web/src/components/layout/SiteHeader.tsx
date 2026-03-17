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
      <header className="fixed left-0 top-0 z-[240] w-full bg-black/95 backdrop-blur-md border-b border-white/5">
        <div className="mx-auto w-full max-w-[1280px] px-4 md:px-8">
          <div className="flex h-[72px] items-center justify-between md:h-[96px]">
            {/* Logo */}
            <Link
              href={logoHref}
              onClick={handleLogoClick}
              className="relative block h-[32px] w-[130px] md:h-[48px] md:w-[200px]"
              aria-label="Volver al inicio"
            >
              <img className="h-full w-full object-contain object-left" alt="Logo Forotrix" src={ASSETS.logoPrimary} />
            </Link>

            {/* Middle: Gender Selector (Desktop Only) */}
            {canToggleGender && (
              <div className="hidden lg:flex flex-1 justify-center px-4">
                <GenderToggleStack
                  sex={genderSex}
                  identity={genderIdentity}
                  onSexChange={onGenderSexChange}
                  onIdentityChange={onGenderIdentityChange}
                  gapClassName="gap-3"
                  className="items-center"
                  size="small"
                />
              </div>
            )}

            {/* Right Side: Actions (Desktop) */}
            <div className="hidden lg:flex items-center gap-4">
              <BotonChicas
                buttonStyleDivClassName="!tracking-[0.05em] !text-[14px] !font-semibold"
                buttonStyleStyleFilledIconNoClassName="!px-6 !py-3 !rounded-full !bg-black !w-auto"
                buttonStyleText="Anuncia"
                className={`!relative !left-0 !top-0 !p-1 !gap-0 !w-auto !items-center !rounded-full ${
                  isAuthenticated && !isProviderRole
                    ? "!bg-[#2a0b0e] !opacity-60 !cursor-not-allowed"
                    : "!bg-brand-gradient"
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
                  className="relative group"
                  aria-label="Mi cuenta"
                >
                  <BotonChicas
                    buttonStyleDivClassName="!tracking-[0.05em] !text-[14px] !font-semibold"
                    buttonStyleStyleFilledIconNoClassName="!px-6 !py-3 !rounded-full !bg-brand-gradient !w-auto"
                    buttonStyleText="Mi cuenta"
                    className="!relative !left-0 !top-0 !p-0 !w-auto"
                    propiedad1="predeterminada"
                  />
                </Link>
              ) : (
                <BotonChicas
                  buttonStyleDivClassName="!tracking-[0.05em] !text-[14px] !font-semibold"
                  buttonStyleStyleFilledIconNoClassName="!px-6 !py-3 !rounded-full !bg-brand-gradient !w-auto"
                  buttonStyleText="Inscribirse"
                  className="!relative !left-0 !top-0 !p-0 !w-auto"
                  propiedad1="predeterminada"
                  onClick={handleRegisterClick}
                />
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white/80 transition hover:border-white/40 hover:text-white lg:hidden"
              aria-label={isMobileMenuOpen ? "Cerrar menu" : "Abrir menu"}
              aria-expanded={isMobileMenuOpen}
              aria-controls={MENU_ID}
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            >
              <span className="text-xl leading-none">{isMobileMenuOpen ? "×" : "≡"}</span>
            </button>
          </div>
        </div>
      </header>

      {isMobileMenuOpen && (
        <div id={MENU_ID} className="fixed inset-0 z-[250] lg:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            aria-label="Cerrar menu"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <aside className="absolute right-0 top-0 flex h-[100dvh] w-full max-w-[320px] flex-col gap-6 border-l border-white/10 bg-[#020404] px-6 pt-6 pb-20 shadow-[0_30px_80px_rgba(0,0,0,0.65)] overflow-y-auto">
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
