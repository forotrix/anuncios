"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { ASSETS } from "@/constants/assets";
import { useAuth } from "@/hooks/useAuth";

const NAV_LINKS = [
  { href: "/perfil/mi-anuncio", label: "Mi anuncio" },
  { href: "/perfil/cuenta", label: "Cuenta" },
  { href: "/perfil/suscripciones", label: "Subscripciones" },
  { href: "/perfil/estadisticas", label: "Estadisticas" },
  { href: "/anuncio", label: "Ver anuncio" },
] as const;

const NAV_LINK_BASE_CLASS =
  "font-h5 font-[number:var(--h5-font-weight)] text-[length:var(--h5-font-size)] tracking-[var(--h5-letter-spacing)] leading-[var(--h5-line-height)] [font-style:var(--h5-font-style)] transition-colors duration-150 px-5 py-3 rounded-[14px]";

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, logout } = useAuth();

  const isActive = (href: string) => {
    if (href === "/anuncio") {
      return pathname.startsWith("/anuncio");
    }
    return pathname === href;
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/feed");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="bg-collection-1-fondo-02 w-full overflow-x-auto">
      <div className="mx-auto flex min-h-screen min-w-[1440px] flex-col" data-model-id="421:3496">
        <div className="relative flex-1">
          <div className="absolute left-0 top-0 h-[4.73%] w-full bg-[#070e0f]" />

          <SiteHeader logoHref="/feed" />

          <img className="absolute left-[65px] top-[166px] h-[45px] w-[58px]" alt="Decoracion" src={ASSETS.profileHeroTop} />

          <Link
            href="/feed"
            className="absolute left-[150px] top-[170px] font-h3-subdivisiones font-[number:var(--h3-subdivisiones-font-weight)] text-gris-claro text-[length:var(--h3-subdivisiones-font-size)] tracking-[var(--h3-subdivisiones-letter-spacing)] leading-[var(--h3-subdivisiones-line-height)] [font-style:var(--h3-subdivisiones-font-style)] transition hover:text-white"
          >
            Volver
          </Link>

          <nav
            className="absolute left-[70px] top-[300px] z-10 flex w-[219px] flex-col rounded-[18px] bg-[#52040a]/70 p-2 backdrop-blur-sm"
            aria-label="Navegacion de perfil"
          >
            {NAV_LINKS.map((link, index) => {
              const active = isActive(link.href);
              const roundedClass =
                index === 0
                  ? "rounded-t-[18px]"
                  : index === NAV_LINKS.length - 1
                    ? "rounded-b-[18px]"
                    : "rounded-[14px]";
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`${NAV_LINK_BASE_CLASS} ${roundedClass} ${
                    active
                      ? "bg-[#870005] text-white shadow-[0_0_10px_rgba(135,0,5,0.45)]"
                      : "text-gris-claro hover:text-white"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  {link.label}
                </Link>
              );
            })}
            <button
              type="button"
              onClick={logout}
              className={`${NAV_LINK_BASE_CLASS} rounded-[14px] text-gris-claro hover:text-white`}
            >
              Salir
            </button>
          </nav>

          {children}
        </div>

        <SiteFooter />
      </div>
    </div>
  );
}
