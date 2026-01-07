import { Anuncio } from "@/screens/Anuncio";
import { fetchAdById } from "@/lib/ads";

export const dynamic = "force-dynamic";

type AnuncioDetailPageProps = {
  params: { id: string };
};

export default async function AnuncioDetailPage({ params }: AnuncioDetailPageProps) {
  const id = params?.id;
  const result = await resolveAdForPage(id);
  return <Anuncio ad={result.ad} isMock={result.isMock} />;
}

async function resolveAdForPage(id?: string) {
  if (id) {
    try {
      const result = await fetchAdById(id);
      if (result?.ad) return result;
    } catch {
      // fall back below
    }
  }

  return fetchAdById("mock-1");
}
