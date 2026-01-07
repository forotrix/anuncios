import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";

export const metadata: Metadata = {
  title: "Aviso legal | ForoTrix",
  description: "Información legal sobre ForoTrix.",
};

export default function AvisoLegalPage() {
  return (
    <div className="min-h-screen bg-[#020404] text-white">
      <SiteHeader logoHref="/feed" />

      <main className="mx-auto w-full max-w-[1440px] px-6 pt-24 md:px-16">
        <h1 className="text-3xl font-semibold">AVISO LEGAL</h1>

        <section className="mt-10 space-y-10 text-sm text-white/80">
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-white">Información general</h2>
            <p>
              En cumplimiento con lo dispuesto en la Ley 34/2002, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE),
              se informa que el presente sitio web es titularidad de:
            </p>
            <p>Titular: Ritort Patrimoni, S.L.U.</p>
            <p>CIF: B-624541-8</p>
            <p>Domicilio social: Carrer Sant Miquel 31, 08241 Manresa, Barcelona, España</p>
            <p>Correo electrónico de contacto: [legal@forotrix.com]</p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-white">Objeto del sitio web</h2>
            <p>
              ForoTrix tiene como finalidad ofrecer una plataforma digital para la publicación de anuncios por parte de terceros, actuando el titular
              exclusivamente como intermediario técnico.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-white">Responsabilidad</h2>
            <p>
              El titular no se responsabiliza de los contenidos publicados por los anunciantes ni de los servicios que estos puedan ofrecer. El uso del
              sitio web se realiza bajo la exclusiva responsabilidad del usuario.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-white">Legislación aplicable</h2>
            <p>
              Las relaciones entre el titular del sitio web y los usuarios se regirán por la normativa española vigente. Para la resolución de
              cualquier conflicto, las partes se someterán a los juzgados y tribunales de [CIUDAD A DEFINIR].
            </p>
          </div>
        </section>
      </main>

      <SiteFooter className="mt-16" />
    </div>
  );
}

