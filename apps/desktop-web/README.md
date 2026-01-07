# @anuncios/desktop-web

Aplicación Next.js 16 (App Router) que renderiza el feed, el flujo de registro y las pantallas privadas de “Perfil”. Mantiene paridad visual con los diseños de Figma y consume los catálogos compartidos de `@anuncios/shared`.

## Scripts

```bash
pnpm install          # en la raíz del monorepo
pnpm run dev          # levanta el front en http://localhost:3100
pnpm run build        # next build con Turbopack
pnpm run lint         # next lint
pnpm run typecheck    # tsc --noEmit
```

> La app está pensada para ejecutarse junto con `apps/api`, pero si `NEXT_PUBLIC_API_BASE_URL` no está definido se usan los mocks de `@anuncios/shared`.

## Configuración

- `NEXT_PUBLIC_API_BASE_URL` → URL completa (incluyendo `/api/v1`) del backend.
- `NEXT_PUBLIC_CLOUDINARY_*` → mismos valores expuestos por el backend para subir imágenes en las pantallas de Perfil.
- Los tokens de Tailwind para gradientes/colores viven en `src/app/globals.css` y `tailwind.config.js`. Evita `bg-[#xxxxxx]` nuevos.

## Pantallas principales

| Pantalla | Archivo base | Notas |
| --- | --- | --- |
| Feed + filtros | `src/screens/DesktopFeed/DesktopFeed.tsx` | Controla filtros, paginación, `WelcomeModal` y registro de eventos. |
| Feed pop-up | `src/screens/DesktopFeedPopUp/DesktopFeedPopUp.tsx` | Reusa el feed forzando el modal para QA rápida. |
| Anuncio | `src/screens/Anuncio/Anuncio.tsx` | Consume `adService` y `logEvent` para contactos. |
| Perfil (Mi Anuncio / Suscripciones / Estadísticas / Cuenta) | `src/screens/Perfil*/` | Todas preservan el layout exportado, con formularios/hook conectados a servicios mock. |

## QA rápido

Consulta [`../../docs/QA.md`](../../docs/QA.md) para la matriz completa. Resumen:

- `/feed` → verifica filtros, favoritos y registro de eventos.
- `/feed/pop-up` → debe bloquear scroll y respetar `sessionStorage.desktopFeedPopupSeen`.
- `/anuncio` y `/anuncio/[id]` → muestran metadata y CTAs reales o mocks.
- `/perfil/*` → formularios controlados con estados guardados en hooks locales.

La compilación actual (`pnpm run build`) sólo emite la advertencia de `baseline-browser-mapping`.
