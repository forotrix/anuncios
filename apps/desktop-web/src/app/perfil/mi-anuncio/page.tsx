import { ScreenShell } from "@/components/layout/ScreenShell";
import { PerfilMiAnuncio } from "@/screens/PerfilMiAnuncio";

export default function PerfilMiAnuncioPage() {
  return (
    <>
      <ScreenShell disableMinWidth disableOverflow>
        <PerfilMiAnuncio />
      </ScreenShell>
    </>
  );
}
