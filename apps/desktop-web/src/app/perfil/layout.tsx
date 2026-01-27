"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { ASSETS } from "@/constants/assets";
import { useAuth } from "@/hooks/useAuth";
import { adService } from "@/services/ad.service";

type NavLink = {
  href: string;
  label: string;
  requiresProvider?: boolean;
};

const NAV_LINKS: NavLink[] = [
  { href: "/perfil/mi-anuncio", label: "Mi anuncio", requiresProvider: true },
  { href: "/perfil/cuenta", label: "Cuenta" },
  { href: "/perfil/suscripciones", label: "Suscripciones", requiresProvider: true },
  { href: "/perfil/estadisticas", label: "Estadísticas", requiresProvider: true },
];

const NAV_LINK_BASE_CLASS =
  "font-h5 font-[number:var(--h5-font-weight)] text-[length:var(--h5-font-size)] tracking-[var(--h5-letter-spacing)] leading-[var(--h5-line-height)] [font-style:var(--h5-font-style)] transition-colors duration-150 px-5 py-3 rounded-[14px]";

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isReady, logout, accessToken, user } = useAuth();
  const [ownAdId, setOwnAdId] = useState<string | null>(null);
  const [ownAdPreviewId, setOwnAdPreviewId] = useState<string | null>(null);
  const [roleNotice, setRoleNotice] = useState<string | null>(null);
  const isProviderRole = user?.role === "provider" || user?.role === "agency";
  const [isAtTop, setIsAtTop] = useState(true);
  const topSentinelRef = useRef<HTMLDivElement>(null);

  const isActive = (href: string) => {
    if (href === "/anuncio") {
      return pathname.startsWith("/anuncio");
    }
    return pathname === href;
  };

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated) {
      router.replace("/feed");
    }
  }, [isAuthenticated, isReady, router]);

  useEffect(() => {
    if (!isAuthenticated || !accessToken || !isProviderRole) {
      setOwnAdId(null);
      setOwnAdPreviewId(null);
      return;
    }
    let isActive = true;
    const loadOwnAd = async () => {
      try {
        const response = await adService.fetchOwnAds(accessToken, { page: 1, limit: 1 });
        const firstAd = response.items?.[0];
        if (isActive) {
          setOwnAdId(firstAd && firstAd.status === "published" ? firstAd.id : null);
          setOwnAdPreviewId(firstAd?.id ?? null);
        }
      } catch {
        if (isActive) {
          setOwnAdId(null);
          setOwnAdPreviewId(null);
        }
      }
    };
    loadOwnAd();
    return () => {
      isActive = false;
    };
  }, [isAuthenticated, accessToken, isProviderRole]);

  useEffect(() => {
    if (!roleNotice) return;
    const timer = window.setTimeout(() => setRoleNotice(null), 3000);
    return () => window.clearTimeout(timer);
  }, [roleNotice]);

  const handleProviderRequired = () => {
    setRoleNotice("Solo disponible para anunciantes (provider/agency).");
  };

  useEffect(() => {
    const sentinel = topSentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsAtTop(entry.isIntersecting);
      },
      { threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  if (!isReady) {
    return null;
  }
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="w-full bg-black overflow-x-hidden">
      <div className="mx-auto flex min-h-screen w-full flex-col" data-model-id="421:3496">
        <div className="relative flex-1">
          <div className="absolute left-0 top-0 h-[4.73%] w-full bg-black" />

          <SiteHeader logoHref="/feed" />


          <main
            className={`transition-[padding-top] duration-200 ease-out ${
              isAtTop ? "pt-[88px] md:pt-[196px]" : ""
            }`}
          >
            <div ref={topSentinelRef} aria-hidden="true" />
            <div className="mx-auto w-full max-w-[1360px] px-4 pb-10 pt-6 sm:px-6 lg:px-10">
              <div className="mb-4 flex items-center gap-4 lg:mb-6">
                <Link
                  href="/feed"
                  className="inline-flex items-center gap-3 rounded-[14px] px-2 py-2 font-h3-subdivisiones font-[number:var(--h3-subdivisiones-font-weight)] text-gris-claro text-[length:var(--h3-subdivisiones-font-size)] tracking-[var(--h3-subdivisiones-letter-spacing)] leading-[var(--h3-subdivisiones-line-height)] [font-style:var(--h3-subdivisiones-font-style)] transition hover:text-white"
                >
                  <img className="h-[32px] w-[40px] lg:h-[45px] lg:w-[58px]" alt="Volver" src={ASSETS.profileHeroTop} />
                  Volver
                </Link>
              </div>
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-12">
                <aside className="w-full shrink-0 lg:w-[178px] lg:self-start">
                  <nav
                    className="no-scrollbar flex w-full items-center gap-2 overflow-x-auto rounded-[18px] bg-[#52040a]/70 p-2 backdrop-blur-sm lg:flex-col lg:items-stretch"
                    aria-label="Navegacion de perfil"
                  >
                    {NAV_LINKS.map((link, index) => {
                      const active = isActive(link.href);
                      const roundedClass = "rounded-[14px]";
                      if (link.requiresProvider && !isProviderRole) {
                        return (
                          <button
                            key={link.href}
                            type="button"
                            className={`${NAV_LINK_BASE_CLASS} ${roundedClass} whitespace-nowrap cursor-not-allowed bg-[#1a0a0b] text-white/50 shrink-0`}
                            onClick={handleProviderRequired}
                          >
                            {link.label}
                          </button>
                        );
                      }

                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          className={`${NAV_LINK_BASE_CLASS} ${roundedClass} whitespace-nowrap shrink-0 ${
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
                    {isProviderRole ? (
                      <Link
                        href={
                          ownAdId
                            ? `/anuncio/${ownAdId}`
                            : ownAdPreviewId
                              ? `/anuncio/preview/${ownAdPreviewId}`
                              : "/perfil/mi-anuncio"
                        }
                        className={`${NAV_LINK_BASE_CLASS} rounded-[14px] whitespace-nowrap shrink-0 ${
                          pathname.startsWith("/anuncio")
                            ? "bg-[#870005] text-white shadow-[0_0_10px_rgba(135,0,5,0.45)]"
                            : "text-gris-claro hover:text-white"
                        }`}
                      >
                        Ver anuncio
                      </Link>
                    ) : (
                      <button
                        type="button"
                        className={`${NAV_LINK_BASE_CLASS} rounded-[14px] whitespace-nowrap shrink-0 cursor-not-allowed bg-[#1a0a0b] text-white/50`}
                        onClick={handleProviderRequired}
                      >
                        Ver anuncio
                      </button>
                    )}
                    {roleNotice && <p className="whitespace-nowrap px-3 pt-2 text-[11px] text-white/60 lg:whitespace-normal">{roleNotice}</p>}
                    <button
                      type="button"
                      onClick={logout}
                      className={`${NAV_LINK_BASE_CLASS} rounded-[14px] whitespace-nowrap shrink-0 text-gris-claro hover:text-white`}
                    >
                      Salir
                    </button>
                  </nav>
                </aside>
                <div className="min-w-0 flex-1">{children}</div>
              </div>
            </div>
          </main>
        </div>

        <SiteFooter />
      </div>
    </div>
  );
}
