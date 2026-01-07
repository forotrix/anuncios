import fs from 'node:fs';
import path from 'node:path';
import { normalizeAdTitle } from '../src/utils/normalizeTitle';

// --- Constants & Data Pools ---

const CITIES = ['Barcelona', 'Madrid', 'Valencia', 'Sevilla', 'Bilbao', 'Málaga', 'Alicante', 'Zaragoza'];
const SERVICES = [
  '69', 'BDSM', 'Parejas', 'Lluvia dorada', 'Sado', 'Virtual', 'Juegos de roles',
  'Fetichismos', 'Masajes', 'Oral', 'Novia', 'Lenceria', 'Mujeres y Hombres',
  'Atencion a solteros y solteras', 'Juguetes eroticos', 'Sugar Baby', 'Viajes',
  'Videollamada', 'Piercings', 'Sin proteccion', 'Hoteles', 'Parking', 'Rolplay', 'Posturas'
];
const TAGS = ['Rubia', 'Morena', 'Pelirroja', 'Ojos Azules', 'Ojos Verdes', 'Tatuajes', 'Piercing', 'Natural', 'Operada', 'Delgada', 'Curvy', 'Alta', 'Bajita'];
const NAMES_CHICAS = ['Marina', 'Valentina', 'Kiara', 'Sofia', 'Lucia', 'Martina', 'Julia', 'Paula', 'Daniela', 'Valeria', 'Alba', 'Emma', 'Carla', 'Sara', 'Noa', 'Claudia', 'Carmen', 'Ana', 'Elena', 'Irene', 'Adriana', 'Lola', 'Vega', 'Leyre', 'Candela', 'Aitana', 'Olivia', 'Rocio', 'Celia', 'Blanca'];
const NAMES_TRANS = ['Carla', 'Daniela', 'Michelle', 'Stefany', 'Yasmin', 'Luna', 'Venus', 'Afrodita', 'Paris', 'Milan', 'Dakota', 'Sasha', 'Nikita', 'Ariel', 'Bambi', 'Barbie', 'Chanel', 'Diva', 'Electra', 'Fiona'];

const TITLES_PREFIX = ['Increíble', 'Maravillosa', 'Espectacular', 'Dulce', 'Ardiente', 'Sensual', 'Elegante', 'Exclusiva', 'Única', 'Inolvidable'];
const TITLES_SUFFIX = ['te espera', 'para ti', 'en tu ciudad', 'disponible', 'cerca de ti', 'recién llegada', 'solo por hoy', 'trato de novios', 'experiencia real'];

const DESCRIPTIONS = [
  'Hola amores, soy una chica dulce y cariñosa que busca pasar un buen rato contigo. Me encantan los masajes y el trato de novios. Llámame y no te arrepentirás.',
  'Si buscas una experiencia única y diferente, has llegado al lugar indicado. Soy experta en cumplir fantasías y hacerte sentir en el cielo. Discreción absoluta.',
  'Recién llegada a la ciudad. Soy una mujer elegante, educada y con muchas ganas de conocerte. Ofrezco un servicio completo y sin prisas. Fotos 100% reales.',
  '¿Cansado de la rutina? Ven a desconectar conmigo. Soy divertida, apasionada y muy complaciente. Tengo lugar propio o me desplazo a tu hotel.',
  'Busco caballeros solventes y educados para encuentros esporádicos. Soy una chica de alto nivel, culta y buena conversadora. Solo citas concertadas.',
  'La mejor compañía para tus eventos o cenas de negocios. También disponible para viajes. Discreción y elegancia garantizadas.',
  'Amante del placer y la lujuria. Si quieres vivir una aventura intensa, llámame. Hago todo tipo de servicios, pregunta sin compromiso.',
  'Chica joven y universitaria busca ayuda económica. Soy simpática, natural y con muchas ganas de aprender. Trato muy cercano y cariñoso.',
];

// --- Helper Functions ---

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem<T>(arr: T[]): T {
  return arr[randomInt(0, arr.length - 1)];
}

function randomSubset<T>(arr: T[], min: number, max: number): T[] {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, randomInt(min, max));
}

function generatePhone() {
  return `+34 6${randomInt(0, 9)}${randomInt(0, 9)} ${randomInt(0, 9)}${randomInt(0, 9)} ${randomInt(0, 9)}${randomInt(0, 9)} ${randomInt(0, 9)}${randomInt(0, 9)}`;
}

// --- Generator Logic ---

type GeneratedEntry = {
  user: {
    email: string;
    name: string;
    role: 'provider';
  };
  ad: {
    title: string;
    description: string;
    city: string;
    services: string[];
    tags: string[];
    age: number;
    priceFrom: number;
    priceTo: number;
    plan: 'basic' | 'premium';
    profileType: 'chicas' | 'trans';
    highlighted: boolean;
    images: { publicId: string; width: number; height: number }[];
    contacts: {
      whatsapp: string;
      telegram: string;
      phone: string;
    };
  };
};

function generateMockData() {
  const entries: GeneratedEntry[] = [];
  const totalAds = 100;
  const targetChicas = Math.floor(totalAds * 0.7); // 70%
  
  for (let i = 0; i < totalAds; i++) {
    const isChica = i < targetChicas;
    const profileType = isChica ? 'chicas' : 'trans';
    const namePool = isChica ? NAMES_CHICAS : NAMES_TRANS;
    const name = randomItem(namePool);
    const uniqueId = i + 1;
    
    // User Data
    const user = {
      email: `provider${uniqueId}@example.com`,
      name: `${name} ${uniqueId}`, // Ensure uniqueness
      role: 'provider' as const,
    };

    // Ad Data
    const city = randomItem(CITIES);
    const rawTitle = `${randomItem(TITLES_PREFIX)} ${name} ${randomItem(TITLES_SUFFIX)}`;
    const title = normalizeAdTitle(rawTitle);
    const description = randomItem(DESCRIPTIONS);
    const age = randomInt(18, 45);
    const priceFrom = randomInt(50, 150);
    const priceTo = priceFrom + randomInt(50, 200);
    const plan = Math.random() > 0.8 ? 'premium' : 'basic'; // 20% premium
    const highlighted = plan === 'premium' && Math.random() > 0.5;
    
    // Images (using placeholders for now as we don't have 100 real images)
    // In a real scenario, we would map these to real Cloudinary IDs
    const images = [
      { publicId: `mock-image-${uniqueId}-1`, width: 800, height: 1200 },
      { publicId: `mock-image-${uniqueId}-2`, width: 800, height: 1200 },
    ];

    const ad = {
      title,
      description,
      city,
      services: randomSubset(SERVICES, 3, 10),
      tags: randomSubset(TAGS, 2, 5),
      age,
      priceFrom,
      priceTo,
      plan: plan as 'basic' | 'premium',
      profileType: profileType as 'chicas' | 'trans',
      highlighted,
      images,
      contacts: {
        whatsapp: generatePhone(),
        telegram: `@${name.toLowerCase()}${uniqueId}`,
        phone: generatePhone(),
      },
    };

    entries.push({ user, ad });
  }

  return entries;
}

// --- Execution ---

const data = generateMockData();
const outputPath = path.resolve(process.cwd(), 'scripts', 'mock-data-v1.json');

fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf8');
console.log(`Generated ${data.length} entries at ${outputPath}`);
