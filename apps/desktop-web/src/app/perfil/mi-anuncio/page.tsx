import { PageHeader } from "@/components/layout/PageHeader";
import { ScreenShell } from "@/components/layout/ScreenShell";
import { getPageDefinition } from "@/config/routes";
import { PerfilMiAnuncio } from "@/screens/PerfilMiAnuncio";

const PAGE = getPageDefinition("perfil-mi-anuncio");

export default function PerfilMiAnuncioPage() {
  return (
    <>
      {PAGE && <PageHeader page={PAGE} />}
      <ScreenShell>
        <PerfilMiAnuncio />
      </ScreenShell>
    </>
  );
}
