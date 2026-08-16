"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { adService, type AdRecord, type AdStatus } from "@/services/ad.service";

const STATUS_LABEL: Record<AdStatus, string> = {
  draft: "Borrador",
  published: "Publicado",
  blocked: "Bloqueado",
};

function getStatusColor(status: AdStatus) {
  if (status === "published") return "bg-green-500/20 text-green-400 border border-green-500/30";
  if (status === "blocked") return "bg-red-500/20 text-red-400 border border-red-500/30";
  return "bg-white/10 text-white/60 border border-white/20";
}

const cardClass = "rounded-[22px] border border-[#8e1522] bg-[#050102] p-5 shadow-[0_25px_80px_rgba(0,0,0,0.45)]";
const labelClass = "text-[11px] font-semibold uppercase tracking-[0.35em] text-[#ff9aa2]";

export const PerfilMisPerfiles = () => {
  const { accessToken, user } = useAuth();
  const router = useRouter();
  const [ads, setAds] = useState<AdRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const isAgency = user?.role === "agency";

  const load = useCallback(async () => {
    if (!accessToken || !isAgency) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await adService.fetchOwnAds(accessToken, { page: 1, limit: 50 });
      setAds(response.items);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar los perfiles");
    } finally {
      setLoading(false);
    }
  }, [accessToken, isAgency]);

  useEffect(() => {
    if (user && !isAgency) {
      router.replace("/perfil/mi-anuncio");
      return;
    }
    void load();
  }, [user, isAgency, router, load]);

  const handleCreate = async () => {
    if (!accessToken) return;
    setCreating(true);
    try {
      const ad = await adService.createAd(accessToken, {
        title: "Nuevo perfil",
        description: "Perfil pendiente de completar.",
      });
      router.push(`/perfil/mi-anuncio?id=${ad.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear el perfil");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (ad: AdRecord) => {
    if (!accessToken) return;
    if (!window.confirm(`¿Eliminar el perfil "${ad.title}"? Esta acción no se puede deshacer.`)) return;
    setDeletingId(ad.id);
    try {
      await adService.deleteAd(accessToken, ad.id);
      setAds((prev) => prev.filter((item) => item.id !== ad.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar el perfil");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-rojo-cereza500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className={labelClass}>Mis perfiles</p>
          <h1 className="text-2xl font-semibold text-white">Perfiles gestionados</h1>
        </div>
        <button
          onClick={handleCreate}
          disabled={creating}
          className="rounded-full bg-[#870005] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#a5060a] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {creating ? "Creando..." : "+ Nuevo perfil"}
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-rojo-cereza900/50 bg-rojo-cereza900/20 p-4 text-sm text-rojo-cereza200">
          {error}
        </div>
      )}

      {ads.length === 0 ? (
        <div className={`${cardClass} text-center text-white/50`}>
          Aún no tienes perfiles. Crea el primero con el botón de arriba.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ads.map((ad) => (
            <div key={ad.id} className={cardClass}>
              <div className="aspect-[3/4] w-full overflow-hidden rounded-[16px] bg-white/5">
                {ad.images[0]?.url ? (
                  <img src={ad.images[0].url} alt={ad.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-white/30">Sin foto</div>
                )}
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="truncate text-lg font-semibold text-white">{ad.title}</h2>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${getStatusColor(ad.status)}`}
                  >
                    {STATUS_LABEL[ad.status]}
                  </span>
                </div>
                {ad.city && <p className="text-sm text-white/50">{ad.city}</p>}
                <div className="flex items-center gap-2 pt-2">
                  <Link
                    href={`/perfil/mi-anuncio?id=${ad.id}`}
                    className="flex-1 rounded-full bg-white/10 px-3 py-2 text-center text-xs font-medium text-white transition hover:bg-white/20"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => handleDelete(ad)}
                    disabled={deletingId === ad.id}
                    className="rounded-full bg-rojo-cereza900/30 px-3 py-2 text-xs font-medium text-rojo-cereza200 transition hover:bg-rojo-cereza900/50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
