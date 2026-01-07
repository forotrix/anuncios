"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useStatsSummary } from "@/hooks/useStatsSummary";
import type { AnalyticsSummary } from "@anuncios/shared";
import { logEvent } from "@/services/eventLogger";

const RANGE_OPTIONS = [
  { id: "7", label: "7 dias", days: 7 },
  { id: "30", label: "30 dias", days: 30 },
];

const EMPTY_SUMMARY: AnalyticsSummary = {
  totalViews: 0,
  totalContacts: 0,
  viewSeries: [],
  contactSeries: [],
  contactsByChannel: {},
  topAds: [],
};

const NAV_LINKS = [
  { id: "mi-anuncio", label: "Mi anuncio" },
  { id: "cuenta", label: "Cuenta" },
  { id: "suscripciones", label: "Suscripciones" },
  { id: "estadisticas", label: "Estadisticas", isActive: true },
  { id: "ver-anuncio", label: "Ver anuncio" },
];

export const PerfilEstadisticas = () => {
  const { accessToken } = useAuth();
  const [range, setRange] = useState(RANGE_OPTIONS[0]);
  const filters = useMemo(() => {
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - range.days);
    return {
      from: from.toISOString().slice(0, 10),
      to: to.toISOString().slice(0, 10),
    };
  }, [range]);

  const { data, loading, error, refresh } = useStatsSummary({
    accessToken,
    filters,
    enabled: Boolean(accessToken),
  });

  const summary = data ?? EMPTY_SUMMARY;
  const isAuthenticated = Boolean(accessToken);

  const handleRangeChange = (option: (typeof RANGE_OPTIONS)[number]) => {
    setRange(option);
    logEvent("analytics:change-range", { days: option.days });
  };

  return (
    <div className="bg-[#020305] text-white">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-10 px-4 pb-24 pt-16 sm:px-6 lg:px-10">
        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-4 text-xs uppercase tracking-[0.35em] text-white/60">
            <span>Panel privado</span>
            <span className="hidden h-1 w-1 rounded-full bg-white/40 sm:inline-flex" />
            <span className="text-white/40">Estadisticas</span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="space-y-2">
              <h1 className="font-h1-2-0 text-[length:var(--h1-2-0-font-size)] leading-[var(--h1-2-0-line-height)]">
                Estadisticas de rendimiento
              </h1>
              <p className="max-w-3xl text-white/70">
                Monitorea las visualizaciones, contactos generados y anuncios con mejor desempeno para optimizar tus campanas.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {RANGE_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleRangeChange(option)}
                  className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] transition ${
                    option.id === range.id ? "border-rojo-pasion400 text-white" : "border-white/20 text-white/70"
                  }`}
                >
                  {option.label}
                </button>
              ))}
              <button
                type="button"
                disabled={!isAuthenticated || loading}
                onClick={() => refresh()}
                className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/70 transition hover:text-white disabled:opacity-50"
              >
                Actualizar
              </button>
            </div>
          </div>
          {!isAuthenticated && (
            <p className="rounded-lg bg-[#2d070b]/70 px-4 py-2 text-sm text-[#ffb3b3]">
              Inicia sesion para ver tus metricas reales.
            </p>
          )}
          {error && (
            <p className="rounded-lg bg-[#2d070b] px-4 py-2 text-sm text-[#ffb3b3]">
              No se pudieron cargar las estadisticas. Intenta nuevamente.
            </p>
          )}
        </header>

        <div className="grid gap-8 lg:grid-cols-[240px,1fr]">
          <aside className="space-y-4">
            <nav className="rounded-[28px] border border-white/10 bg-[#090a0f]/90 p-4 shadow-[0_12px_40px_rgba(0,0,0,0.45)]">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">Secciones</p>
              <ul className="mt-3 space-y-2 text-sm font-semibold">
                {NAV_LINKS.map((link) => (
                  <li key={link.id}>
                    <button
                      type="button"
                      className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 transition ${
                        link.isActive ? "bg-rojo-cereza400/20 text-white" : "text-white/60 hover:bg-white/5"
                      }`}
                    >
                      {link.label}
                      {link.isActive && (
                        <span className="text-[10px] uppercase tracking-[0.35em] text-rojo-cereza300">Activo</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          <div className="space-y-8">
            <section className="rounded-[32px] border border-white/10 bg-panel-gradient px-6 py-6 shadow-[0_25px_60px_rgba(0,0,0,0.35)]">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-white/60">Resumen rapido</p>
                  <h2 className="mt-2 text-xl font-semibold">Ultimos {range.days} dias</h2>
                  <p className="text-sm text-white/60">Estos son los indicadores principales del periodo seleccionado.</p>
                </div>
                {loading && <span className="text-xs text-white/60">Actualizando...</span>}
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard title="Visualizaciones" value={summary.totalViews} subtitle={`Ultimos ${range.days} dias`} />
                <MetricCard title="Contactos" value={summary.totalContacts} subtitle="Clicks a canales" />
                <MetricCard
                  title="Contactos/100 visitas"
                  value={summary.totalViews ? ((summary.totalContacts / summary.totalViews) * 100).toFixed(1) : "0.0"}
                  subtitle="Tasa de conversion"
                />
                <MetricCard title="Anuncios destacados" value={summary.topAds.length} subtitle="Con mejor rendimiento" />
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
              <ChartCard
                title="Tendencia de visualizaciones"
                runs={summary.viewSeries}
                contacts={summary.contactSeries}
                loading={loading}
              />
              <ContactsCard contactsByChannel={summary.contactsByChannel} loading={loading} />
            </section>

            <section className="rounded-[32px] border border-white/10 bg-panel-gradient px-6 py-6 shadow-[0_25px_60px_rgba(0,0,0,0.35)]">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Top anuncios</h2>
                  <p className="text-sm text-white/60">Ordenados por contactos generados en el periodo seleccionado.</p>
                </div>
              </div>
              <TopAdsTable ads={summary.topAds} loading={loading} />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
}) => (
  <div className="rounded-[28px] border border-white/10 bg-[#12040a]/80 px-5 py-4 shadow-[0_25px_60px_rgba(0,0,0,0.35)]">
    <p className="text-xs uppercase tracking-[0.3em] text-white/60">{title}</p>
    <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
    {subtitle && <p className="text-xs text-white/60">{subtitle}</p>}
  </div>
);

