import { ScreenShell } from "@/components/layout/ScreenShell";
import { PerfilEstadisticas } from "@/screens/PerfilEstadisticas/PerfilEstadisticas";

export default function PerfilEstadisticasPage() {
  return (
    <>
      <ScreenShell disableMinWidth disableOverflow>
        <PerfilEstadisticas />
      </ScreenShell>
    </>
  );
}
