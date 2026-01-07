import { Anuncio } from "@/screens/Anuncio";
import { fetchAdById, fetchAds } from "@/lib/ads";

export default async function AnuncioPage() {
  const adsResult = await fetchAds({ limit: 1, featured: true });
  const highlightedAd = adsResult.ads[0];

  if (highlightedAd) {
    return <Anuncio ad={highlightedAd} isMock={adsResult.isMock} />;
  }

  const fallback = await fetchAdById("mock-1");
  return <Anuncio ad={fallback.ad} isMock={fallback.isMock} />;
}
