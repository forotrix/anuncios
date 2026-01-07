import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";

export const metadata: Metadata = {
  title: "Política de cookies | ForoTrix",
  description: "Política de cookies de ForoTrix (solo cookies y almacenamiento técnico).",
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-[#020404] text-white">
      <SiteHeader logoHref="/feed" />

      <main className="mx-auto w-full max-w-[1440px] px-6 pt-24 md:px-16">
        <h1 className="text-3xl font-semibold">POLÍTICA DE COOKIES</h1>

        <section className="mt-10 space-y-10 text-sm text-white/80">
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-white">Uso de cookies y almacenamiento local</h2>
            <p>
              Este sitio web utiliza únicamente cookies y tecnologías de almacenamiento local estrictamente necesarias para su funcionamiento, tales
              como la gestión de sesiones, la autenticación de usuarios y la seguridad de la plataforma.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-white">Tipología utilizada</h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>Cookies técnicas y de sesión: necesarias para el correcto funcionamiento del sitio web.</li>
              <li>
                Almacenamiento local (localStorage / sessionStorage): utilizado para mantener estados técnicos de la aplicación y garantizar una
                experiencia estable y segura.
              </li>
            </ul>
            <p>No se utilizan cookies publicitarias, analíticas de terceros ni sistemas de seguimiento con fines comerciales.</p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-white">Consentimiento</h2>
            <p>
              De conformidad con la normativa vigente, el uso de cookies técnicas no requiere el consentimiento previo del usuario. En caso de que en
              el futuro se incorporen cookies adicionales, se solicitará el consentimiento correspondiente.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-white">Configuración del navegador</h2>
            <p>
              El usuario puede configurar su navegador para bloquear o eliminar cookies, si bien esto podría afectar al correcto funcionamiento del
              sitio web.
            </p>
          </div>
        </section>
      </main>

      <SiteFooter className="mt-16" />
    </div>
  );
}

