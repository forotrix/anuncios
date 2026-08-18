// packages/shared/src/geo.ts
// Coordenadas aproximadas (centroides) para ordenar por cercania sin pedir
// GPS ni direccion exacta a quienes ofrecen servicios. No son coordenadas
// de precision - solo sirven para un "cerca de mi" aproximado.

export interface CityCoordinate {
  city: string;
  lat: number;
  lon: number;
}

export const CITY_COORDINATES: CityCoordinate[] = [
  { city: 'Madrid', lat: 40.4168, lon: -3.7038 },
  { city: 'Barcelona', lat: 41.3874, lon: 2.1686 },
  { city: 'Valencia', lat: 39.4699, lon: -0.3763 },
  { city: 'Sevilla', lat: 37.3891, lon: -5.9845 },
  { city: 'Zaragoza', lat: 41.6488, lon: -0.8891 },
  { city: 'Malaga', lat: 36.7213, lon: -4.4214 },
  { city: 'Murcia', lat: 37.9922, lon: -1.1307 },
  { city: 'Palma', lat: 39.5696, lon: 2.6502 },
  { city: 'Las Palmas de Gran Canaria', lat: 28.1235, lon: -15.4363 },
  { city: 'Bilbao', lat: 43.263, lon: -2.935 },
  { city: 'Alicante', lat: 38.3452, lon: -0.481 },
  { city: 'Cordoba', lat: 37.8882, lon: -4.7794 },
  { city: 'Valladolid', lat: 41.6523, lon: -4.7245 },
  { city: 'Vigo', lat: 42.2406, lon: -8.7207 },
  { city: 'Gijon', lat: 43.5322, lon: -5.6611 },
  { city: 'Hospitalet de Llobregat', lat: 41.3597, lon: 2.0997 },
  { city: 'Vitoria-Gasteiz', lat: 42.8467, lon: -2.6716 },
  { city: 'A Coruna', lat: 43.3623, lon: -8.4115 },
  { city: 'Elche', lat: 38.2669, lon: -0.6975 },
  { city: 'Granada', lat: 37.1773, lon: -3.5986 },
  { city: 'Oviedo', lat: 43.3603, lon: -5.8448 },
  { city: 'Badalona', lat: 41.45, lon: 2.2474 },
  { city: 'Cartagena', lat: 37.6257, lon: -0.9966 },
  { city: 'Terrassa', lat: 41.5615, lon: 2.0084 },
  { city: 'Jerez de la Frontera', lat: 36.685, lon: -6.1261 },
  { city: 'Sabadell', lat: 41.5433, lon: 2.1094 },
  { city: 'Mostoles', lat: 40.3223, lon: -3.8649 },
  { city: 'Alcala de Henares', lat: 40.4818, lon: -3.3639 },
  { city: 'Pamplona', lat: 42.8125, lon: -1.6458 },
  { city: 'Fuenlabrada', lat: 40.2842, lon: -3.794 },
  { city: 'Almeria', lat: 36.834, lon: -2.4637 },
  { city: 'Leganes', lat: 40.3271, lon: -3.7638 },
  { city: 'Donostia-San Sebastian', lat: 43.3183, lon: -1.9812 },
  { city: 'Santander', lat: 43.4623, lon: -3.81 },
  { city: 'Burgos', lat: 42.3439, lon: -3.6969 },
  { city: 'Castellon de la Plana', lat: 39.9864, lon: -0.0513 },
  { city: 'Getafe', lat: 40.3057, lon: -3.7327 },
  { city: 'Albacete', lat: 38.9943, lon: -1.8585 },
  { city: 'Alcorcon', lat: 40.3459, lon: -3.8248 },
  { city: 'San Cristobal de La Laguna', lat: 28.4874, lon: -16.3156 },
  { city: 'Logrono', lat: 42.4627, lon: -2.4449 },
  { city: 'Badajoz', lat: 38.8794, lon: -6.9707 },
  { city: 'Salamanca', lat: 40.9701, lon: -5.6635 },
  { city: 'Huelva', lat: 37.2614, lon: -6.9447 },
  { city: 'Marbella', lat: 36.5108, lon: -4.885 },
  { city: 'Lleida', lat: 41.6176, lon: 0.62 },
  { city: 'Tarragona', lat: 41.1189, lon: 1.2445 },
  { city: 'Leon', lat: 42.5987, lon: -5.5671 },
  { city: 'Cadiz', lat: 36.5271, lon: -6.2886 },
  { city: 'Jaen', lat: 37.7796, lon: -3.7849 },
  { city: 'Ourense', lat: 42.3358, lon: -7.8639 },
  { city: 'Girona', lat: 41.9794, lon: 2.8214 },
  { city: 'Torrejon de Ardoz', lat: 40.455, lon: -3.477 },
  { city: 'Parla', lat: 40.2378, lon: -3.7681 },
  { city: 'Mataro', lat: 41.5381, lon: 2.4445 },
  { city: 'Algeciras', lat: 36.1408, lon: -5.4526 },
  { city: 'Reus', lat: 41.1561, lon: 1.1067 },
  { city: 'Telde', lat: 28.0083, lon: -15.4167 },
  { city: 'Santa Cruz de Tenerife', lat: 28.4636, lon: -16.2518 },
  { city: 'Baracaldo', lat: 43.297, lon: -2.9927 },
  { city: 'San Sebastian de los Reyes', lat: 40.5473, lon: -3.6272 },
  { city: 'Toledo', lat: 39.8628, lon: -4.0273 },
  { city: 'Ceuta', lat: 35.8894, lon: -5.3213 },
  { city: 'Melilla', lat: 35.2919, lon: -2.9381 },
];

