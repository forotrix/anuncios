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
      <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center gap-8 text-center lg:flex-row lg:items-start lg:justify-between lg:text-left">
        <div className="flex flex-col items-center gap-3 lg:items-start">
          <Link href="/feed" onClick={handleLogoClick} aria-label="Volver al inicio">
            <img className="h-[50px] w-auto sm:h-[66px] sm:w-[273px]" alt="ForoTrix" src={ASSETS.logoPrimary} />
          </Link>
          <p className="max-w-[300px] text-sm text-white/80 lg:max-w-none">La plataforma de encuentros y fantasías donde el deseo cobra vida</p>
        </div>

        <nav className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 sm:gap-x-6 sm:gap-y-2" aria-label="Legal">
          <Link href="/legal/aviso-legal" className="text-white/80 hover:text-white">
            Aviso legal
          </Link>
          <Link href="/legal/privacidad" className="text-white/80 hover:text-white">
            Política de privacidad
          </Link>
          <Link href="/legal/cookies" className="text-white/80 hover:text-white">
            Política de cookies
          </Link>
          <Link href="/legal/terminos" className="text-white/80 hover:text-white">
            Términos y condiciones
          </Link>
          <Link href="/ayuda" className="text-white/80 hover:text-white">
            Ayuda / Contacto
          </Link>
        </nav>

        <p className="max-w-[320px] text-sm text-white/80">
          ForoTrix actúa como intermediario técnico y no participa en los servicios ofrecidos por los anunciantes.
        </p>
      </div>
    </footer>
  );
};
