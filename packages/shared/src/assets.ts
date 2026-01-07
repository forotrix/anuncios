export type HeroAsset = {
  id: 'marina' | 'valentina' | 'kiara';
  label: string;
  publicId: string;
};

export const HERO_ASSETS: HeroAsset[] = [
  {
    id: 'marina',
    label: 'Marina hero',
    publicId: 'marina-hero',
  },
  {
    id: 'valentina',
    label: 'Valentina hero',
    publicId: 'valentina-hero',
  },
  {
    id: 'kiara',
    label: 'Kiara hero',
    publicId: 'kiara-hero',
  },
];