export interface DistrictCoordinate {
  city: string;
  district: string;
  lat: number;
  lon: number;
}

// Solo Madrid y Barcelona tienen desglose por distrito de momento: son las
// dos ciudades donde "cerca de mi" a nivel de ciudad se queda corto. El resto
// se ordena por el centroide de CITY_COORDINATES.
export const DISTRICT_COORDINATES: DistrictCoordinate[] = [
  { city: 'Madrid', district: 'Centro', lat: 40.4168, lon: -3.7038 },
  { city: 'Madrid', district: 'Arganzuela', lat: 40.3961, lon: -3.6975 },
  { city: 'Madrid', district: 'Retiro', lat: 40.4079, lon: -3.6763 },
  { city: 'Madrid', district: 'Salamanca', lat: 40.4306, lon: -3.6789 },
  { city: 'Madrid', district: 'Chamartin', lat: 40.4633, lon: -3.677 },
  { city: 'Madrid', district: 'Tetuan', lat: 40.4589, lon: -3.7003 },
  { city: 'Madrid', district: 'Chamberi', lat: 40.4378, lon: -3.7037 },
  { city: 'Madrid', district: 'Fuencarral-El Pardo', lat: 40.4983, lon: -3.7241 },
  { city: 'Madrid', district: 'Moncloa-Aravaca', lat: 40.4364, lon: -3.7492 },
  { city: 'Madrid', district: 'Latina', lat: 40.3897, lon: -3.7461 },
  { city: 'Madrid', district: 'Carabanchel', lat: 40.3833, lon: -3.7333 },
  { city: 'Madrid', district: 'Usera', lat: 40.3833, lon: -3.7064 },
  { city: 'Madrid', district: 'Puente de Vallecas', lat: 40.3833, lon: -3.6667 },
  { city: 'Madrid', district: 'Moratalaz', lat: 40.4083, lon: -3.6444 },
  { city: 'Madrid', district: 'Ciudad Lineal', lat: 40.4436, lon: -3.6558 },
  { city: 'Madrid', district: 'Hortaleza', lat: 40.475, lon: -3.6417 },
  { city: 'Madrid', district: 'Villaverde', lat: 40.3472, lon: -3.7086 },
  { city: 'Madrid', district: 'Villa de Vallecas', lat: 40.3722, lon: -3.6111 },
  { city: 'Madrid', district: 'Vicalvaro', lat: 40.4028, lon: -3.6028 },
  { city: 'Madrid', district: 'San Blas-Canillejas', lat: 40.4394, lon: -3.6111 },
  { city: 'Madrid', district: 'Barajas', lat: 40.4722, lon: -3.5808 },
  { city: 'Barcelona', district: 'Ciutat Vella', lat: 41.3825, lon: 2.1769 },
  { city: 'Barcelona', district: 'Eixample', lat: 41.3888, lon: 2.159 },
  { city: 'Barcelona', district: 'Sants-Montjuic', lat: 41.3712, lon: 2.1478 },
  { city: 'Barcelona', district: 'Les Corts', lat: 41.3853, lon: 2.1301 },
  { city: 'Barcelona', district: 'Sarria-Sant Gervasi', lat: 41.4017, lon: 2.1305 },
  { city: 'Barcelona', district: 'Gracia', lat: 41.4036, lon: 2.1527 },
  { city: 'Barcelona', district: 'Horta-Guinardo', lat: 41.4278, lon: 2.1631 },
  { city: 'Barcelona', district: 'Nou Barris', lat: 41.4372, lon: 2.1774 },
  { city: 'Barcelona', district: 'Sant Andreu', lat: 41.435, lon: 2.19 },
  { city: 'Barcelona', district: 'Sant Marti', lat: 41.41, lon: 2.205 },
];

