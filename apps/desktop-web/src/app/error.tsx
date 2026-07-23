"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center text-white">
      <h1 className="text-2xl font-semibold">Algo ha ido mal</h1>
      <p className="max-w-md text-sm text-white/70">
        No hemos podido cargar esta página. Puede ser un problema temporal del servidor, inténtalo de nuevo en unos
        segundos.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="rounded-full bg-white px-5 py-2 text-sm font-medium text-black transition hover:bg-white/90"
      >
        Reintentar
      </button>
    </div>
  );
}
