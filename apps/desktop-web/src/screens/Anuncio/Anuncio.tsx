
"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { SERVICE_FILTER_OPTIONS, type ContactChannels } from "@anuncios/shared";
import type { Ad } from "@/lib/ads";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { logEvent } from "@/services/eventLogger";
import { useAuth } from "@/hooks/useAuth";
import { commentService, type CommentItem } from "@/services/comment.service";
import { isApiConfigured } from "@/services/httpClient";

type Props = {
  ad: Ad;
  isMock?: boolean;
};

const FALLBACK_IMAGE = "https://res.cloudinary.com/dqhxthtby/image/upload/v1762882388/marina-hero.svg";
const FALLBACK_SERVICES = ["Experiencias privadas", "Viajes", "Eventos", "Masajes", "Acompañamiento premium"];
const FALLBACK_TAGS = ["Premium", "Discreta", "Disponible 24/7"];
const SAMPLE_COMMENTS: CommentItem[] = [
  {
    id: "c-1",
    author: { id: "anon-1", name: "Usuario anónimo" },
    text: "Hola amor, ¿cómo estás?",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "c-2",
    author: { id: "anon-2", name: "Invitado" },
    text: "¿Hacemos videollamada?",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "c-3",
    author: { id: "anon-3", name: "Alex" },
    text: "¿Podemos ver fechas?",
    createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
  },
];

