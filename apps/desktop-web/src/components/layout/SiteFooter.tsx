 "use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ASSETS } from "@/constants/assets";

type Props = {
  className?: string;
};

export const SiteFooter = ({ className = "" }: Props) => {
  const pathname = usePathname();
  const handleLogoClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === "/feed") {
      event.preventDefault();
      window.scrollTo({ top: 0 });
    }
  };

  return (
    <footer className={`w-full bg-black px-6 py-10 text-white md:px-16 ${className}`}>
      <div className="mx-auto flex w-full max-w-[1440px] flex-wrap items-start justify-between gap-8">
        <div className="flex flex-col items-start gap-3">
          <Link href="/feed" onClick={handleLogoClick} aria-label="Volver al inicio">
            <img className="h-[66px] w-[273px]" alt="ForoTrix" src={ASSETS.logoPrimary} />
          </Link>
          <p className="text-sm text-white/80">La plataforma de encuentros y fantasías donde el deseo cobra vida</p>
        </div>

        <nav className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 sm:gap-x-6 sm:gap-y-2" aria-label="Legal">
          <Link href="/legal/aviso-legal" className="text-left text-white/80 hover:text-white">
            Aviso legal
          </Link>
          <Link href="/legal/privacidad" className="text-left text-white/80 hover:text-white">
            Política de privacidad
          </Link>
          <Link href="/legal/cookies" className="text-left text-white/80 hover:text-white">
            Política de cookies
          </Link>
          <Link href="/legal/terminos" className="text-left text-white/80 hover:text-white">
            Términos y condiciones
          </Link>
          <Link href="/ayuda" className="text-left text-white/80 hover:text-white">
            Ayuda / Contacto
          </Link>
        </nav>

        <p className="text-sm text-white/80 sm:max-w-[320px]">
          ForoTrix actúa como intermediario técnico y no participa en los servicios ofrecidos por los anunciantes.
        </p>
      </div>
    </footer>
  );
};
