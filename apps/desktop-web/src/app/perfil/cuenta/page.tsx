import { ScreenShell } from "@/components/layout/ScreenShell";
import { PerfilCuenta } from "@/screens/PerfilCuenta";

export default function PerfilCuentaPage() {
  return (
    <>
      <ScreenShell disableMinWidth disableOverflow>
        <PerfilCuenta />
      </ScreenShell>
    </>
  );
}
