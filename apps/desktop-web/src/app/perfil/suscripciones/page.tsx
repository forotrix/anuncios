import { PageHeader } from "@/components/layout/PageHeader";
import { ScreenShell } from "@/components/layout/ScreenShell";
import { getPageDefinition } from "@/config/routes";
import { PerfilSuscripciones } from "@/screens/PerfilSuscripciones/PerfilSuscripciones";

const PAGE = getPageDefinition("perfil-suscripciones");

export default function PerfilSuscripcionesPage() {
  return (
    <>
      {PAGE && <PageHeader page={PAGE} />}
      <ScreenShell>
        <PerfilSuscripciones />
      </ScreenShell>
    </>
  );
}
