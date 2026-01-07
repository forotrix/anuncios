
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ProfileType } from "@anuncios/shared";
import { useAuth } from "@/hooks/useAuth";
import { mediaService, type UploadSignaturePayload } from "@/services/media.service";
import {
  AVAILABILITY_STATUS_OPTIONS,
  DEFAULT_SERVICE_OPTIONS,
  REGION_OPTIONS,
  WEEK_DAY_OPTIONS,
} from "./constants";
import {
  AvatarMedia,
  type SelectableTag,
  type ServiceItem,
  useMiAnuncioForm,
} from "./useMiAnuncioForm";

type CloudinaryUploadWidgetResult = {
  event: string;
  info?: {
    secure_url?: string;
    public_id?: string;
  };
};

type CloudinaryUploadWidget = {
  open: () => void;
  close: () => void;
  destroy: () => void;
};

type CloudinaryUploadWidgetOptions = {
  cloudName: string;
  apiKey: string;
  folder: string;
  uploadSignature: (callback: (signature: string) => void, paramsToSign: Record<string, unknown>) => void;
  multiple?: boolean;
  cropping?: boolean;
  showSkipCropButton?: boolean;
  sources?: string[];
  clientAllowedFormats?: string[];
  maxImageFileSize?: number;
};

type CloudinaryGlobal = Window & {
  cloudinary?: {
    createUploadWidget: (
      options: CloudinaryUploadWidgetOptions,
      callback: (error: unknown, result: CloudinaryUploadWidgetResult) => void,
    ) => CloudinaryUploadWidget;
  };
};

const CLOUDINARY_WIDGET_URL = "https://widget.cloudinary.com/v2.0/global/all.js";
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
const CLOUDINARY_UPLOAD_BASE_FOLDER = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_FOLDER ?? "anuncios/uploads";
const CLOUDINARY_MAX_FILE_SIZE =
  typeof process.env.NEXT_PUBLIC_CLOUDINARY_MAX_FILE_SIZE === "string"
    ? Number(process.env.NEXT_PUBLIC_CLOUDINARY_MAX_FILE_SIZE)
    : 5_242_880;

const isBrowser = () => typeof window !== "undefined";

const cloudinaryInstance = () =>
  (typeof window === "undefined" ? undefined : (window as CloudinaryGlobal).cloudinary);

const NAV_LINKS = [
  { id: "mi-anuncio", label: "Mi anuncio", isActive: true },
  { id: "cuenta", label: "Cuenta", isActive: false },
  { id: "suscripciones", label: "Suscripciones", isActive: false },
  { id: "estadisticas", label: "Estadisticas", isActive: false },
  { id: "ver-anuncio", label: "Ver anuncio", isActive: false },
];

