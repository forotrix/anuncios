
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { MediaAsset, ProfileType } from "@anuncios/shared";
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
    width?: number;
    height?: number;
    bytes?: number;
    format?: string;
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

export const PerfilMiAnuncio = () => {
  const { user, accessToken, logout } = useAuth();
  const form = useMiAnuncioForm(accessToken, { onAuthExpired: logout });
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
    addImage,
    removeImage,
    saveDraft,
    publishAd,
    unpublishAd,
  } = form;
  const [newService, setNewService] = useState("");
  const [galleryError, setGalleryError] = useState<string | null>(null);
  const avatarUploader = useAvatarWidget({
    accessToken,
    userId: user?.id,
    onAvatarChange: setAvatar,
  });
  const galleryUploader = useGalleryWidget({
    accessToken,
    userId: user?.id,
    adId: draft.adId,
    onImageAdded: addImage,
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

  const handleRemoveImage = async (mediaId: string) => {
    if (!accessToken) return;
    setGalleryError(null);
    try {
      await mediaService.deleteMedia(accessToken, mediaId);
      removeImage(mediaId);
    } catch (err) {
      setGalleryError(err instanceof Error ? err.message : "No se pudo eliminar la imagen.");
    }
  };

  const cardClass = "rounded-[22px] border border-[#8e1522] bg-[#050102] p-5 shadow-[0_25px_80px_rgba(0,0,0,0.45)]";
  const labelClass = "text-[11px] font-semibold uppercase tracking-[0.35em] text-[#ff9aa2]";

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
    <div className="bg-black text-white">
      <div className="mx-auto w-full max-w-[1200px] px-4 pb-20 pt-8 lg:px-8 lg:pl-[260px]">
        <div className="flex flex-col gap-6">
          <div className="flex-1 space-y-6">
            <section className="flex flex-col items-center gap-4 text-center">
              <p className={labelClass}>Mi anuncio</p>
              <h1 className="text-2xl font-semibold text-white">{headline}</h1>
              <div className="flex flex-col items-center gap-3">
                <AvatarSection
                  avatar={draft.avatar}
                  isReady={avatarUploader.isReady}
                  isUploading={avatarUploader.isUploading}
                  error={avatarUploader.error}
                  onOpen={avatarUploader.open}
                />
                <p className="text-xs text-white/60">Servicios activos: {meta.activeServices}</p>
              </div>
              <p className="text-sm text-white/60">{statusMessage}</p>
              <div className="flex flex-wrap items-center justify-center gap-3">
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
                <p className="text-xs text-white/50">Guarda tu anuncio para habilitar la publicacion.</p>
              )}
              {error && (
                <p className="rounded-2xl border border-[#ff6161]/40 bg-[#360508] px-4 py-2 text-sm text-[#ffb3b3]">
                  {error.message || "No se pudo guardar el anuncio, intenta nuevamente."}
                </p>
              )}
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
              <div className="mt-2 text-right text-[11px] text-white/50">
                {draft.description.length}/500 caracteres
              </div>
            </section>

            <section className={cardClass}>
              <CardHeader label="Galeria" title="Imagenes del anuncio" />
              <p className="mt-2 text-sm text-white/60">Sube fotos para destacar tu perfil en el feed.</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {draft.images.map((image) => (
                  <div
                    key={image.id}
                    className="group relative overflow-hidden rounded-[18px] border border-white/10 bg-black/40"
                  >
                    <img src={image.url} alt="Imagen del anuncio" className="h-44 w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(image.id)}
                      className="absolute right-3 top-3 rounded-full border border-white/30 bg-black/60 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/80 opacity-0 transition group-hover:opacity-100"
                    >
                      Quitar
                    </button>
                  </div>
                ))}
                {!draft.images.length && (
                  <div className="flex min-h-[140px] items-center justify-center rounded-[18px] border border-white/10 bg-black/20 text-sm text-white/50">
                    Sin imagenes cargadas.
                  </div>
                )}
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={galleryUploader.open}
                  disabled={!galleryUploader.isReady || galleryUploader.isUploading}
                  className="rounded-full border border-white/30 px-6 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-white/80 transition hover:text-white disabled:opacity-50"
                >
                  {galleryUploader.isUploading ? "Subiendo..." : "Subir imagenes"}
                </button>
                {(galleryError || galleryUploader.error) && (
                  <span className="text-xs text-[#ffb3b3]">{galleryError ?? galleryUploader.error}</span>
                )}
              </div>
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
                <input
                  aria-label="Buscar servicio"
                  placeholder="Buscar"
                  className="h-9 w-full rounded-full border border-white/20 bg-white/10 px-4 text-xs text-white/80 outline-none focus:border-rojo-cereza400/70 sm:w-[200px]"
                />
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
                    <div key={value} className="grid gap-3 rounded-2xl border border-[#4a0c14] bg-[#140306] p-4 sm:grid-cols-[140px,1fr]">
                      <div>
                        <p className="text-sm font-semibold">{label}</p>
                        <p className="text-xs text-white/40">
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
                          className="rounded-full border border-[#a01722] bg-[#2a060a] px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/80 outline-none focus:border-[#ff4d5d]"
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
                                  className="flex-1 rounded-full border border-[#a01722] bg-[#2a060a] px-3 py-2 text-xs text-white outline-none focus:border-[#ff4d5d]"
                                />
                                <span className="text-xs text-white/60">a</span>
                                <input
                                  type="time"
                                  value={range.to ?? ""}
                                  onChange={(event) => updateAvailabilityRange(value, index, { to: event.target.value })}
                                  className="flex-1 rounded-full border border-[#a01722] bg-[#2a060a] px-3 py-2 text-xs text-white outline-none focus:border-[#ff4d5d]"
                                />
                                {ranges.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeAvailabilityRange(value, index)}
                                    className="rounded-full border border-[#a01722] px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/70 transition hover:text-white"
                                    aria-label="Eliminar tramo"
                                  >
                                    -
                                  </button>
                                )}
                              </div>
                            ))}
                            <div className="flex items-center justify-between gap-3">
                              <button
                                type="button"
                                onClick={() => addAvailabilityRange(value)}
                                disabled={ranges.length >= 5}
                                className="rounded-full border border-[#a01722] px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/70 transition hover:text-white disabled:opacity-50"
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
  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">{text}</p>
);