const ACCENTED_CHARS: Record<string, string> = {
  á: 'a',
  é: 'e',
  í: 'i',
  ó: 'o',
  ú: 'u',
  ü: 'u',
  ñ: 'n',
};

const normalize = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .split('')
    .map((char) => ACCENTED_CHARS[char] ?? char)
    .join('');

const cityIndex = new Map(CITY_COORDINATES.map((entry) => [normalize(entry.city), entry]));
const districtIndex = new Map(
  DISTRICT_COORDINATES.map((entry) => [`${normalize(entry.city)}::${normalize(entry.district)}`, entry]),
);

export interface Coordinates {
  lat: number;
  lon: number;
}

/**
 * Resuelve las coordenadas aproximadas de un anuncio a partir de su ciudad
 * y (si esta disponible) su distrito/barrio. Devuelve null si la ciudad no
 * esta en el catalogo curado - en ese caso el anuncio no participa en el
 * ordenamiento por cercania.
 */
export function resolveLocationCoordinates(city?: string | null, zone?: string | null): Coordinates | null {
  if (!city) return null;
  if (zone) {
    const district = districtIndex.get(`${normalize(city)}::${normalize(zone)}`);
    if (district) return { lat: district.lat, lon: district.lon };
  }
  const found = cityIndex.get(normalize(city));
  return found ? { lat: found.lat, lon: found.lon } : null;
}

/** Distancia entre dos puntos en km, formula de Haversine. */
export function haversineDistanceKm(a: Coordinates, b: Coordinates): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);
  const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/**
 * Aplica un desplazamiento aleatorio pero estable (~0.3-1.3km) a un punto,
 * para que dos perfiles del mismo distrito no compartan coordenadas
 * identicas. Estable porque se deriva de un seed (el id del anuncio), no de
 * Math.random - el mismo anuncio siempre cae en el mismo punto "difuminado".
 */
export function jitterCoordinates(point: Coordinates, seed: string): Coordinates {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const angle = (hash % 3600) / 3600 * 2 * Math.PI;
  const distanceKm = 0.3 + ((hash >>> 8) % 1000) / 1000;
  const dLat = (distanceKm / 111) * Math.cos(angle);
  const dLon = (distanceKm / (111 * Math.cos((point.lat * Math.PI) / 180))) * Math.sin(angle);
  return { lat: point.lat + dLat, lon: point.lon + dLon };
}