export const PerfilMiAnuncio = () => {
  const { user, accessToken } = useAuth();
  const form = useMiAnuncioForm(accessToken);
  const {
    draft,
    loading,
    saving,
    publishState,
    error,
    meta,
    updateField,
    updateContacts,
    toggleService,
    addService,
    removeService,
    toggleDataTag,
    toggleSocialTag,
    updateAvailability,
    addAvailabilityRange,
    removeAvailabilityRange,
    updateAvailabilityRange,
    setAvatar,
    saveDraft,
    publishAd,
    unpublishAd,
  } = form;
  const [newService, setNewService] = useState("");
  const avatarUploader = useAvatarWidget({
    accessToken,
    userId: user?.id,
    onAvatarChange: setAvatar,
  });

  const canPublish = Boolean(draft.adId);
  const headline = draft.profileName || user?.name || "Tu anuncio";
  const statusMessage = useMemo(() => {
    if (loading) return "Cargando tu anuncio...";
    if (saving) return "Guardando cambios...";
    if (publishState === "publishing") return "Publicando anuncio...";
    if (publishState === "unpublishing") return "Actualizando estado del anuncio...";
    if (draft.status === "published") return "Tu anuncio esta publicado y visible en el feed.";
    return "Tu anuncio esta en borrador. Publicalo cuando estes listo.";
  }, [loading, saving, publishState, draft.status]);

  const handleAddService = () => {
    if (!newService.trim()) return;
    addService(newService.trim());
    setNewService("");
  };

  const handleSave = async () => {
    await saveDraft();
  };

  const handlePublish = async () => {
    if (!canPublish) return;
    await publishAd();
  };

  const handleUnpublish = async () => {
    if (!canPublish) return;
    await unpublishAd();
  };

  const cardClass = "rounded-[24px] border border-[#8e1522] bg-[#0f0306] p-5 shadow-[0_25px_80px_rgba(0,0,0,0.55)]";
  const labelClass = "text-xs font-semibold uppercase tracking-[0.35em] text-[#ff9aa2]";

  const getSlotRanges = (slot: { status: string; from?: string; to?: string; ranges?: Array<{ from: string; to: string }> }) => {
    if (slot.status !== "custom") return [];
    if (Array.isArray(slot.ranges) && slot.ranges.length) return slot.ranges;
    if (slot.from && slot.to) return [{ from: slot.from, to: slot.to }];
    return [{ from: "10:00", to: "18:00" }];
  };

  const validateRanges = (ranges: Array<{ from: string; to: string }>) => {
    const parsed = ranges
      .map((range) => ({
        ...range,
        start: Number(range.from.replace(":", "")),
        end: Number(range.to.replace(":", "")),
      }))
      .filter((range) => Number.isFinite(range.start) && Number.isFinite(range.end))
      .sort((a, b) => a.start - b.start || a.end - b.end);

    for (const range of parsed) {
      if (range.start >= range.end) return "Cada tramo debe tener inicio < fin.";
    }
    for (let i = 1; i < parsed.length; i += 1) {
      if (parsed[i].start < parsed[i - 1].end) return "Los tramos no pueden solaparse.";
    }
    return null;
  };

  return (
    <div className="bg-[#020103] text-white">
      <div className="mx-auto w-full max-w-[1200px] px-4 pb-20 pt-12 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row">
          <aside className="w-full lg:w-60">
            <div className="rounded-[28px] border border-[#460f16] bg-[#140103] p-4 shadow-[0_15px_40px_rgba(0,0,0,0.6)]">
              <p className={`${labelClass} mb-4`}>Secciones</p>
              <ul className="space-y-2 text-sm font-semibold">
                {NAV_LINKS.map((link) => (
                  <li key={link.id}>
                    <button
                      type="button"
                      className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 transition ${
                        link.isActive ? "bg-[#b12130]/50 text-white" : "text-white/60 hover:bg-white/5"
                      }`}
                    >
                      {link.label}
                      {link.isActive && (
                        <span className="text-[10px] uppercase tracking-[0.4em] text-[#ff9aa2]">Activo</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <div className="flex-1 space-y-6">
            <section className={`${cardClass} flex flex-col gap-6 lg:flex-row lg:items-center`}>
              <div className="flex flex-col items-center gap-4 text-center lg:w-[240px]">
                <AvatarSection
                  avatar={draft.avatar}
                  isReady={avatarUploader.isReady}
                  isUploading={avatarUploader.isUploading}
                  error={avatarUploader.error}
                  onOpen={avatarUploader.open}
                />
                <div className="w-full rounded-[18px] border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
                  Servicios activos: {meta.activeServices}
                </div>
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <p className={labelClass}>Resumen</p>
                  <h1 className="text-3xl font-semibold">{headline}</h1>
                  <p className="text-sm text-white/70">{statusMessage}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving || loading}
                    className="rounded-full bg-[linear-gradient(119deg,rgba(135,0,5,1)_12%,rgba(172,7,13,1)_45%,rgba(208,29,35,1)_75%,rgba(236,76,81,1)_100%)] px-6 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-white shadow-shadow-g disabled:opacity-60"
                  >
                    {saving ? "Guardando..." : "Guardar"}
                  </button>
                  {draft.status === "published" ? (
                    <button
                      type="button"
                      onClick={handleUnpublish}
                      disabled={!canPublish || publishState !== "idle"}
                      className="rounded-full border border-white/30 px-6 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-white/80 transition hover:text-white disabled:opacity-50"
                    >
                      {publishState === "unpublishing" ? "Actualizando..." : "Mover a borrador"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handlePublish}
                      disabled={!canPublish || publishState !== "idle"}
                      className="rounded-full border border-white/30 px-6 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-white/80 transition hover:text-white disabled:opacity-50"
                    >
                      {publishState === "publishing" ? "Publicando..." : "Publicar anuncio"}
                    </button>
                  )}
                </div>
                {!draft.adId && (
                  <p className="text-xs text-white/60">Guarda tu anuncio para habilitar la publicacion.</p>
                )}
                {error && (
                  <p className="rounded-2xl border border-[#ff6161]/40 bg-[#360508] px-4 py-2 text-sm text-[#ffb3b3]">
                    {error.message || "No se pudo guardar el anuncio, intenta nuevamente."}
                  </p>
                )}
              </div>
            </section>

            <section className="grid gap-4 lg:grid-cols-2">
              <article className={cardClass}>
                <CardHeader label="Contacto" title="Canales disponibles" />
                <div className="mt-4 grid gap-4">
                  <Field
                    label="WhatsApp"
                    value={draft.contacts.whatsapp ?? ""}
                    onChange={(value) => updateContacts("whatsapp", value)}
                    placeholder="+34 600 000 000"
                  />
                  <Field
                    label="Telegram"
                    value={draft.contacts.telegram ?? ""}
                    onChange={(value) => updateContacts("telegram", value)}
                    placeholder="@usuario"
                  />
                  <Field
                    label="Telefono"
                    value={draft.contacts.phone ?? ""}
                    onChange={(value) => updateContacts("phone", value)}
                    placeholder="+34 600 000 001"
                  />
                </div>
              </article>

              <article className={cardClass}>
                <CardHeader label="Ubicacion" title="Zona de trabajo" />
                <div className="mt-4 space-y-4">
                  <Field
                    label="Ciudad"
                    value={draft.city}
                    onChange={(value) => updateField("city", value)}
                    placeholder="Barcelona"
                  />
                  <div>
                    <FormLabel text="Region" />
                    <select
                      value={draft.region}
                      onChange={(event) => updateField("region", event.target.value)}
                      className={INPUT_CLASS}
                    >
                      <option value="">Selecciona region</option>
                      {REGION_OPTIONS.map((region) => (
                        <option key={region} value={region}>
                          {region}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Field
                    label="Zona/Barrio"
                    value={draft.zone}
                    onChange={(value) => updateField("zone", value)}
                    placeholder="Ej. Eixample"
                  />
                </div>
              </article>
            </section>

            <section className={cardClass}>
              <CardHeader label="Sobre mi" title="Presentacion" />
              <textarea
                value={draft.description}
                onChange={(event) => updateField("description", event.target.value)}
                rows={4}
                className={`${INPUT_CLASS} resize-none`}
                placeholder="Describe tu estilo, servicios y experiencia..."
              />
            </section>

            <section className={cardClass}>
              <CardHeader label="Datos" title="Informacion basica" />
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <Field
                  label="Nombre o titulo"
                  value={draft.profileName}
                  onChange={(value) => updateField("profileName", value)}
                  placeholder="Ej. Marina en Barcelona"
                />
                <Field
                  label="Edad"
                  value={draft.age ? String(draft.age) : ""}
                  onChange={(value) => updateField("age", value ? Number(value) : undefined)}
                  placeholder="25"
                  type="number"
                />
                <div>
                  <FormLabel text="Tipo de perfil" />
                  <select
                    value={draft.profileType}
                    onChange={(event) => updateField("profileType", event.target.value as ProfileType)}
                    className={INPUT_CLASS}
                  >
                    <option value="chicas">Chicas</option>
                    <option value="trans">Trans</option>
                  </select>
                </div>
              </div>
            </section>

            <section className={cardClass}>
              <CardHeader label="Servicios" title="Oferta activa" />
              <div className="mt-4 space-y-4">
                <ServiceChips services={draft.services} onToggle={toggleService} onRemove={removeService} />
                <div className="flex flex-col gap-3 md:flex-row">
                  <input
                    value={newService}
                    onChange={(event) => setNewService(event.target.value)}
                    className={`${INPUT_CLASS} flex-1`}
                    placeholder="Nuevo servicio"
                  />
                  <button
                    type="button"
                    onClick={handleAddService}
                    className="rounded-full border border-white/30 px-6 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-white/80 transition hover:text-white"
                  >
                    Agregar
                  </button>
                </div>
              </div>
            </section>

            <section className={cardClass}>
              <CardHeader label="Tags visuales" title="Destaca atributos" />
              <div className="mt-4 grid gap-6 md:grid-cols-2">
                <TagBoard title="Caracteristicas" tags={draft.dataTags} onToggle={toggleDataTag} />
                <TagBoard title="Estilo" tags={draft.socialTags} onToggle={toggleSocialTag} />
              </div>
            </section>

            <section className={cardClass}>
              <CardHeader label="Disponibilidad" title="Agenda semanal" />
              <div className="mt-4 space-y-4">
                {WEEK_DAY_OPTIONS.map(({ value, label }) => {
                  const slot =
                    draft.availability.find((item) => item.day === value) ?? {
                      day: value,
                      status: "all_day" as const,
                    };
                  const ranges = getSlotRanges(slot as any);
                  const rangesError = slot.status === "custom" ? validateRanges(ranges) : null;
                  return (
                    <div key={value} className="grid gap-3 rounded-2xl border border-white/5 p-4 sm:grid-cols-[150px,1fr]">
                      <div>
                        <p className="text-sm font-semibold">{label}</p>
                        <p className="text-xs text-white/60">
                          {slot.status === "custom"
                            ? "Selecciona el horario manualmente."
                            : slot.status === "unavailable"
                                ? "No disponible este dia."
                                : "Disponible todo el dia."}
                        </p>
                      </div>
                      <div className="flex flex-col gap-3 md:flex-row md:items-center">
                        <select
                          value={slot.status}
                          onChange={(event) => {
                            const status = event.target.value as typeof slot.status;
                            updateAvailability(value, {
                              status,
                              from: status === "custom" ? slot.from ?? "10:00" : undefined,
                              to: status === "custom" ? slot.to ?? "18:00" : undefined,
                              ranges: status === "custom" ? (ranges.length ? ranges : [{ from: "10:00", to: "18:00" }]) : undefined,
                            });
                          }}
                          className="rounded-[16px] border border-white/15 bg-transparent px-4 py-2 text-sm outline-none focus:border-[#ff4d5d]"
                        >
                          {AVAILABILITY_STATUS_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        {slot.status === "custom" && (
                          <div className="flex flex-1 flex-col gap-3">
                            {ranges.map((range, index) => (
                              <div key={`${value}-range-${index}`} className="flex items-center gap-3">
                                <input
                                  type="time"
                                  value={range.from ?? ""}
                                  onChange={(event) => updateAvailabilityRange(value, index, { from: event.target.value })}
                                  className="flex-1 rounded-[16px] border border-white/15 bg-transparent px-4 py-2 text-sm outline-none focus:border-[#ff4d5d]"
                                />
                                <span className="text-xs text-white/60">a</span>
                                <input
                                  type="time"
                                  value={range.to ?? ""}
                                  onChange={(event) => updateAvailabilityRange(value, index, { to: event.target.value })}
                                  className="flex-1 rounded-[16px] border border-white/15 bg-transparent px-4 py-2 text-sm outline-none focus:border-[#ff4d5d]"
                                />
                                {ranges.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeAvailabilityRange(value, index)}
                                    className="rounded-full border border-white/20 px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/70 transition hover:text-white"
                                    aria-label="Eliminar tramo"
                                  >
                                    −
                                  </button>
                                )}
                              </div>
                            ))}
                            <div className="flex items-center justify-between gap-3">
                              <button
                                type="button"
                                onClick={() => addAvailabilityRange(value)}
                                disabled={ranges.length >= 5}
                                className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/70 transition hover:text-white disabled:opacity-50"
                              >
                                Agregar tramo
                              </button>
                              {rangesError && <span className="text-xs text-[#ffb3b3]">{rangesError}</span>}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || loading}
                className="rounded-full bg-[linear-gradient(119deg,rgba(135,0,5,1)_12%,rgba(172,7,13,1)_45%,rgba(208,29,35,1)_75%,rgba(236,76,81,1)_100%)] px-10 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-white shadow-shadow-g disabled:opacity-60"
              >
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AvatarSection = ({
  avatar,
  onOpen,
  isReady,
  isUploading,
  error,
}: {
  avatar: AvatarMedia | null;
  onOpen: () => void;
  isReady: boolean;
  isUploading: boolean;
  error: string | null;
}) => (
  <div className="flex flex-col items-center gap-3 text-center">
    <div className="relative h-40 w-40 overflow-hidden rounded-full border-4 border-[#8e1522] bg-black/30">
      {avatar?.url ? (
        <img src={avatar.url} alt="Avatar" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-white/60">Sin avatar</div>
      )}
    </div>
    <button
      type="button"
      onClick={onOpen}
      disabled={!isReady || isUploading}
      className="rounded-full border border-white/25 px-5 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-white/80 transition hover:text-white disabled:opacity-50"
    >
      {isUploading ? "Subiendo..." : "Cambiar foto"}
    </button>
    {error && <p className="text-xs text-[#ffb3b3]">{error}</p>}
  </div>
);

const CardHeader = ({ label, title }: { label: string; title: string }) => (
  <div className="space-y-1">
    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#ff9aa2]">{label}</p>
    <h2 className="text-xl font-semibold">{title}</h2>
  </div>
);

const FormLabel = ({ text }: { text: string }) => (
  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">{text}</p>
);

const INPUT_CLASS = "mt-2 w-full rounded-[16px] border border-[#a01722] bg-[#1a0508] px-4 py-3 text-sm text-white outline-none focus:border-[#ff4d5d]";

const Field = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) => (
  <div>
    <FormLabel text={label} />
    <input
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className={INPUT_CLASS}
    />
  </div>
);

const ServiceChips = ({
  services,
  onToggle,
  onRemove,
}: {
  services: ServiceItem[];
  onToggle: (label: string) => void;
  onRemove: (label: string) => void;
}) => (
  <div className="flex flex-wrap gap-3">
    {services.map((service) => (
      <button
        type="button"
        key={service.label}
        onClick={() => onToggle(service.label)}
        className={`group flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
          service.active
            ? "border-[#ff6f7c] bg-[#ff6f7c]/15 text-white"
            : "border-white/15 text-white/70 hover:border-white/40 hover:text-white"
        }`}
      >
        {service.label}
        {!DEFAULT_SERVICE_OPTIONS.includes(service.label) && (
          <span
            onClick={(event) => {
              event.stopPropagation();
              onRemove(service.label);
            }}
            className="ml-1 text-xs text-white/50 transition hover:text-white"
          >
            {"x"}
          </span>
        )}
      </button>
    ))}
  </div>
);

const TagBoard = ({
  title,
  tags,
  onToggle,
}: {
  title: string;
  tags: SelectableTag[];
  onToggle: (id: string) => void;
}) => (
  <div>
    <FormLabel text={title} />
    <div className="mt-3 flex flex-wrap gap-2">
      {tags.map((tag) => (
        <button
          key={tag.id}
          type="button"
          onClick={() => onToggle(tag.id)}
          className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
            tag.active
              ? "border-[#ff6f7c] bg-[#ff6f7c]/15 text-white"
              : "border-white/15 text-white/70 hover:border-white/40 hover:text-white"
          }`}
        >
          {tag.label}
        </button>
      ))}
    </div>
  </div>
);

