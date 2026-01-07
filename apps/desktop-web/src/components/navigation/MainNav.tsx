"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { PAGE_DEFINITIONS } from "@/config/routes";
import { ASSETS } from "@/constants/assets";

export const MainNav = () => {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-6 px-6 py-4 text-sm text-white">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-[120px]">
            <Image
              src={ASSETS.logoPrimary}
              alt="ForoTrix"
              fill
              className="object-contain"
              priority
            />
          </div>
          <span className="hidden text-xs uppercase tracking-[0.2em] text-white/70 sm:block">
            Desktop demo
          </span>
        </div>

        <nav className="flex flex-1 justify-end gap-2">
          {PAGE_DEFINITIONS.map((link) => {
            const isActive =
              link.href === "/" ? pathname === link.href : pathname.startsWith(link.href);

            return (
              <Link
                key={link.id}
                href={link.href}
                className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition hover:border-rojo-pasion300 hover:text-rojo-pasion200 ${
                  isActive
                    ? "border-rojo-pasion300 bg-rojo-pasion300/20 text-rojo-pasion100"
                    : "border-white/20 text-white/70"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
