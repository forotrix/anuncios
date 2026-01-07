import { PageHeader } from "@/components/layout/PageHeader";
import { ScreenShell } from "@/components/layout/ScreenShell";
import { getPageDefinition } from "@/config/routes";
import { PerfilCuenta } from "@/screens/PerfilCuenta";

const PAGE = getPageDefinition("perfil-cuenta");

export default function PerfilCuentaPage() {
  return (
    <>
      {PAGE && <PageHeader page={PAGE} />}
      <ScreenShell>
        <PerfilCuenta />
      </ScreenShell>
    </>
  );
}
