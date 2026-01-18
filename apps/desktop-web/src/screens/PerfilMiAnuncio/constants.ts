import type { AvailabilityStatus, WeekDay } from "@anuncios/shared";
import { SERVICE_FILTER_OPTIONS } from "@anuncios/shared";

export const DEFAULT_SERVICE_OPTIONS = SERVICE_FILTER_OPTIONS;

export const REGION_OPTIONS = [
  "Andalucia",
  "Aragon",
  "Asturias",
  "Baleares",
  "Canarias",
  "Cantabria",
  "Castilla-La Mancha",
  "Castilla y Leon",
  "Cataluna",
  "Comunidad Valenciana",
  "Extremadura",
  "Galicia",
  "Madrid",
  "Murcia",
  "Navarra",
  "Pais Vasco",
  "La Rioja",
  "Ceuta",
  "Melilla",
] as const;

export const WEEK_DAY_OPTIONS: Array<{ value: WeekDay; label: string }> = [
  { value: "monday", label: "Lunes" },
  { value: "tuesday", label: "Martes" },
  { value: "wednesday", label: "Miercoles" },
  { value: "thursday", label: "Jueves" },
  { value: "friday", label: "Viernes" },
  { value: "saturday", label: "Sabado" },
  { value: "sunday", label: "Domingo" },
];

export const AVAILABILITY_STATUS_OPTIONS: Array<{ value: AvailabilityStatus; label: string }> = [
  { value: "all_day", label: "Todo el dia" },
  { value: "unavailable", label: "No disponible" },
  { value: "custom", label: "Personalizar" },
];

export type TagBlueprint = {
  id: string;
  label: string;
};

export const DATA_TAGS_BLUEPRINT: TagBlueprint[] = [
  { id: "edad-18-25", label: "18-25" },
  { id: "edad-25-35", label: "25-35" },
  { id: "edad-35+", label: "+35" },
  { id: "ciudad-barcelona", label: "Barcelona" },
  { id: "ciudad-madrid", label: "Madrid" },
  { id: "piel-morena", label: "Piel morena" },
  { id: "cabello-rubio", label: "Cabello rubio" },
  { id: "ojos-claros", label: "Ojos claros" },
];

export const SOCIAL_TAGS_BLUEPRINT: TagBlueprint[] = [
  { id: "actitud-simpatico", label: "Simpatica" },
  { id: "actitud-discreta", label: "Discreta" },
  { id: "actitud-viajes", label: "Disponible viajes" },
  { id: "actitud-24h", label: "24/7" },
  { id: "actitud-vip", label: "VIP" },
  { id: "actitud-experta", label: "Experta" },
  { id: "actitud-nueva", label: "Nueva en la ciudad" },
];
