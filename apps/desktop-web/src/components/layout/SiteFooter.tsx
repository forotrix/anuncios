import Link from "next/link";
import { ASSETS } from "@/constants/assets";

type Props = {
  className?: string;
};

export const SiteFooter = ({ className = "" }: Props) => {
  return (
    <footer className={`w-full bg-[#020404] px-6 py-10 text-white md:px-16 ${className}`}>
      <div className="mx-auto flex w-full max-w-[1440px] flex-wrap items-start justify-between gap-8">
        <div className="flex flex-col items-start gap-3">
          <img className="h-[66px] w-[273px]" alt="ForoTrix" src={ASSETS.logoPrimary} />
          <p className="text-sm text-white/80">La plataforma de encuentros y fantasías donde el deseo cobra vida</p>
        </div>

        <nav className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm" aria-label="Legal">
          <Link href="/legal/aviso-legal" className="col-start-1 row-start-1 text-left text-white/80 hover:text-white">
            Aviso legal
          </Link>
          <Link href="/legal/privacidad" className="col-start-1 row-start-2 text-left text-white/80 hover:text-white">
            Política de privacidad
          </Link>
          <Link href="/legal/cookies" className="col-start-1 row-start-3 text-left text-white/80 hover:text-white">
            Política de cookies
          </Link>
          <Link href="/legal/terminos" className="col-start-1 row-start-4 text-left text-white/80 hover:text-white">
            Términos y condiciones
          </Link>
          <Link href="/ayuda" className="col-start-2 row-start-1 text-left text-white/80 hover:text-white">
            Ayuda / Contacto
          </Link>
        </nav>

        <p className="w-[320px] text-sm text-white/80">
          ForoTrix actúa como intermediario técnico y no participa en los servicios ofrecidos por los anunciantes.
        </p>
      </div>
    </footer>
  );
};

