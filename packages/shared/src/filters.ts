// packages/shared/src/filters.ts

export interface ServiceFilterOption {
  id: string;
  label: string;
}

export const SERVICE_FILTER_OPTIONS: ServiceFilterOption[] = [
  // =====================
  // Servicios legacy (sin quitar nada)
  // =====================
  { id: 'companionship', label: 'Acompañamiento' },
  { id: 'azotes', label: 'Azotes' },
  { id: 'kiss', label: 'Beso con lengua' },
  { id: 'romantic-date', label: 'Cita íntima' },
  { id: 'cumshots', label: 'Corridas' },
  { id: 'domination', label: 'Dominación' },
  { id: 'gfe', label: 'Experiencia de pareja' },
  { id: 'lesbian-show', label: 'Lesbian show' },
  { id: 'erotic-massage', label: 'Masaje erótico' },
  { id: 'submission', label: 'Sumisión' },
  { id: 'bare-oral', label: 'Sexo oral sin protección' },
  { id: 'group', label: 'Sexo en grupo' },
  { id: 'threesome', label: 'Trío' },
  { id: 'orgy', label: 'Orgía' },
  { id: 'roleplay', label: 'Juegos de rol' },
  { id: 'videocall', label: 'Videollamada' },

  // =====================
  // Nuevos servicios (enriquecimiento)
  // =====================
  { id: 'body-to-body', label: 'Contacto corporal' },
  { id: 'shower-together', label: 'Ducha compartida' },
  { id: 'sport-massage', label: 'Masaje deportivo' },
  { id: 'personal-training', label: 'Entrenamiento acompañado' },
  { id: 'active-role', label: 'Rol activo' },
  { id: 'passive-role', label: 'Rol pasivo' },
  { id: 'versatile-role', label: 'Rol versátil' },
  { id: 'muscle-worship', label: 'Adoración corporal' },
  { id: 'fetish-session', label: 'Sesión fetichista' },
  { id: 'power-exchange', label: 'Intercambio de poder' },

  // =====================
  // "Atiende a..." modelado como servicios
  // =====================
  { id: 'attends-women', label: 'Atiende a mujeres' },
  { id: 'attends-men', label: 'Atiende a hombres' },
  { id: 'attends-trans', label: 'Atiende a personas trans' },
  { id: 'attends-non-binary', label: 'Atiende a personas no binarias' },
  { id: 'attends-couple-mf', label: 'Atiende a parejas MF' },
  { id: 'attends-couple-ff', label: 'Atiende a parejas FF' },
  { id: 'attends-couple-mm', label: 'Atiende a parejas MM' },
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
  max: 99,
  defaultValue: 35,
};
