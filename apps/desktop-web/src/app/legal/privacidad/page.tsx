import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";

export const metadata: Metadata = {
  title: "Política de privacidad | ForoTrix",
  description: "Política de privacidad de ForoTrix.",
};

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-[#020404] text-white">
      <SiteHeader logoHref="/feed" />

      <main className="mx-auto w-full max-w-[1440px] px-6 pt-24 md:px-16">
        <h1 className="text-3xl font-semibold">POLÍTICA DE PRIVACIDAD</h1>

        <section className="mt-10 space-y-10 text-sm text-white/80">
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-white">Responsable del tratamiento</h2>
            <p>Responsable: Ritort Patrimoni, S.L.U.</p>
            <p>Domicilio: Carrer Sant Miquel 31, 08241 Manresa, Barcelona</p>
            <p>Correo electrónico: [privacidad@forotrix.com]</p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-white">Datos personales tratados</h2>
            <p>ForoTrix puede tratar las siguientes categorías de datos:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Datos identificativos de usuario (email, nombre de usuario).</li>
              <li>Datos de contacto facilitados voluntariamente por los anunciantes.</li>
              <li>Datos técnicos de navegación (dirección IP anonimizada, user-agent).</li>
              <li>Registros técnicos de actividad vinculados a la seguridad y estabilidad del servicio.</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-white">Finalidades del tratamiento</h2>
            <p>Los datos personales se tratan con las siguientes finalidades:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Gestión de cuentas de usuario y autenticación.</li>
              <li>Publicación y administración de anuncios.</li>
              <li>Garantizar la seguridad, integridad y correcto funcionamiento de la plataforma.</li>
              <li>Prevención de usos indebidos o fraudulentos.</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-white">Base jurídica del tratamiento</h2>
            <p>El tratamiento de los datos se basa en:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>La ejecución de la relación contractual con el usuario.</li>
              <li>El cumplimiento de obligaciones legales aplicables.</li>
              <li>El interés legítimo del responsable en garantizar la seguridad y funcionamiento del servicio.</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-white">Destinatarios de los datos</h2>
            <p>
              Los datos podrán ser tratados por proveedores tecnológicos que actúan como encargados del tratamiento (servicios de hosting,
              infraestructura cloud y almacenamiento), sin que se cedan datos a terceros salvo obligación legal.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-white">Conservación de los datos</h2>
            <p>
              Los datos personales se conservarán durante el tiempo necesario para cumplir las finalidades descritas y mientras exista una relación
              activa con el usuario, o durante los plazos exigidos por la normativa aplicable.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-white">Derechos de las personas usuarias</h2>
            <p>
              El usuario puede ejercer los derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad, así como presentar una
              reclamación ante la Agencia Española de Protección de Datos (AEPD).
            </p>
          </div>
        </section>
      </main>

      <SiteFooter className="mt-16" />
    </div>
  );
}

