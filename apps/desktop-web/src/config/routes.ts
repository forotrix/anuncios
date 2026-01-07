export type AppPageId =
  | "feed"
  | "feed-pop-up"
  | "perfil-cuenta"
  | "perfil-mi-anuncio"
  | "perfil-suscripciones"
  | "perfil-estadisticas"
  | "anuncio";

export interface PageDefinition {
  id: AppPageId;
  href: string;
  label: string;
  title: string;
  description: string;
  cta?: string;
}

export const PAGE_DEFINITIONS: PageDefinition[] = [
  {
    id: "feed",
    href: "/feed",
    label: "Feed principal",
    title: "Explora el feed completo",
    description:
      "Todas las tarjetas del diseño original renderizadas exactamente igual que en Figma.",
    cta: "Ir al feed",
  },
  {
    id: "feed-pop-up",
    href: "/feed/pop-up",
    label: "Feed + Modales",
    title: "Versión con pop-up activo",
    description:
      "Útil para revisar los overlays exportados desde Anima mientras definimos la UX final.",
    cta: "Ver pop-up",
  },
  {
    id: "perfil-cuenta",
    href: "/perfil/cuenta",
    label: "Perfil cuenta",
    title: "Vista del perfil público",
    description:
      "Estado de la cuenta, filtros y CTA listos para conectar con los datos reales cuando existan.",
    cta: "Abrir perfil",
  },
  {
    id: "perfil-mi-anuncio",
    href: "/perfil/mi-anuncio",
    label: "Perfil | Mi anuncio",
    title: "Editor del anuncio personal",
    description:
      "Todos los formularios y etiquetas de diseño original con valores mock.",
    cta: "Gestionar anuncio",
  },
  {
    id: "perfil-suscripciones",
    href: "/perfil/suscripciones",
    label: "Perfil | Subscripciones",
    title: "Gestiona tus planes activos",
    description:
      "Vista con el mismo diseño exportado desde Figma para revisar los tiers de planes.",
    cta: "Revisar planes",
  },
  {
    id: "perfil-estadisticas",
    href: "/perfil/estadisticas",
    label: "Perfil | Estadísticas",
    title: "Consulta el rendimiento del anuncio",
    description:
      "Gráficos y tarjetas mock listas para conectar con las métricas reales del backend.",
    cta: "Ver estadísticas",
  },
  {
    id: "anuncio",
    href: "/anuncio",
    label: "Detalle anuncio",
    title: "Detalle completo del anuncio",
    description: "Ficha individual reutilizando los componentes compartidos.",
    cta: "Ver anuncio",
  },
];

export const getPageDefinition = (id: AppPageId) =>
  PAGE_DEFINITIONS.find((page) => page.id === id);
