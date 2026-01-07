import { PageHeader } from "@/components/layout/PageHeader";
import { ScreenShell } from "@/components/layout/ScreenShell";
import { getPageDefinition } from "@/config/routes";
import { PerfilEstadisticas } from "@/screens/PerfilEstadisticas/PerfilEstadisticas";

const PAGE = getPageDefinition("perfil-estadisticas");

export default function PerfilEstadisticasPage() {
  return (
    <>
      {PAGE && <PageHeader page={PAGE} />}
      <ScreenShell>
        <PerfilEstadisticas />
      </ScreenShell>
    </>
  );
}
