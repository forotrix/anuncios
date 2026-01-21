"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { logEvent } from "@/services/eventLogger";
import { mediaService, type UploadSignaturePayload } from "@/services/media.service";
import { profileService, type AccountProfile } from "@/services/profile.service";

type AvatarMedia = {
  url: string;
  publicId: string;
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
  multiple?: boolean;
  maxImageFileSize?: number;
  uploadSignature: (callback: (signature: string) => void, paramsToSign: Record<string, unknown>) => void;
};

type CloudinaryUploadWidgetResult = {
  event: string;
  info?: {
    secure_url?: string;
    public_id?: string;
  };
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

export const PerfilCuenta = () => {
  const { user, accessToken, updateUser, logout } = useAuth();
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [profileForm, setProfileForm] = useState({ email: user?.email ?? "", name: user?.name ?? "" });
  const [passwordForm, setPasswordForm] = useState({ current: "", next: "", confirm: "" });
  const [loading, setLoading] = useState<boolean>(Boolean(accessToken));
  const [profileStatus, setProfileStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [passwordStatus, setPasswordStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<"security" | "account" | "avatar" | "danger" | null>(null);
  const [isWidgetReady, setIsWidgetReady] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const widgetRef = useRef<CloudinaryUploadWidget | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    let mounted = true;
    setLoading(true);
    setErrorMessage(null);
    profileService
      .getProfile(accessToken)
      .then((data) => {
        if (!mounted) return;
        setProfile(data);
        setProfileForm({ email: data.email, name: data.name ?? "" });
      })
      .catch((error) => {
        if (!mounted) return;
        setErrorMessage(error instanceof Error ? error.message : "No se pudo cargar tu perfil.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [accessToken]);

  useEffect(() => {
    if (!isBrowser()) return;
    if (cloudinaryInstance()) {
      setIsWidgetReady(true);
      return () => {
        widgetRef.current?.destroy();
        widgetRef.current = null;
      };
    }
    const script = document.createElement("script");
    script.src = CLOUDINARY_WIDGET_URL;
    script.async = true;
    script.onload = () => setIsWidgetReady(true);
    script.onerror = () => setIsWidgetReady(false);
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
      widgetRef.current?.destroy();
      widgetRef.current = null;
    };
  }, []);

  const canUploadAvatar = Boolean(accessToken && CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && isWidgetReady);
  const shellClass = "rounded-[30px] border border-[#ec4c51] bg-[#07080c]/80 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.45)]";
  const neutralButtonClass =
    "flex w-full items-center justify-between rounded-full border border-white/25 bg-[#2a2c33] px-6 py-3 text-sm font-semibold text-white/85 transition hover:text-white";
  const compactButtonClass =
    "flex w-full items-center justify-between rounded-full border border-white/20 bg-[#2a2c33] px-5 py-2.5 text-sm font-semibold text-white/85 transition hover:text-white";
  const destructiveButtonClass =
    "flex w-full items-center justify-between rounded-full bg-[#a30009] px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(163,0,9,0.5)] transition hover:bg-[#c00010]";

  const handleProfileSubmit = async () => {
    if (!accessToken || !profile) return;
    const payload: Parameters<typeof profileService.updateProfile>[1] = {};
    if (profileForm.email.trim() && profileForm.email !== profile.email) {
      payload.email = profileForm.email.trim();
    }
    if ((profileForm.name ?? "").trim() !== (profile.name ?? "")) {
      payload.name = profileForm.name.trim();
    }

    if (!Object.keys(payload).length) {
      setProfileStatus("success");
      return;
    }

    setProfileStatus("saving");
    setErrorMessage(null);
    try {
      const updated = await profileService.updateProfile(accessToken, payload);
      setProfile(updated);
      setProfileForm({ email: updated.email, name: updated.name ?? "" });
      updateUser({
        email: updated.email,
        name: updated.name,
        contacts: updated.contacts,
        avatarUrl: updated.avatarUrl,
        avatarPublicId: updated.avatarPublicId,
      });
      setProfileStatus("success");
      logEvent("account:update-profile", { userId: updated.id });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No se pudo guardar el perfil.");
      setProfileStatus("error");
    }
  };

  const handlePasswordSubmit = async () => {
    if (!accessToken) return;
    if (!passwordForm.current || !passwordForm.next) {
      setErrorMessage("Completa las contrasenas.");
      setPasswordStatus("error");
      return;
    }
    if (passwordForm.next !== passwordForm.confirm) {
      setErrorMessage("Las contrasenas nuevas no coinciden.");
      setPasswordStatus("error");
      return;
    }

    setPasswordStatus("saving");
    setErrorMessage(null);
    try {
      await profileService.updatePassword(accessToken, {
        currentPassword: passwordForm.current,
        newPassword: passwordForm.next,
      });
      setPasswordForm({ current: "", next: "", confirm: "" });
      setPasswordStatus("success");
      logEvent("account:update-password", { userId: profile?.id });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No se pudo actualizar la contrasena.");
      setPasswordStatus("error");
    }
  };

  const handleDeleteAccount = async () => {
    if (!accessToken) return;
    const confirmed = window.confirm("Esta accion eliminara tu cuenta y anuncios. Deseas continuar?");
    if (!confirmed) return;
    setErrorMessage(null);
    try {
      await profileService.deleteAccount(accessToken);
      logout();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No se pudo eliminar la cuenta.");
    }
  };

  const cloudinaryInstance = () =>
    (typeof window === "undefined" ? undefined : (window as CloudinaryGlobal).cloudinary);

  const openAvatarWidget = () => {
    if (!accessToken || !canUploadAvatar) return;
    const instance = cloudinaryInstance();
    if (!instance) return;
    if (!widgetRef.current) {
      widgetRef.current = instance.createUploadWidget(
        {
          cloudName: CLOUDINARY_CLOUD_NAME!,
          apiKey: CLOUDINARY_API_KEY!,
          folder: `${CLOUDINARY_UPLOAD_BASE_FOLDER}/${user?.id ?? "sin-id"}`,
          multiple: false,
          maxImageFileSize: CLOUDINARY_MAX_FILE_SIZE,
          uploadSignature: async (callback, paramsToSign) => {
            try {
              const sanitizedParams = Object.fromEntries(
                Object.entries(paramsToSign).filter(
                  ([, value]) => typeof value === "string" || typeof value === "number",
                ),
              ) as UploadSignaturePayload;
              const response = await mediaService.requestSignature(accessToken, sanitizedParams);
              callback(response.signature);
            } catch {
              setErrorMessage("No se pudo generar la firma de subida.");
              setIsUploadingAvatar(false);
            }
          },
        },
        (_error, result) => {
          if (result.event === "upload-added") {
            setIsUploadingAvatar(true);
          }
          if (result.event === "success" && result.info?.secure_url && result.info.public_id) {
            void handleAvatarUpdate({ url: result.info.secure_url, publicId: result.info.public_id });
          }
          if (result.event === "close" || result.event === "queues-end") {
            setIsUploadingAvatar(false);
          }
        },
      );
    }
    widgetRef.current.open();
  };

  const handleAvatarUpdate = async (media: AvatarMedia) => {
    if (!accessToken) return;
    setIsUploadingAvatar(true);
    setErrorMessage(null);
    try {
      const updated = await profileService.updateProfile(accessToken, { avatar: media });
      setProfile(updated);
      updateUser({
        avatarUrl: updated.avatarUrl,
        avatarPublicId: updated.avatarPublicId,
      });
      setIsUploadingAvatar(false);
      logEvent("account:update-avatar", { userId: updated.id });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No se pudo actualizar el avatar.");
      setIsUploadingAvatar(false);
    }
  };

  return (
    <div className="bg-black text-white">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-10 px-4 pb-24 sm:px-6 lg:px-10">
        <section className={shellClass}>
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-black/30 p-5 text-center">
              <div className="mx-auto flex h-40 w-40 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-[#52040a]/60">
                {profile?.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-sm text-white/60">Sin avatar</span>
                )}
              </div>
              <p className="mt-4 text-sm text-white/70">Este avatar se usa en tu perfil privado.</p>
              <button
                type="button"
                onClick={openAvatarWidget}
                disabled={!canUploadAvatar || isUploadingAvatar}
                className="mt-4 w-full rounded-full border border-white/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/80 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isUploadingAvatar ? "Subiendo..." : "Cambiar avatar"}
              </button>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">Cuenta</h2>
                  <p className="text-sm text-white/60">Gestiona tu email y nombre visible en notificaciones.</p>
                </div>
                {profileStatus === "success" && (
                  <span className="text-xs uppercase tracking-[0.3em] text-emerald-300">Guardado</span>
                )}
                {profileStatus === "error" && (
                  <span className="text-xs uppercase tracking-[0.3em] text-rojo-pasion200">Error</span>
                )}
              </div>

              <form
                className="mt-6 grid gap-5"
                onSubmit={(event) => {
                  event.preventDefault();
                  void handleProfileSubmit();
                }}
              >
                <label className="flex flex-col gap-2 text-sm text-white/70">
                  Email
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(event) => setProfileForm((prev) => ({ ...prev, email: event.target.value }))}
                    className="rounded-2xl border border-white/20 bg-[#111219]/80 px-4 py-3 text-white outline-none focus:border-rojo-cereza400/60 disabled:opacity-50"
                    disabled={!accessToken || loading}
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm text-white/70">
                  Nombre de usuario
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(event) => setProfileForm((prev) => ({ ...prev, name: event.target.value }))}
                    className="rounded-2xl border border-white/20 bg-[#111219]/80 px-4 py-3 text-white outline-none focus:border-rojo-cereza400/60 disabled:opacity-50"
                    disabled={!accessToken || loading}
                  />
                </label>
                <div className="mt-2">
                  <button
                    type="submit"
                    disabled={!accessToken || profileStatus === "saving" || loading}
                    className="rounded-full bg-brand-gradient px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-shadow-g disabled:opacity-50"
                  >
                    {profileStatus === "saving" ? "Guardando..." : "Guardar cambios"}
                  </button>
                </div>
              </form>
            </div>

            <button
              type="button"
              onClick={() => setActiveSection((prev) => (prev === "security" ? null : "security"))}
              className={compactButtonClass}
            >
              <span>Contrasena y seguridad</span>
              <span className="text-xl leading-none">&gt;</span>
            </button>
            {activeSection === "security" && (
              <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold">Contrasena y seguridad</h2>
                    <p className="text-sm text-white/60">Actualiza tu contrasena y revisa sesiones activas.</p>
                  </div>
                  {passwordStatus === "success" && (
                    <span className="text-xs uppercase tracking-[0.3em] text-emerald-300">Actualizada</span>
                  )}
                  {passwordStatus === "error" && (
                    <span className="text-xs uppercase tracking-[0.3em] text-rojo-pasion200">Error</span>
                  )}
                </div>

                <form
                  className="mt-6 space-y-4"
                  onSubmit={(event) => {
                    event.preventDefault();
                    void handlePasswordSubmit();
                  }}
                >
                  <div className="grid gap-4 md:grid-cols-3">
                    <label className="flex flex-col gap-2 text-sm text-white/70">
                      Actual
                      <input
                        type="password"
                        value={passwordForm.current}
                        onChange={(event) => setPasswordForm((prev) => ({ ...prev, current: event.target.value }))}
                        className="rounded-2xl border border-white/20 bg-[#111219]/80 px-4 py-3 text-white outline-none focus:border-rojo-cereza400/60"
                        disabled={!accessToken}
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-sm text-white/70">
                      Nueva
                      <input
                        type="password"
                        value={passwordForm.next}
                        onChange={(event) => setPasswordForm((prev) => ({ ...prev, next: event.target.value }))}
                        className="rounded-2xl border border-white/20 bg-[#111219]/80 px-4 py-3 text-white outline-none focus:border-rojo-cereza400/60"
                        disabled={!accessToken}
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-sm text-white/70">
                      Confirmar
                      <input
                        type="password"
                        value={passwordForm.confirm}
                        onChange={(event) => setPasswordForm((prev) => ({ ...prev, confirm: event.target.value }))}
                        className="rounded-2xl border border-white/20 bg-[#111219]/80 px-4 py-3 text-white outline-none focus:border-rojo-cereza400/60"
                        disabled={!accessToken}
                      />
                    </label>
                  </div>
                  <button
                    type="submit"
                    disabled={!accessToken || passwordStatus === "saving"}
                    className="rounded-full border border-white/20 px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white/80 transition hover:text-white disabled:opacity-50"
                  >
                    {passwordStatus === "saving" ? "Actualizando..." : "Actualizar contrasena"}
                  </button>
                </form>

                <div className="mt-6 space-y-3">
                  <button type="button" className={neutralButtonClass}>
                    <span>Sesiones activas</span>
                    <span className="text-xl leading-none">&gt;</span>
                  </button>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setActiveSection((prev) => (prev === "danger" ? null : "danger"))}
              className={compactButtonClass}
            >
              <span>Cerrar y eliminar</span>
              <span className="text-xl leading-none">&gt;</span>
            </button>
            {activeSection === "danger" && (
              <div className="rounded-2xl border border-[#ff4c4c]/50 bg-black/30 p-5">
                <div className="space-y-3">
                  <h2 className="text-lg font-semibold">Cerrar y eliminar</h2>
                  <p className="text-sm text-white/65">Si deseas cerrar sesión o eliminar definitivamente tu cuenta.</p>
                  <button type="button" className={neutralButtonClass} onClick={logout}>
                    <span>Cerrar sesión</span>
                    <span className="text-xl leading-none">&gt;</span>
                  </button>
                  <button type="button" className={destructiveButtonClass} onClick={handleDeleteAccount}>
                    <span>Eliminar cuenta</span>
                    <span className="text-xl leading-none">&gt;</span>
                  </button>
                </div>
              </div>
            )}

            {errorMessage && (
              <p className="rounded-2xl border border-[#ff6161]/30 bg-[#360508]/80 px-4 py-3 text-sm text-[#ffb3b3]">
                {errorMessage}
              </p>
            )}

            {loading && (
              <div className="rounded-2xl border border-white/10 bg-[#120208]/80 px-4 py-3 text-sm text-white/60">
                Cargando datos de la cuenta...
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