const ChartCard = ({
  title,
  runs,
  contacts,
  loading,
}: {
  title: string;
  runs: AnalyticsSummary["viewSeries"];
  contacts: AnalyticsSummary["contactSeries"];
  loading: boolean;
}) => {
  const maxValue = useMemo(() => {
    const values = [...runs.map((point) => point.value), ...contacts.map((point) => point.value)];
    return Math.max(10, ...values);
  }, [runs, contacts]);

  return (
    <div className="rounded-[32px] border border-white/10 bg-[#0d0508]/80 px-6 py-6 shadow-[0_25px_60px_rgba(0,0,0,0.35)]">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        {loading && <span className="text-xs text-white/60">Actualizando...</span>}
      </div>
      <div className="mt-5 h-64 w-full">
        <div className="flex h-full items-end gap-3">
          {runs.length === 0 ? (
            <p className="text-sm text-white/60">Sin datos en este periodo.</p>
          ) : (
            runs.map((point, index) => {
              const contact = contacts[index];
              const viewHeight = (point.value / maxValue) * 100;
              const contactHeight = contact ? (contact.value / maxValue) * 100 : 0;
              return (
                <div key={point.date} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex h-40 w-full items-end gap-1">
                    <div className="w-2 rounded-full bg-brand-gradient" style={{ height: `${viewHeight}%` }} />
                    <div className="w-2 rounded-full bg-white/50" style={{ height: `${contactHeight}%` }} />
                  </div>
                  <p className="text-xs text-white/50">{formatDateLabel(point.date)}</p>
                </div>
              );
            })
          )}
        </div>
      </div>
      <div className="mt-4 flex gap-4 text-xs text-white/60">
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-brand-gradient" />
          Visualizaciones
        </div>
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-white/60" />
          Contactos
        </div>
      </div>
    </div>
  );
};

const ContactsCard = ({
  contactsByChannel,
  loading,
}: {
  contactsByChannel: AnalyticsSummary["contactsByChannel"];
  loading: boolean;
}) => {
  const total = Object.values(contactsByChannel).reduce((acc, value) => acc + value, 0);

  return (
    <div className="rounded-[32px] border border-white/10 bg-[#12040a]/80 px-6 py-6 shadow-[0_25px_60px_rgba(0,0,0,0.35)]">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Canales de contacto</h2>
        {loading && <span className="text-xs text-white/60">Actualizando...</span>}
      </div>
      {total === 0 ? (
        <p className="mt-6 text-sm text-white/60">Aun no hay contactos registrados en este periodo.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {Object.entries(contactsByChannel).map(([channel, value]) => (
            <li key={channel} className="flex items-center gap-3">
              <span className="w-20 text-sm capitalize text-white/70">{channel}</span>
              <div className="flex-1 rounded-full bg-white/10">
                <div
                  className="rounded-full bg-brand-gradient px-3 py-1 text-xs font-semibold text-white"
                  style={{ width: `${(value / total) * 100}%` }}
                >
                  {value}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const TopAdsTable = ({
  ads,
  loading,
}: {
  ads: AnalyticsSummary["topAds"];
  loading: boolean;
}) => {
  if (!ads.length) {
    return (
      <p className="mt-6 text-sm text-white/60">
        {loading ? "Cargando top de anuncios..." : "Aun no hay anuncios con actividad en este periodo."}
      </p>
    );
  }

  return (
    <div className="mt-6 overflow-x-auto">
      <table className="w-full table-auto text-left text-sm text-white">
        <thead className="text-white/60">
          <tr>
            <th className="px-3 py-2 font-semibold">Titulo</th>
            <th className="px-3 py-2 font-semibold">Visualizaciones</th>
            <th className="px-3 py-2 font-semibold">Contactos</th>
            <th className="px-3 py-2 font-semibold">Conversion</th>
          </tr>
        </thead>
        <tbody>
          {ads.map((ad) => {
            const conversion = ad.views ? ((ad.contacts / ad.views) * 100).toFixed(1) : "0.0";
            return (
              <tr key={ad.adId} className="border-t border-white/10">
                <td className="px-3 py-3 text-white">{ad.title}</td>
                <td className="px-3 py-3 text-white/80">{ad.views}</td>
                <td className="px-3 py-3 text-white/80">{ad.contacts}</td>
                <td className="px-3 py-3 text-white/80">{conversion}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

function formatDateLabel(isoDate: string) {
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}`;
}
