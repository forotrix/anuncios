"use client";

import React, { useCallback, useEffect, useState } from "react";
import type { AdRecord, AdStatus } from "@anuncios/shared";
import { useAuth } from "@/hooks/useAuth";
import { fetchAdminAds, blockAdminAd, unblockAdminAd } from "@/services/admin.service";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { AdminNav } from "@/components/AdminNav/AdminNav";

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

export const AdminAds = () => {
  const { accessToken, user } = useAuth();
  const [ads, setAds] = useState<AdRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<AdStatus | "">("");
  const [text, setText] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);

  const isAdmin = user?.role === "admin";

  const load = useCallback(async () => {
    if (!accessToken || !isAdmin) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await fetchAdminAds(accessToken, {
        status: statusFilter || undefined,
        text: text.trim() || undefined,
      });
      setAds(data.items);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Error al cargar los anuncios");
    } finally {
      setLoading(false);
    }
  }, [accessToken, isAdmin, statusFilter, text]);

  useEffect(() => {
    load();
  }, [load]);

  const handleToggleBlock = async (ad: AdRecord) => {
    if (!accessToken) return;
    setPendingId(ad.id);
    try {
      const updated =
        ad.status === "blocked" ? await unblockAdminAd(accessToken, ad.id) : await blockAdminAd(accessToken, ad.id);
      setAds((prev) => prev.map((item) => (item.id === ad.id ? updated : item)));
    } catch (err: any) {
      setError(err.message || "No se pudo actualizar el anuncio");
    } finally {
      setPendingId(null);
    }
  };

  if (!isAdmin && !loading) {
    return (
      <div className="flex min-h-screen flex-col bg-black text-white">
        <SiteHeader />
        <main className="flex flex-1 items-center justify-center p-6 text-center">
          <div className="max-w-md space-y-4">
            <h1 className="text-2xl font-bold text-rojo-cereza400">Acceso Restringido</h1>
            <p className="text-white/60">
              Esta página es solo para administradores. Si eres el dueño del sitio, asegúrate de estar logueado con una cuenta de admin.
            </p>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <SiteHeader />
      <main className="mx-auto w-full max-w-[1440px] flex-1 px-6 pt-[168px] pb-24">
        <AdminNav />
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <h1 className="text-3xl font-bold">Moderación de Anuncios</h1>
            <p className="mt-1 text-white/50">Revisa, bloquea o desbloquea anuncios publicados</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && load()}
              placeholder="Buscar por título"
              className="rounded-full bg-white/10 px-4 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:bg-white/20"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as AdStatus | "")}
              className="rounded-full bg-white/10 px-4 py-2 text-sm text-white outline-none"
            >
              <option value="">Todos los estados</option>
              <option value="draft">Borrador</option>
              <option value="published">Publicado</option>
              <option value="blocked">Bloqueado</option>
            </select>
            <button
              onClick={load}
              className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium transition hover:bg-white/20"
            >
              Actualizar
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-rojo-cereza500 border-t-transparent"></div>
          </div>
        ) : error ? (
          <div className="mt-10 rounded-xl bg-rojo-cereza900/20 p-6 text-center text-rojo-cereza200 border border-rojo-cereza900/50">
            {error}
          </div>
        ) : (
          <div className="mt-10 overflow-x-auto rounded-2xl border border-white/10 bg-[#0a0a0a] shadow-2xl">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-xs uppercase tracking-wider text-white/40">
                <tr>
                  <th className="px-6 py-4 font-semibold">Título</th>
                  <th className="px-6 py-4 font-semibold">Ciudad</th>
                  <th className="px-6 py-4 font-semibold">Estado</th>
                  <th className="px-6 py-4 font-semibold">Creado</th>
                  <th className="px-6 py-4 font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {ads.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-white/40">
                      No hay anuncios que coincidan con el filtro.
                    </td>
                  </tr>
                ) : (
                  ads.map((ad) => {
                    const isPending = pendingId === ad.id;
                    return (
                      <tr key={ad.id} className="transition hover:bg-white/[0.02]">
                        <td className="px-6 py-4 text-white/80">{ad.title}</td>
                        <td className="px-6 py-4 text-white/60">{ad.city || "-"}</td>
                        <td className="px-6 py-4">
                          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase ${getStatusColor(ad.status)}`}>
                            {STATUS_LABEL[ad.status]}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 font-mono text-xs text-white/60">
                          {new Date(ad.createdAt).toLocaleDateString("es-ES")}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleBlock(ad)}
                            disabled={isPending}
                            className={`rounded-full px-3 py-1 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${
                              ad.status === "blocked"
                                ? "bg-white/10 hover:bg-white/20"
                                : "bg-rojo-cereza900/30 text-rojo-cereza200 hover:bg-rojo-cereza900/50"
                            }`}
                          >
                            {ad.status === "blocked" ? "Desbloquear" : "Bloquear"}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
};
