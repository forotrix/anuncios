import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";

export const metadata: Metadata = {
  title: "Términos y condiciones | ForoTrix",
  description: "Términos y condiciones de uso de ForoTrix.",
};

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-[#020404] text-white">
      <SiteHeader logoHref="/feed" />

      <main className="mx-auto w-full max-w-[1440px] px-6 pt-24 md:px-16">
        <h1 className="text-3xl font-semibold">TÉRMINOS Y CONDICIONES DE USO</h1>

        <section className="mt-10 space-y-10 text-sm text-white/80">
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-white">Naturaleza del servicio</h2>
            <p>
              ForoTrix es una plataforma digital de anuncios gestionados por terceros. El titular actúa exclusivamente como intermediario técnico y no
              participa ni es responsable de los servicios ofrecidos por los anunciantes.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-white">Condiciones de acceso</h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>El acceso y uso del sitio web está reservado exclusivamente a personas mayores de 18 años.</li>
              <li>El usuario se compromete a utilizar la plataforma de forma lícita y conforme a la normativa vigente.</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-white">Normas de publicación</h2>
            <p>Queda expresamente prohibida la publicación de contenidos:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Que involucren a menores de edad.</li>
              <li>Ilícitos, violentos, coactivos o no consentidos.</li>
              <li>Que vulneren derechos fundamentales o de terceros.</li>
            </ul>
            <p>El titular se reserva el derecho de retirar contenidos y suspender cuentas que incumplan estas normas.</p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-white">Moderación y retirada de contenidos</h2>
            <p>
              El titular actuará con diligencia en la retirada de contenidos ilícitos o contrarios a las normas una vez tenga conocimiento efectivo de
              los mismos, conforme a la normativa aplicable.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-white">Limitación de responsabilidad</h2>
            <p>
              El titular no garantiza la veracidad de los anuncios ni se responsabiliza de las relaciones o servicios que se deriven entre usuarios.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-white">Modificaciones</h2>
            <p>
              El titular se reserva el derecho a modificar los presentes términos en cualquier momento. Las modificaciones serán aplicables desde su
              publicación en el sitio web.
            </p>
          </div>
        </section>
      </main>

      <SiteFooter className="mt-16" />
    </div>
  );
}

