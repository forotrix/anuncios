"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { fetchEventLogs, type EventLogDTO } from "@/services/admin.service";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export const AdminLogs = () => {
  const { accessToken, user } = useAuth();
  const [logs, setLogs] = useState<EventLogDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (!accessToken || !isAdmin) {
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        console.log("Loading logs with token:", accessToken?.slice(0, 10) + "...");
        const data = await fetchEventLogs(accessToken);
        setLogs(data);
        setError(null);
      } catch (err: any) {
        console.error("Fetch logs error:", err);
        setError(`${err.message} (status: ${err.status})`);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [accessToken, isAdmin]);

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
        <div className="flex items-center justify-between border-b border-white/10 pb-6">
          <div>
            <h1 className="text-3xl font-bold">Panel de Seguimiento</h1>
            <p className="mt-1 text-white/50">Últimos 200 eventos registrados en el sistema</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium transition hover:bg-white/20"
          >
            Actualizar
          </button>
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
                  <th className="px-6 py-4 font-semibold">Fecha</th>
                  <th className="px-6 py-4 font-semibold">Tipo de Evento</th>
                  <th className="px-6 py-4 font-semibold">Usuario / Visitante</th>
                  <th className="px-6 py-4 font-semibold">Datos Extra</th>
                  <th className="px-6 py-4 font-semibold">Dispositivo / IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-white/40">
                      No hay eventos registrados recientemente.
                    </td>
                  </tr>
                ) : (
                  logs.map((log, i) => (
                    <tr key={i} className="transition hover:bg-white/[0.02]">
                      <td className="whitespace-nowrap px-6 py-4 font-mono text-xs text-white/60">
                        {new Date(log.createdAt).toLocaleString("es-ES")}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase ${getEventTypeColor(log.type)}`}>
                          {log.type.replace(/:/g, " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <div className="text-white/80">{log.sessionId?.slice(0, 8) || "N/A"}</div>
                        <div className="text-white/40">{log.visitorId.slice(0, 8)}...</div>
                      </td>
                      <td className="px-6 py-4">
                        {log.data ? (
                          <div className="max-w-[200px] truncate text-xs text-white/50" title={JSON.stringify(log.data, null, 2)}>
                            {JSON.stringify(log.data)}
                          </div>
                        ) : (
                          <span className="text-white/20">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-white/40">
                        <div className="truncate max-w-[150px]">{log.userAgent?.split(" ")[0]}</div>
                        <div>{log.ip || "Local"}</div>
                      </td>
                    </tr>
                  ))
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

function getEventTypeColor(type: string) {
  if (type.includes("auth:") || type.includes("register")) return "bg-green-500/20 text-green-400 border border-green-500/30";
  if (type.includes("error") || type.includes("fail")) return "bg-red-500/20 text-red-400 border border-red-500/30";
  if (type.includes("view:") || type.includes("click:")) return "bg-blue-500/20 text-blue-400 border border-blue-500/30";
  return "bg-white/10 text-white/60 border border-white/20";
}
