import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";

export const metadata: Metadata = {
  title: "Ayuda / Contacto | ForoTrix",
  description: "Ayuda y contacto de ForoTrix.",
};

export default function AyudaPage() {
  return (
    <div className="min-h-screen bg-[#020404] text-white">
      <SiteHeader logoHref="/feed" />

      <main className="mx-auto w-full max-w-[1440px] px-6 pt-24 md:px-16">
        <h1 className="text-3xl font-semibold">AYUDA / CONTACTO</h1>

        <section className="mt-10 space-y-6 text-sm text-white/80">
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-white">Contacto</h2>
            <p>
              Para cualquier consulta relacionada con el funcionamiento de la plataforma, incidencias técnicas o cuestiones legales, el usuario puede
              contactar a través de:
            </p>
            <p>Correo electrónico: [contacto@forotrix.com]</p>
          </div>
        </section>
      </main>

      <SiteFooter className="mt-16" />
    </div>
  );
}

