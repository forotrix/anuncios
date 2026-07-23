"use client";

import { useEffect } from "react";

export default function GlobalError({
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
    <html lang="es">
      <body className="bg-black text-white antialiased">
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
          <h1 className="text-2xl font-semibold">Algo ha ido mal</h1>
          <p className="max-w-md text-sm text-white/70">
            No hemos podido cargar ForoTrix. Puede ser un problema temporal del servidor, inténtalo de nuevo en unos
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
      </body>
    </html>
  );
}
