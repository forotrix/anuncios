# Anuncios Monorepo

Plataforma tipo ForoTrix compuesta por una API Node.js y un front-end Next.js (desktop web). Ambos proyectos comparten tipos y utilidades dentro de `packages/shared` y se gestionan mediante PNPM workspaces.

## Estructura principal

| Ruta | Descripción |
| --- | --- |
| `apps/api` | API Express + MongoDB. Expone `/api/v1/*` (anuncios, media, event logs). Se ejecuta con `tsx watch src/server.ts`. |
| `apps/desktop-web` | Next.js 16 (App Router) con Tailwind. Contiene todas las pantallas públicas/privadas y la lógica de filtros, modales y registro de eventos. |
| `packages/shared` | Tipos TypeScript y catálogos (servicios, planes, filtros de edad) reutilizados por API y front-end. |

## Requisitos

- Node.js ≥ 20
- PNPM 9 (`corepack enable pnpm` recomendado)
- MongoDB + credenciales de Cloudinary si se desea levantar la API con datos reales

## Puesta en marcha

```bash
pnpm install
pnpm run dev        # Arranca API y desktop-web en paralelo
# Desktop-web usa el puerto 3100, la API escucha por defecto en 3000
```

Build de regresión:

```bash
pnpm run build      # Ejecuta tsc en shared/api y next build en desktop-web
```

Scripts adicionales: `pnpm run typecheck`, `pnpm run lint`.

## Variables de entorno clave

| Proyecto | Variable | Uso |
| --- | --- | --- |
| API | `MONGODB_URI` | Cadena de conexión a MongoDB. |
| API | `API_PORT`, `CORS_ORIGIN` | Puerto público y orígenes permitidos. |
| API | `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `JWT_*_TTL` | Configuración JWT. |
| API | `CLOUDINARY_*` (`CLOUD_NAME`, `API_KEY`, `API_SECRET`, `BASE_FOLDER`, `UPLOAD_FOLDER`, `MAX_FILE_SIZE`) | Proveedor Cloudinary para media y uploads. |
| Desktop-web | `NEXT_PUBLIC_API_BASE_URL` | Override para consumir la API en vez de mocks (`http://localhost:3000/api/v1` por defecto en desarrollo). |
| Desktop-web | `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `NEXT_PUBLIC_CLOUDINARY_API_KEY`, `NEXT_PUBLIC_CLOUDINARY_UPLOAD_FOLDER`, `NEXT_PUBLIC_CLOUDINARY_MAX_FILE_SIZE` | Configuran los formularios de subida de imágenes en Perfil/Anuncio. |

> Sugerencia: mantén un `.env` en la raíz para la API y `.env.local` dentro de `apps/desktop-web` para las variables `NEXT_PUBLIC_*`.

## QA y documentación

- La matriz completa de validaciones manuales, junto con instrucciones para reproducirlas, está en [`docs/QA.md`](docs/QA.md).
- El comando `pnpm run build` se ejecuta en cada iteración. Única advertencia actual: `baseline-browser-mapping` (Next.js) que no bloquea el build.
- Los eventos de uso se registran mediante `POST /events/log`; la capa de front-end encola los eventos cuando el usuario está offline y los libera automáticamente.

## Buenas prácticas relevantes

- Usa siempre `pnpm` (el `package.json` raíz declara `packageManager: pnpm@9.0.0`).
- Evita CSS arbitrario; usa los tokens definidos en `apps/desktop-web/tailwind.config.js`.
- Antes de modificar cualquiera de las pantallas acordadas, crea una copia en `cambios/` (el repositorio ya incluye un histórico).
- Para depurar el pop-up del feed vuelve a habilitarlo desde la URL (`/feed?popup=true`) o borrando `sessionStorage.desktopFeedPopupSeen`.
