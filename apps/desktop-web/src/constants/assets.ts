export const ASSETS = {
  logoPrimary: "/img/shared/logo-primary.png",
  profileHeroTop: "/img/shared/profile-hero-top.png",
  profileHeroBottom: "/img/shared/profile-hero-bottom.png",
  flagEs: "/img/perfil-mi-anuncio/spain--es-.svg",
} as const;

export type AssetKey = keyof typeof ASSETS;
