import { Anuncio } from "@/screens/Anuncio";
import { fetchAdById } from "@/lib/ads";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type AnuncioDetailPageProps = {
  params: { id: string } | Promise<{ id: string }>;
};

export default async function AnuncioDetailPage({ params }: AnuncioDetailPageProps) {
  const resolvedParams = await params;
  const id = resolvedParams?.id;
  const result = await resolveAdForPage(id);
  if (!result) {
    notFound();
  }
  return <Anuncio ad={result.ad} isMock={result.isMock} />;
}

async function resolveAdForPage(id?: string) {
  if (!id) return null;
  try {
    const result = await fetchAdById(id);
    if (result?.ad) return result;
  } catch {
    // fall back below
  }

  if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
    try {
      return await fetchAdById("mock-1");
    } catch {
      return null;
    }
  }

  return null;
}
