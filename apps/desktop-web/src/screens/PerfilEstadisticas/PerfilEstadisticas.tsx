"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useStatsSummary } from "@/hooks/useStatsSummary";
import type { AnalyticsSummary } from "@anuncios/shared";
import { logEvent } from "@/services/eventLogger";

const RANGE_OPTIONS = [
  { id: "7", label: "7 días", days: 7 },
  { id: "30", label: "30 días", days: 30 },
];

const EMPTY_SUMMARY: AnalyticsSummary = {
  totalViews: 0,
  totalContacts: 0,
  viewSeries: [],
  contactSeries: [],
  contactsByChannel: {},
  topAds: [],
};

const buildMockSummary = (daysCount: number): AnalyticsSummary => {
  const today = new Date();
  const days = Array.from({ length: daysCount }).map((_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - ((daysCount - 1) - index));
    return date;
  });

  const pseudoRandom = (seed: number) => {
    const value = Math.sin(seed) * 10000;
    return value - Math.floor(value);
  };

  const viewSeries = days.map((date, index) => {
    const base = 120 + index * 12;
    const jitter = pseudoRandom((index + 1) * 37.7 + daysCount * 11.3);
    const factor = 0.9 + jitter * 0.2;
    return {
      date: date.toISOString().slice(0, 10),
      value: Math.max(20, Math.round(base * factor)),
    };
  });

  const contactSeries = days.map((date, index) => {
    const base = 10 + index * 2;
    const jitter = pseudoRandom((index + 1) * 19.1 + daysCount * 7.4);
    const factor = 0.9 + jitter * 0.2;
    return {
      date: date.toISOString().slice(0, 10),
      value: Math.max(2, Math.round(base * factor)),
    };
  });

  const totalViews = viewSeries.reduce((acc, point) => acc + point.value, 0);
  const totalContacts = contactSeries.reduce((acc, point) => acc + point.value, 0);
  const scale = Math.max(1, daysCount / 7);
  const channelJitter = (seed: number) => 0.9 + pseudoRandom(seed) * 0.2;

  return {
    totalViews,
    totalContacts,
    viewSeries,
    contactSeries,
    contactsByChannel: {
      whatsapp: Math.max(5, Math.round(54 * scale * channelJitter(daysCount * 2.3))),
      telegram: Math.max(3, Math.round(23 * scale * channelJitter(daysCount * 3.1))),
      phone: Math.max(2, Math.round(17 * scale * channelJitter(daysCount * 4.2))),
    },
    topAds: [
      {
        adId: "mock-1",
        title: "Masajes relajantes en Barcelona",
        views: Math.round(450 * scale * channelJitter(daysCount * 1.2)),
        contacts: Math.round(38 * scale * channelJitter(daysCount * 1.8)),
      },
      {
        adId: "mock-2",
        title: "Experiencias premium en Madrid",
        views: Math.round(380 * scale * channelJitter(daysCount * 2.6)),
        contacts: Math.round(31 * scale * channelJitter(daysCount * 2.9)),
      },
      {
        adId: "mock-3",
        title: "Spa y bienestar Valencia",
        views: Math.round(220 * scale * channelJitter(daysCount * 3.3)),
        contacts: Math.round(18 * scale * channelJitter(daysCount * 3.7)),
      },
    ],
  };
};

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
  const isSummaryEmpty =
    summary.viewSeries.length === 0 &&
    summary.contactSeries.length === 0 &&
    Object.keys(summary.contactsByChannel).length === 0 &&
    summary.topAds.length === 0;
  const effectiveSummary = isSummaryEmpty ? buildMockSummary(range.days) : summary;
  const isAuthenticated = Boolean(accessToken);

  const handleRangeChange = (option: (typeof RANGE_OPTIONS)[number]) => {
    setRange(option);
    logEvent("analytics:change-range", { days: option.days });
  };

  return (
    <div className="bg-black text-white">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-10 px-4 pb-24 sm:px-6 lg:px-10">
        <section className="rounded-[32px] border border-[#8e1522] bg-[#050102] px-6 py-6 shadow-[0_25px_60px_rgba(0,0,0,0.45)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {RANGE_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleRangeChange(option)}
                  className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] transition ${
                    option.id === range.id
                      ? "border-[#ff4d5d] bg-[#a30009] text-white shadow-[0_0_15px_rgba(255,77,93,0.4)]"
                      : "border-white/10 bg-black/40 text-white/60 hover:border-white/30 hover:text-white"
                  }`}
                >
                  {option.label}
                </button>
              ))}
              <button
                type="button"
                disabled={!isAuthenticated || loading}
                onClick={() => refresh()}
                className="rounded-full border border-white/10 bg-black/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/70 transition hover:border-white/30 hover:text-white disabled:opacity-50"
              >
                Actualizar
              </button>
            </div>
            {loading && <span className="text-xs text-white/60">Actualizando...</span>}
          </div>

          {!isAuthenticated && (
            <p className="mt-4 rounded-lg bg-[#2d070b]/70 px-4 py-2 text-sm text-[#ffb3b3]">
              Inicia sesión para ver tus métricas reales.
            </p>
          )}
          {error && (
            <p className="mt-4 rounded-lg bg-[#2d070b] px-4 py-2 text-sm text-[#ffb3b3]">
              No se pudieron cargar las estadísticas. Intenta nuevamente.
            </p>
          )}

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Visualizaciones"
              value={effectiveSummary.totalViews}
              subtitle={`Últimos ${range.days} días`}
              icon={
                <svg className="h-5 w-5 text-[#ff9aa2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              }
            />
            <MetricCard
              title="Contactos"
              value={effectiveSummary.totalContacts}
              subtitle="Clicks a canales"
              icon={
                <svg className="h-5 w-5 text-[#ff9aa2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              }
            />
            <MetricCard
              title="Contactos/100 visitas"
              value={
                effectiveSummary.totalViews
                  ? ((effectiveSummary.totalContacts / effectiveSummary.totalViews) * 100).toFixed(1)
                  : "0.0"
              }
              subtitle="Tasa de conversión"
              icon={
                <svg className="h-5 w-5 text-[#ff9aa2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              }
            />
            <MetricCard
              title="Anuncios destacados"
              value={effectiveSummary.topAds.length}
              subtitle="Con mejor rendimiento"
              icon={
                <svg className="h-5 w-5 text-[#ff9aa2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              }
            />
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[2fr,1fr]">
            <ChartCard
              title="Tendencia de visualizaciones"
              runs={effectiveSummary.viewSeries}
              contacts={effectiveSummary.contactSeries}
              loading={loading}
            />
            <ContactsCard contactsByChannel={effectiveSummary.contactsByChannel} loading={loading} />
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Top anuncios</h2>
                <p className="text-sm text-white/60">
                  Ordenados por contactos generados en el periodo seleccionado.
                </p>
              </div>
            </div>
            <TopAdsTable ads={effectiveSummary.topAds} loading={loading} />
          </div>
        </section>
      </div>
    </div>
  );
};

const MetricCard = ({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
}) => (
  <div className="group relative overflow-hidden rounded-[24px] border border-[#4a0c14] bg-[#1a0507] px-5 py-4 shadow-[0_20px_40px_rgba(0,0,0,0.4)] transition hover:border-[#8e1522]/60 hover:shadow-[0_20px_50px_rgba(142,21,34,0.15)]">
    <div className="relative z-10">
      <div className="flex items-center gap-2">
        {icon && <div className="rounded-full bg-[#3a0505] p-1.5">{icon}</div>}
        <p className="text-xs uppercase tracking-[0.3em] text-[#ff9aa2]">{title}</p>
      </div>
      <p className="mt-3 text-3xl font-bold text-white">{value}</p>
      {subtitle && <p className="mt-1 text-xs text-white/50">{subtitle}</p>}
    </div>
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
  const displaySeries = useMemo(() => {
    if (runs.length <= 10) {
      return { runs, contacts };
    }
    const maxPoints = 10;
    const step = (runs.length - 1) / (maxPoints - 1);
    const indexes = Array.from({ length: maxPoints }, (_, index) => Math.round(index * step)).filter(
      (value, index, arr) => index === 0 || value > arr[index - 1],
    );
    const sampledRuns = indexes.map((idx) => runs[idx]);
    const sampledContacts = indexes.map((idx) => contacts[idx] ?? { date: runs[idx].date, value: 0 });
    return { runs: sampledRuns, contacts: sampledContacts };
  }, [runs, contacts]);

  const maxValue = useMemo(() => {
    const values = [
      ...displaySeries.runs.map((point) => point.value),
      ...displaySeries.contacts.map((point) => point.value),
    ];
    return Math.max(10, ...values);
  }, [displaySeries]);

  return (
    <div className="rounded-[24px] border border-[#4a0c14] bg-[#140306] px-6 py-6 shadow-[0_20px_50px_rgba(0,0,0,0.35)]">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        {loading && <span className="text-xs text-white/60">Actualizando...</span>}
      </div>
      <div className="mt-5 h-64 w-full">
        <div className="flex h-full items-end gap-3">
          {displaySeries.runs.length === 0 ? (
            <p className="text-sm text-white/60">Sin datos en este periodo.</p>
          ) : (
            displaySeries.runs.map((point, index) => {
              const contact = displaySeries.contacts[index];
              const viewHeight = (point.value / maxValue) * 100;
              const contactHeight = contact ? (contact.value / maxValue) * 100 : 0;
              return (
                <div key={point.date} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex h-40 w-full items-end gap-1.5 px-1">
                    <div
                      className="w-full rounded-t-lg bg-brand-gradient opacity-90 transition-all hover:opacity-100"
                      style={{ height: `${viewHeight}%` }}
                    />
                    <div
                      className="w-full rounded-t-lg bg-white/30 transition-all hover:bg-white/50"
                      style={{ height: `${contactHeight}%` }}
                    />
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
    <div className="rounded-[24px] border border-[#4a0c14] bg-[#140306] px-6 py-6 shadow-[0_20px_50px_rgba(0,0,0,0.35)]">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Canales de contacto</h2>
        {loading && <span className="text-xs text-white/60">Actualizando...</span>}
      </div>
      {total === 0 ? (
        <p className="mt-6 text-sm text-white/60">Aún no hay contactos registrados en este periodo.</p>
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

const TopAdsTable = ({ ads, loading }: { ads: AnalyticsSummary["topAds"]; loading: boolean }) => {
  if (!ads.length) {
    return (
      <p className="mt-6 text-sm text-white/60">
        {loading
          ? "Cargando top de anuncios..."
          : "Aún no hay anuncios con actividad en este periodo."}
      </p>
    );
  }

  return (
    <div className="mt-6 overflow-x-auto">
      <table className="w-full table-auto text-left text-sm text-white">
        <thead className="text-[#ff9aa2]">
          <tr>
            <th className="px-3 py-2 font-semibold uppercase tracking-widest text-xs">Título</th>
            <th className="px-3 py-2 font-semibold uppercase tracking-widest text-xs">Vistas</th>
            <th className="px-3 py-2 font-semibold uppercase tracking-widest text-xs">Contactos</th>
            <th className="px-3 py-2 font-semibold uppercase tracking-widest text-xs">Conv.</th>
          </tr>
        </thead>
        <tbody>
          {ads.map((ad) => {
            const conversion = ad.views ? ((ad.contacts / ad.views) * 100).toFixed(1) : "0.0";
            return (
              <tr key={ad.adId} className="border-t border-[#8e1522]/20 transition hover:bg-[#2a060a]">
                <td className="px-3 py-3 text-white font-medium">{ad.title}</td>
                <td className="px-3 py-3 text-white/70">{ad.views}</td>
                <td className="px-3 py-3 text-white/70">{ad.contacts}</td>
                <td className="px-3 py-3 text-white/70">{conversion}%</td>
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
