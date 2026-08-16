import { ScreenShell } from "@/components/layout/ScreenShell";
import { PerfilMisPerfiles } from "@/screens/PerfilMisPerfiles/PerfilMisPerfiles";

export default function PerfilMisPerfilesPage() {
  return (
    <>
      <ScreenShell disableMinWidth disableOverflow>
        <PerfilMisPerfiles />
      </ScreenShell>
    </>
  );
}