const useAvatarWidget = ({
  accessToken,
  userId,
  onAvatarChange,
}: {
  accessToken?: string | null;
  userId?: string;
  onAvatarChange: (media: AvatarMedia | null) => void;
}) => {
  const [isReady, setIsReady] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const widgetRef = useRef<CloudinaryUploadWidget | null>(null);

  useEffect(() => {
    if (!isBrowser()) return;
    if (cloudinaryInstance()) {
      setIsReady(true);
      return () => {
        widgetRef.current?.destroy();
        widgetRef.current = null;
      };
    }
    const script = document.createElement("script");
    script.src = CLOUDINARY_WIDGET_URL;
    script.async = true;
    script.onload = () => setIsReady(true);
    script.onerror = () => setError("No se pudo cargar el widget de imagenes");
    document.body.appendChild(script);
    return () => {
      script.onload = null;
      script.onerror = null;
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
      widgetRef.current?.destroy();
      widgetRef.current = null;
    };
  }, []);

  const open = async () => {
    if (!accessToken || !CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY) {
      setError("Configura Cloudinary para subir imagenes");
      return;
    }
    const cloud = cloudinaryInstance();
    if (!cloud) {
      setError("Widget no disponible aun");
      return;
    }

    if (!widgetRef.current) {
      widgetRef.current = cloud.createUploadWidget(
        {
          cloudName: CLOUDINARY_CLOUD_NAME,
          apiKey: CLOUDINARY_API_KEY,
          folder: `${CLOUDINARY_UPLOAD_BASE_FOLDER}/${userId ?? "sin-id"}`,
          multiple: false,
          sources: ["local", "url", "camera"],
          maxImageFileSize: CLOUDINARY_MAX_FILE_SIZE,
          uploadSignature: async (callback, paramsToSign) => {
            try {
              const sanitized = Object.fromEntries(
                Object.entries(paramsToSign).filter(
                  ([, value]) => typeof value === "string" || typeof value === "number",
                ),
              ) as UploadSignaturePayload;
              const response = await mediaService.requestSignature(accessToken, sanitized);
              callback(response.signature);
            } catch {
              setError("No se pudo obtener la firma de subida");
              setIsUploading(false);
            }
          },
        },
        (_error, result) => {
          if (result.event === "upload-added") {
            setIsUploading(true);
          }
          if (result.event === "success" && result.info?.secure_url && result.info.public_id) {
            onAvatarChange({ url: result.info.secure_url, publicId: result.info.public_id });
            setIsUploading(false);
          }
          if (result.event === "close" || result.event === "queues-end") {
            setIsUploading(false);
          }
        },
      );
    }
    widgetRef.current?.open();
  };

  return { open, isReady, isUploading, error };
};
