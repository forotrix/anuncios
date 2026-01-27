# Informe Estratégico Fullstack: Calidad, Arquitectura y Escalabilidad

Este documento analiza el estado del repositorio completo (Frontend `desktop-web` + Backend `api` + Librería `shared`), proporcionando una hoja de ruta para alinear la arquitectura técnica con las necesidades de negocio.

## 1. Visión Arquitectónica Global

El proyecto sigue una estructura de **Monorepo** (pnpm workspaces) correcta, con una clara separación entre Cliente, Servidor y Código Compartido.

| Componente | Estado Actual | Tecnologías Clave | Estado de Salud |
| :--- | :--- | :--- | :--- |
| **Backend** (`apps/api`) | Sólido, type-safe | Node.js, Express, Zod, Mongoose | 🟢 Bueno |
| **Frontend** (`apps/desktop-web`) | Funcional, pero con deuda visual/semántica | Next.js, Tailwind, React | 🟡 Mejorable |
| **Shared** (`packages/shared`) | Bien definido, pero sub-utilizado | TypeScript Types, Constantes | 🟠 Sub-utilizado |

---

## 2. Análisis del Backend (`apps/api`)

El backend muestra un nivel de madurez superior al frontend en términos de consistencia.
- **✅ Puntos Fuertes:** Uso intensivo de **Zod** para validación de entrada (Runtime safety), tipado estricto en controladores, y uso de middlewares de seguridad (`security.ts`, auth).
- **⚠️ Puntos de Mejora (Fat Routes):** El archivo `ad.routes.ts` contiene demasiada lógica de implementación (ej. reglas complejas de solapamiento de horarios en Zod `superRefine`).
    *   *Acción:* Extraer la lógica de validación de negocio a `services/ad.validator.ts` o al modelo. Las rutas solo deben orquestar HTTP.

## 3. Análisis del Frontend (`apps/desktop-web`)

El frontend requiere una transición de "Prototipo Rápido" a "Producto Sostenible".

### A. Arquitectura (Feature-Based)
Actualmente, la lógica está dispersa. Recomendamos agrupar por **Dominio** en lugar de por **Tipo Técnico**.
- **Propuesta:** Migrar a `src/features/{featureName}`.
    *   `src/features/feed/` (Feed, Filtros, Hooks de búsqueda)
    *   `src/features/auth/` (Login, Registro, Recuperación)
    *   `src/features/profile/` (Gestión de cuenta)
- **Ventaja:** Cuando una feature crece, no contaminas el resto de la app.

### B. Consumo de API & Tipado ("The Disconnect")
Existe una desconexión entre `shared` y el `frontend`.
- **Problema:** En `src/lib/ads.ts` se están **re-definiendo** manualmente interfaces (`Ad`, `MediaAsset`) que ya existen en `packages/shared` (`AdRecord`, `MediaAsset`).
- **Riesgo:** Si el Backend añade un campo a `AdRecord`, el Frontend no se entera (y TypeScript no se queja) hasta que falla en runtime porque el mapeo manual (`mapBackendAd`) está desactualizado.
- **Acción Crítica:** **Eliminar `src/lib/ads.ts`** (o reducirlo al mínimo) e importar directamente los tipos de `@anuncios/shared`.

### C. Estrategia "Responsive-First"
- Renombrar `DesktopFeed.tsx` a `Feed.tsx`. Eliminar la distinción nominal desktop/mobile. El código debe ser una única fuente de verdad adaptable vía CSS.

### D. Sistema de Diseño (Tailwind)
- Continuar la sustitución de "Magic Values" (`#8e1522`) por Tokens Semánticos (`border-brand-primary`) definidos en `tailwind.config.ts`. Esto permite cambiar el tema de la app (ej. "Modo San Valentín") tocando un solo archivo.

---

## 4. Oportunidad de Oro: "Shared Validations"

Actualmente, `apps/api` tiene esquemas de Zod muy potentes (`createAdSchema`) que validan e-mails, longitudes y formatos. El frontend **no los usa**.
- **Consecuencia:** El frontend probablemente re-implementa validaciones peores manualmente, o espera al error del servidor.
- **Estrategia Fullstack:**
    1.  Mover los Schemas de Zod (`ad.routes.ts` -> lines 16-200) a `packages/shared/src/schemas.ts`.
    2.  Backend importa y usa en rutas.
    3.  Frontend importa y usa en formularios (`react-hook-form` + `zodResolver`).
- **Resultado:** Validación Isomórfica. Misma regla en cliente (inmediata) y servidor (segura). Cero duplicidad.

---

## 5. Plan de Acción Recomendado

### Fase 1: Higiene & Seguridad (Low Hanging Fruit)
1.  [Front] Renombrar `DesktopFeed.tsx` -> `Feed.tsx`.
2.  [Shared] Exportar esquemas Zod desde `shared`.
3.  [Front] Refactorizar estilos de `Feed` usando Tokens (`tailwind.config`).

### Fase 2: Consolidación (Medium Term)
4.  [Front] Eliminar tipos duplicados en `lib/ads.ts` y usar `shared`.
5.  [Back] Limpiar `ad.routes.ts` extrayendo lógica de validación a servicios.

### Fase 3: Reestructuración (Long Term)
6.  [Front] Implementar estructura de carpetas `src/features/`.
7.  [Front] Reorganizar `src/components/` en `ui`, `layout` e `icons`.
