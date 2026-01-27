"use client";

import { useEffect } from "react";

type ImageLightboxProps = {
  isOpen: boolean;
  imageUrl?: string | null;
  alt?: string;
  onClose: () => void;
};

export const ImageLightbox = ({ isOpen, imageUrl, alt = "Imagen", onClose }: ImageLightboxProps) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/90 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-label="Vista completa de la imagen"
      onClick={onClose}
    >
      <div className="relative max-h-[90vh] max-w-[90vw]" onClick={(event) => event.stopPropagation()}>
        <img src={imageUrl} alt={alt} className="max-h-[90vh] max-w-[90vw] object-contain" />
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full border border-white/30 bg-black/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white/80"
          aria-label="Cerrar vista de imagen"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};
