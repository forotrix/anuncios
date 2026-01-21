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
  { href: "/perfil/suscripciones", label: "Subscripciones", requiresProvider: true },
  { href: "/perfil/estadisticas", label: "Estadisticas", requiresProvider: true },
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
    <div className="bg-black w-full overflow-x-auto">
      <div className="mx-auto flex min-h-screen min-w-[1440px] flex-col" data-model-id="421:3496">
        <div className="relative flex-1">
          <div className="absolute left-0 top-0 h-[4.73%] w-full bg-black" />

          <SiteHeader logoHref="/feed" />

          <img className="absolute left-[65px] top-[166px] h-[45px] w-[58px]" alt="Decoracion" src={ASSETS.profileHeroTop} />

          <Link
            href="/feed"
            className="absolute left-[150px] top-[170px] font-h3-subdivisiones font-[number:var(--h3-subdivisiones-font-weight)] text-gris-claro text-[length:var(--h3-subdivisiones-font-size)] tracking-[var(--h3-subdivisiones-letter-spacing)] leading-[var(--h3-subdivisiones-line-height)] [font-style:var(--h3-subdivisiones-font-style)] transition hover:text-white"
          >
            Volver
          </Link>

          <main
            className={`transition-[padding-top] duration-200 ease-out ${
              isAtTop ? "pt-[72px] md:pt-[168px]" : ""
            }`}
          >
            <div ref={topSentinelRef} aria-hidden="true" />
            <div className="mx-auto flex w-full max-w-[1280px] items-start gap-8 px-4 pb-24 pt-8 sm:px-6 lg:px-10">
              <aside className="w-[219px] shrink-0 self-start">
                <nav
                  className="flex w-full flex-col rounded-[18px] bg-[#52040a]/70 p-2 backdrop-blur-sm"
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
                    if (link.requiresProvider && !isProviderRole) {
                      return (
                        <button
                          key={link.href}
                          type="button"
                          className={`${NAV_LINK_BASE_CLASS} ${roundedClass} cursor-not-allowed bg-[#1a0a0b] text-white/50`}
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
                  {isProviderRole ? (
                    <Link
                      href={
                        ownAdId
                          ? `/anuncio/${ownAdId}`
                          : ownAdPreviewId
                            ? `/anuncio/preview/${ownAdPreviewId}`
                            : "/perfil/mi-anuncio"
                      }
                      className={`${NAV_LINK_BASE_CLASS} rounded-[14px] ${
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
                      className={`${NAV_LINK_BASE_CLASS} rounded-[14px] cursor-not-allowed bg-[#1a0a0b] text-white/50`}
                      onClick={handleProviderRequired}
                    >
                      Ver anuncio
                    </button>
                  )}
                  {roleNotice && <p className="px-3 pt-2 text-[11px] text-white/60">{roleNotice}</p>}
                  <button
                    type="button"
                    onClick={logout}
                    className={`${NAV_LINK_BASE_CLASS} rounded-[14px] text-gris-claro hover:text-white`}
                  >
                    Salir
                  </button>
                </nav>
              </aside>
              <div className="min-w-0 flex-1">{children}</div>
            </div>
          </main>
        </div>

        <SiteFooter />
      </div>
    </div>
  );
}
