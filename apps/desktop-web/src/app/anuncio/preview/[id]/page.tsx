"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchOwnAdById, type Ad } from "@/lib/ads";
import { useAuth } from "@/hooks/useAuth";
import { Anuncio } from "@/screens/Anuncio";

type PreviewPageProps = {
  params: { id: string };
};

export default function AnuncioPreviewPage({ params }: PreviewPageProps) {
  const router = useRouter();
  const { accessToken, isAuthenticated, isReady } = useAuth();
  const [ad, setAd] = useState<Ad | null>(null);
  const [isMock, setIsMock] = useState(false);

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated || !accessToken) {
      router.replace("/feed");
      return;
    }
    const id = params?.id;
    if (!id) {
      router.replace("/perfil/mi-anuncio");
      return;
    }

    let active = true;
    fetchOwnAdById(id, accessToken)
      .then((result) => {
        if (!active) return;
        setAd(result.ad);
        setIsMock(result.isMock);
      })
      .catch(() => {
        if (!active) return;
        router.replace("/perfil/mi-anuncio");
      });

    return () => {
      active = false;
    };
  }, [accessToken, isAuthenticated, isReady, params, router]);

  if (!ad) {
    return null;
  }

  return <Anuncio ad={ad} isMock={isMock} />;
}
