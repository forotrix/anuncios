// packages/shared/src/filters.ts

export interface ServiceFilterOption {
  id: string;
  label: string;
}

export const SERVICE_FILTER_OPTIONS: ServiceFilterOption[] = [
  { id: 'companionship', label: 'Acompañamiento' },
  { id: 'azotes', label: 'Azotes' },
  { id: 'kiss', label: 'Beso con lengua' },
  { id: 'romantic-date', label: 'Cita romántica' },
  { id: 'cumshots', label: 'Corridas' },
  { id: 'domination', label: 'Dominación' },
  { id: 'gfe', label: 'Girlfriend Experience' },
  { id: 'lesbian-show', label: 'Lesbian show' },
  { id: 'erotic-massage', label: 'Masaje erótico' },
  { id: 'submission', label: 'Sumisión' },
  { id: 'bare-oral', label: 'Sexo oral a pelo' },
  { id: 'group', label: 'Sexo en grupo' },
  { id: 'threesome', label: 'Trío' },
  { id: 'orgy', label: 'Orgía' },
  { id: 'roleplay', label: 'Juegos de rol' },
  { id: 'videocall', label: 'Videollamada' },
];

export interface AgeFilterConfig {
  label: string;
  min: number;
  max: number;
  defaultValue: number;
}

export const AGE_FILTER_CONFIG: AgeFilterConfig = {
  label: 'Edad',
  min: 18,
  max: 65,
  defaultValue: 35,
};