export const Anuncio = ({ ad, isMock = false }: Props) => {
  const { isAuthenticated, accessToken } = useAuth();
  const gallery = useMemo(() => buildGallery(ad), [ad]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentsTotal, setCommentsTotal] = useState(0);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const topSentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [ad.id]);

  useEffect(() => {
    logEvent("ad:view", { adId: ad.id, isMock });
  }, [ad.id, isMock]);

  useEffect(() => {
    const sentinel = topSentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsAtTop(entry.isIntersecting);
      },
      { threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const canUseComments = isApiConfigured() && isValidObjectId(ad.id);

  useEffect(() => {
    let mounted = true;
    if (!canUseComments) {
      setComments(SAMPLE_COMMENTS);
      setCommentsTotal(SAMPLE_COMMENTS.length);
      return undefined;
    }
    setCommentsLoading(true);
    setCommentsError(null);
    commentService
      .list(ad.id, { page: 1, limit: 20 })
      .then((response) => {
        if (!mounted) return;
        setComments(response.items);
        setCommentsTotal(response.total);
      })
      .catch((error) => {
        if (!mounted) return;
        setCommentsError(error instanceof Error ? error.message : "No se pudieron cargar los comentarios.");
      })
      .finally(() => {
        if (mounted) setCommentsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [ad.id, canUseComments]);

  const services = ad.services?.length ? ad.services : FALLBACK_SERVICES;
  const tags = ad.tags?.length ? ad.tags : FALLBACK_TAGS;
  const serviceLabelMap = useMemo(
    () => Object.fromEntries(SERVICE_FILTER_OPTIONS.map((option) => [option.id, option.label])),
    [],
  );
  const serviceLabels = services.map((service) => serviceLabelMap[service] ?? service);
  const tagLabels = tags.map((tag) => serviceLabelMap[tag] ?? tag);
  const priceRange = formatPriceRange(ad.priceFrom, ad.priceTo);
  const lastUpdate = formatUpdatedAt(ad.updatedAt);
  const profileLabel = formatProfileLabel(ad.metadata?.gender?.sex, ad.metadata?.gender?.identity, ad.profileType);
  const planLabel = formatPlan(ad.plan);
  const activeImage = gallery[activeImageIndex];
  const metadata = ad.metadata ?? null;
  const contactActions = useMemo(() => buildContactActions(metadata?.contacts), [metadata?.contacts]);
  const availability = metadata?.availability ?? [];
  const locationInfo = metadata?.location;
  const attributes = metadata?.attributes ?? {};
  const isOwnerView = Boolean(attributes.ownerView);
  const hasMultipleImages = gallery.length > 1;
  const showMockBadge = Boolean(metadata?.seed?.isMock) || isMock;
  const commentsToShow = comments.length ? comments : canUseComments ? [] : SAMPLE_COMMENTS;
  const commentCount = canUseComments ? commentsTotal : commentsToShow.length;

  const handleCommentSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isAuthenticated || !accessToken || !canUseComments) return;
    const trimmed = commentText.trim();
    if (trimmed.length < 2) {
      setCommentsError("Escribe un comentario más largo.");
      return;
    }
    setIsSubmitting(true);
    setCommentsError(null);
    try {
      const created = await commentService.create(ad.id, trimmed, accessToken);
      setComments((prev) => [created, ...prev]);
      setCommentsTotal((prev) => prev + 1);
      setCommentText("");
    } catch (error) {
      setCommentsError(error instanceof Error ? error.message : "No se pudo publicar el comentario.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const showPreviousImage = () => {
    if (!hasMultipleImages) return;
    setActiveImageIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
  };
  const showNextImage = () => {
    if (!hasMultipleImages) return;
    setActiveImageIndex((prev) => (prev + 1) % gallery.length);
  };

  const infoItems = [
    { label: "Plan", value: planLabel },
    { label: "Perfil", value: profileLabel ?? "Sin perfil" },
    { label: "Ciudad", value: locationInfo?.city ?? ad.city ?? "Sin ciudad" },
    { label: "Actualizado", value: lastUpdate },
    { label: "ID", value: ad.id },
    { label: "Tarifas", value: priceRange ?? "No disponible" },
  ];

  return (
    <div className="bg-black text-white">
      <div className="flex min-h-screen w-full flex-col">
        <SiteHeader logoHref="/feed" />

        <main
          className={`w-full flex-1 transition-[padding-top] duration-200 ease-out ${
            isAtTop ? "pt-[72px] md:pt-[168px]" : ""
          }`}
        >
          <div ref={topSentinelRef} aria-hidden="true" />
          <div className="mx-auto w-full max-w-[1180px] px-4 pb-16 pt-10 sm:px-6 lg:px-8">
            <div className="mb-8 flex flex-wrap items-center gap-3 text-sm text-white/70">
              <Link href="/feed" className="inline-flex items-center rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em]">
                Inicio
              </Link>
              <span>/</span>
              <span className="text-white">{ad.title}</span>
            </div>

            <section className="grid gap-8 lg:grid-cols-[360px,1fr]">
              <div className="rounded-[32px] border border-white/10 bg-[#040507] p-4 shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
                <div className="overflow-hidden rounded-[24px]" style={{ aspectRatio: "3 / 4" }}>
                  <img
                    src={activeImage.url}
                    alt={ad.title}
                    className="h-full w-full object-cover"
                    loading="eager"
                    decoding="async"
                  />
                </div>
                {hasMultipleImages && (
                  <div className="mt-3 flex items-center justify-between text-sm text-white/70">
                    <button type="button" onClick={showPreviousImage} className="rounded-full border border-white/20 px-3 py-1">
                      Anterior
                    </button>
                    <p>
                      {activeImageIndex + 1} / {gallery.length}
                    </p>
                    <button type="button" onClick={showNextImage} className="rounded-full border border-white/20 px-3 py-1">
                      Siguiente
                    </button>
                  </div>
                )}

                {contactActions.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-3">
                    {contactActions.map((action) => (
                      <a
                        key={`hero-contact-${action.type}`}
                        href={action.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => logEvent("ad:contact", { adId: ad.id, channel: action.type })}
                        className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/5 text-xs font-semibold uppercase tracking-[0.3em] text-white/80 transition hover:border-white/50"
                      >
                        {renderContactIcon(action.type)}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-[32px] border border-white/10 bg-[#08090d]/95 p-6 shadow-[0_40px_90px_rgba(0,0,0,0.55)]">
                <div className="flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">Anfitriona</p>
                    <div className="flex flex-wrap items-center gap-3">
                      <h1 className="text-3xl font-semibold text-white">{ad.title}</h1>
                      {showMockBadge && (
                        <span className="rounded-full border border-white/20 px-3 py-1 text-xs uppercase tracking-[0.35em] text-white/70">
                          Perfil de prueba
                        </span>
                      )}
                    </div>
                    <p className="text-base text-white/70">
      {locationInfo?.city ?? ad.city ?? "Sin ciudad"}
      {ad.age ? ` / ${ad.age} años` : ""}
                    </p>
                  </div>
                  {isOwnerView && (
                    <Link
                      href="/perfil/mi-anuncio"
                      className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-white/80 transition hover:text-white"
                    >
                      Editar anuncio
                    </Link>
                  )}
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {infoItems.map((item) => (
                    <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.3em] text-white/50">{item.label}</p>
                      <p className="text-base text-white">{item.value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 space-y-3">
                  <h2 className="text-lg font-semibold">Sobre mi</h2>
                  <p className="text-sm text-white/70">
                    {ad.description?.trim().length
                      ? ad.description
                      : "Soy una anfitriona apasionada y discreta, lista para crear experiencias premium a tu medida."}
                  </p>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  {tagLabels.map((tag) => (
                    <span
                      key={`${ad.id}-tag-${tag}`}
                      className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white"
                    >
                      #{tag.replace(/^#/, "")}
                    </span>
                  ))}
                </div>
              </div>
            </section>

            <section className="mt-12 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">Galería</p>
                  <h2 className="text-2xl font-semibold">Momentos destacados</h2>
                </div>
                {hasMultipleImages && (
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={showPreviousImage}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white"
                    >
                      &lt;
                    </button>
                    <button
                      type="button"
                      onClick={showNextImage}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white"
                    >
                      &gt;
                    </button>
                  </div>
                )}
              </div>

              <div className="flex gap-4 overflow-x-auto rounded-[32px] border border-white/10 bg-[#090a0f]/70 p-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {isOwnerView && (
                  <button
                    type="button"
                    className="flex h-48 w-48 flex-none items-center justify-center rounded-[24px] border border-dashed border-white/30 bg-white/5 text-sm font-semibold text-white/70"
                  >
                    Subir a galeria
                  </button>
                )}
                {gallery.map((image, index) => (
                  <button
                    type="button"
                    key={image.id}
                    onClick={() => setActiveImageIndex(index)}
                    className={`h-48 w-48 flex-none overflow-hidden rounded-[24px] border ${
                      index === activeImageIndex ? "border-rojo-cereza400" : "border-white/10"
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={`${ad.title} ${index + 1}`}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </button>
                ))}
              </div>
            </section>

            <section className="mt-12 grid gap-6 lg:grid-cols-2">
              <article className="rounded-[32px] border border-white/10 bg-[#08090d]/80 p-6 shadow-[0_25px_60px_rgba(0,0,0,0.45)]">
                <div className="flex items-center justify-between">
                  <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">Disponibilidad
                  </p>
                    <h2 className="text-xl font-semibold">Agenda semanal</h2>
                  </div>
                </div>
                {availability.length ? (
                  <ul className="mt-6 space-y-2 text-sm text-white/80">
                    {availability.map((slot, index) => (
                      <li
                        key={`${slot.day}-${index}`}
                        className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-4 py-2"
                      >
                        <span className="capitalize text-white/70">{formatDay(slot.day)}</span>
                        <span className="font-semibold text-white">
                          {formatAvailabilitySlot(slot)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-6 text-sm text-white/60">No se ha indicado un horario especifico.</p>
                )}
              </article>

              <article className="rounded-[32px] border border-white/10 bg-[#08090d]/80 p-6 shadow-[0_25px_60px_rgba(0,0,0,0.45)]">
                <div className="flex items-center justify-between">
                  <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">Servicios
                  </p>
                    <h2 className="text-xl font-semibold">Experiencias</h2>
                  </div>
                  <span className="text-sm text-white/60">{services.length} opciones</span>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  {serviceLabels.map((service) => (
                    <span
                      key={`${ad.id}-service-${service}`}
                      className="rounded-full border border-rojo-cereza400/40 bg-rojo-cereza400/10 px-4 py-1 text-sm text-white"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </article>
            </section>

            <section className="mt-12 rounded-[32px] border border-white/10 bg-[#08090d]/80 p-6 shadow-[0_25px_60px_rgba(0,0,0,0.45)]">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">Comentarios
                </p>
                <h2 className="text-xl font-semibold">{commentCount} Comentarios</h2>
              </div>
              <form className="mt-6 space-y-3" onSubmit={handleCommentSubmit}>
                <textarea
                  placeholder={isAuthenticated ? "Dejar un comentario" : "Inicia sesión para comentar"}
                  className="w-full rounded-[18px] border border-white/15 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-rojo-cereza400/70"
                  rows={3}
                  value={commentText}
                  onChange={(event) => setCommentText(event.target.value)}
                  disabled={!isAuthenticated || !canUseComments || isSubmitting}
                />
                <button
                  type="submit"
                  disabled={!isAuthenticated || !commentText.trim().length || !canUseComments || isSubmitting}
                  className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(119deg,rgba(135,0,5,1)_12%,rgba(172,7,13,1)_45%,rgba(208,29,35,1)_75%,rgba(236,76,81,1)_100%)] px-6 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white disabled:opacity-50"
                >
                  {isSubmitting ? "Enviando..." : "Enviar"}
                </button>
              </form>
              {!isAuthenticated && (
                <p className="mt-3 text-xs text-white/50">Debes iniciar sesión para comentar.</p>
              )}
              {commentsError && (
                <p className="mt-3 text-xs text-[#ffb3b3]">{commentsError}</p>
              )}
              <div className="mt-6 space-y-4 text-sm">
                {commentsLoading ? (
                  <p className="text-sm text-white/60">Cargando comentarios...</p>
                ) : commentsToShow.length ? (
                  commentsToShow.map((comment) => (
                    <div key={comment.id} className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
                      <div className="flex items-center justify-between text-xs text-white/60">
                        <span>{comment.author.name}</span>
                        <span>{formatRelativeTime(comment.createdAt)}</span>
                      </div>
                      <p className="mt-2 text-white/80">{comment.text}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-white/60">Aún no hay comentarios.</p>
                )}
              </div>
              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-white/50">
                {Array.from({ length: 6 }).map((_, index) => (
                  <span
                    key={`dot-${index}`}
                    className={`h-2 w-2 rounded-full ${index === 0 ? "bg-white" : "bg-white/30"}`}
                  />
                ))}
              </div>
            </section>
          </div>
        </main>

        <SiteFooter className="mt-10" />
      </div>
    </div>
  );
};

function buildGallery(ad: Ad) {
  if (ad.images && ad.images.length) {
    return ad.images.map((image, index) => ({
      id: image.id ?? `${ad.id}-image-${index}`,
      url: image.url ?? FALLBACK_IMAGE,
    }));
  }
  return [{ id: `${ad.id}-fallback`, url: FALLBACK_IMAGE }];
}

function formatPriceRange(from?: number, to?: number) {
  if (typeof from === "number" && typeof to === "number") {
    return `Tarifas entre ${from} EUR y ${to} EUR`;
  }
  if (typeof from === "number") {
    return `Desde ${from} EUR`;
  }
  if (typeof to === "number") {
    return `Hasta ${to} EUR`;
  }
  return null;
}

function formatUpdatedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sin datos";
  return date.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
}

function formatProfileLabel(sex?: string | null, identity?: string | null, fallbackType?: string | null) {
  if (sex === "female" && identity === "cis") return "Chicas";
  if (sex === "female" && identity === "trans") return "Chicas trans";
  if (sex === "male" && identity === "cis") return "Chicos";
  if (sex === "male" && identity === "trans") return "Chicos trans";
  if (fallbackType === "trans") return "Chicas trans";
  if (fallbackType) return "Chicas";
  return null;
}

function formatPlan(plan?: string | null) {
  if (plan === "premium") return "Plan premium";
  if (plan === "featured") return "Plan destacado";
  return "Plan básico";
}

type ContactAction = {
  type: keyof ContactChannels;
  label: string;
  display: string;
  href: string;
};

function buildContactActions(contacts?: ContactChannels | null): ContactAction[] {
  if (!contacts) return [];
  const actions: ContactAction[] = [];

  if (contacts.whatsapp) {
    const digits = contacts.whatsapp.replace(/[^0-9]/g, "");
    actions.push({
      type: "whatsapp",
      label: "WhatsApp",
      display: contacts.whatsapp,
      href: `https://wa.me/${digits}`,
    });
  }

  if (contacts.telegram) {
    const handle = contacts.telegram.startsWith("@") ? contacts.telegram.slice(1) : contacts.telegram;
    actions.push({
      type: "telegram",
      label: "Telegram",
      display: contacts.telegram,
      href: `https://t.me/${handle}`,
    });
  }

  if (contacts.phone) {
    actions.push({
      type: "phone",
      label: "Teléfono",
      display: contacts.phone,
      href: `tel:${contacts.phone.replace(/\s+/g, "")}`,
    });
  }

  if (contacts.email) {
    actions.push({
      type: "email",
      label: "Email",
      display: contacts.email,
      href: `mailto:${contacts.email}`,
    });
  }

  if (contacts.website) {
    actions.push({
      type: "website",
      label: "Sitio web",
      display: contacts.website.replace(/^https?:\/\//, ""),
      href: contacts.website,
    });
  }

  return actions;
}

function renderContactIcon(type: ContactAction["type"]) {
  const map: Record<ContactAction["type"], string> = {
    whatsapp: "WA",
    telegram: "TG",
    phone: "TEL",
    email: "@",
    website: "WWW",
  };
  return map[type] ?? "";
}

function formatDay(day: string) {
  const labels: Record<string, string> = {
    monday: "Lunes",
    tuesday: "Martes",
    wednesday: "Miércoles",
    thursday: "Jueves",
    friday: "Viernes",
    saturday: "Sábado",
    sunday: "Domingo",
  };
  return labels[day] ?? day;
}

function formatAvailabilitySlot(slot: {
  status: string;
  from?: string;
  to?: string;
  ranges?: Array<{ from: string; to: string }>;
}) {
  if (slot.status === "all_day") return "Todo el día";
  if (slot.status === "unavailable") return "No disponible";

  const ranges = Array.isArray(slot.ranges) ? slot.ranges : [];
  if (ranges.length) {
    return ranges.map((range) => `${range.from} - ${range.to}`).join(" / ");
  }

  return `${slot.from ?? "10:00"} - ${slot.to ?? "18:00"}`;
}

function isValidObjectId(value: string) {
  return /^[0-9a-fA-F]{24}$/.test(value);
}

function formatRelativeTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Reciente";
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 60) return `Hace ${Math.max(1, minutes)}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours}h`;
  const days = Math.floor(hours / 24);
  return `Hace ${days}d`;
}