const INPUT_CLASS =
  "mt-2 w-full rounded-[14px] border border-[#a01722] bg-[#2a060a] px-4 py-2.5 text-sm text-white placeholder:text-white/40 outline-none focus:border-[#ff4d5d]";

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
  onToggle: (serviceId: string) => void;
  onRemove: (serviceId: string) => void;
}) => (
  <div className="flex flex-wrap gap-2">
    {services.map((service) => (
      <button
        type="button"
        key={service.id}
        onClick={() => onToggle(service.id)}
        className={`group flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.2em] transition ${
          service.active
            ? "border-[#ff6f7c] bg-[#9f0f1b] text-white shadow-[0_0_20px_rgba(255,85,95,0.2)]"
            : "border-[#5a1a22] text-white/70 hover:border-[#ff6f7c]/60 hover:text-white"
        }`}
      >
        {service.label}
        {!DEFAULT_SERVICE_OPTIONS.some((option) => option.id === service.id) && (
          <span
            onClick={(event) => {
              event.stopPropagation();
              onRemove(service.id);
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
              ? "border-[#ff6f7c] bg-[#9f0f1b] text-white"
              : "border-[#4f141b] text-white/70 hover:border-[#ff6f7c]/60 hover:text-white"
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

const useGalleryWidget = ({
  accessToken,
  userId,
  adId,
  onImageAdded,
}: {
  accessToken?: string | null;
  userId?: string;
  adId?: string;
  onImageAdded: (media: MediaAsset) => void;
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

  useEffect(() => {
    if (!widgetRef.current) return;
    widgetRef.current.destroy();
    widgetRef.current = null;
  }, [adId]);

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
          multiple: true,
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
        async (_error, result) => {
          if (result.event === "upload-added") {
            setIsUploading(true);
          }
          if (result.event === "success" && result.info?.secure_url && result.info.public_id) {
            try {
              const media = await mediaService.registerMedia(accessToken, {
                publicId: result.info.public_id,
                url: result.info.secure_url,
                width: result.info.width,
                height: result.info.height,
                bytes: result.info.bytes,
                format: result.info.format,
                adId,
              });
              const mediaId = media.id ?? media._id;
              if (mediaId) {
                onImageAdded({
                  id: mediaId,
                  url: media.url,
                  width: media.width ?? undefined,
                  height: media.height ?? undefined,
                  bytes: media.bytes ?? undefined,
                  format: media.format ?? undefined,
                });
              }
            } catch (err) {
              setError(err instanceof Error ? err.message : "No se pudo registrar la imagen.");
            }
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
