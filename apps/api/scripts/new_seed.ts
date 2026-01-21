import mongoose from 'mongoose';
import { fakerES as faker } from '@faker-js/faker';
import { connectDB } from '../src/config/db';
import { env } from '../src/config/env';
import { User } from '../src/models/User';
import { Ad } from '../src/models/Ad';
import { Media } from '../src/models/Media';
import { SERVICE_FILTER_OPTIONS, type GenderIdentity, type GenderSex, type ProfileType } from '@anuncios/shared';
import { normalizeAdTitle } from '../src/utils/normalizeTitle';

// --- Constants & Configuration ---

const CITIES = ['Barcelona', 'Madrid', 'Valencia', 'Sevilla', 'Bilbao', 'Málaga', 'Alicante', 'Zaragoza'];
const SERVICE_IDS = SERVICE_FILTER_OPTIONS.map((option) => option.id);
const TAGS = ['Rubia', 'Morena', 'Pelirroja', 'Ojos Azules', 'Ojos Verdes', 'Tatuajes', 'Piercing', 'Natural', 'Operada', 'Delgada', 'Curvy', 'Alta', 'Bajita'];
const WEEK_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

// Reusing existing Cloudinary assets to ensure they load correctly
const CLOUDINARY_IMAGES = [
  { publicId: 'marina-hero.svg', width: 900, height: 1200 },
  { publicId: 'valentina-hero.svg', width: 1024, height: 1536 },
  { publicId: 'kiara-hero.svg', width: 900, height: 1200 },
];
const SEED_OWNER_EMAIL = 'seed@forotrix.com';

type SeedImage = {
  publicId: string;
  format?: string;
  width?: number;
  height?: number;
};

type SeedAd = {
  title: string;
  description: string;
  city: string;
  services: string[];
  tags: string[];
  age: number;
  priceFrom: number;
  priceTo: number;
  plan: 'basic' | 'premium';
  profileType?: ProfileType;
  gender?: { sex: GenderSex; identity: GenderIdentity };
  highlighted: boolean;
  images: SeedImage[];
};

// --- Original Sample Data ---

const SAMPLE_ADS: SeedAd[] = [
  {
    title: 'Marina',
    description:
      'Acompañamiento exclusivo, masajes eróticos y experiencias a medida en Barcelona. Marina cuida cada detalle para que vivas un encuentro inolvidable.',
    city: 'Barcelona',
    services: ['erotic-massage', 'companionship', 'gfe', 'body-to-body', 'shower-together'],
    tags: ['masaje', 'latina', 'premium'],
    age: 24,
    priceFrom: 120,
    priceTo: 220,
    plan: 'premium',
    gender: { sex: 'female', identity: 'cis' },
    highlighted: true,
    images: [{ publicId: 'marina-hero.svg', width: 900, height: 1200 }],
  },
  {
    title: 'Valentina',
    description:
      'Sesiones privadas de tantra relajante, rituales sensoriales y acompañamiento mindful en Madrid. Ideal para desconectar del ritmo urbano.',
    city: 'Madrid',
    services: ['erotic-massage', 'videocall', 'domination', 'fetish-session', 'submission'],
    tags: ['tantra', 'wellness', 'mindfulness'],
    age: 29,
    priceFrom: 90,
    priceTo: 150,
    plan: 'basic',
    gender: { sex: 'female', identity: 'trans' },
    highlighted: false,
    images: [{ publicId: 'valentina-hero.svg', width: 1024, height: 1536 }],
  },
  {
    title: 'Bruno',
    description:
      'Bruno ofrece encuentros discretos y experiencias premium en Valencia. Disponible para viajes y eventos corporativos.',
    city: 'Valencia',
    services: ['romantic-date', 'companionship', 'gfe', 'personal-training', 'active-role', 'power-exchange'],
    tags: ['viajes', 'lujo', 'discreción'],
    age: 30,
    priceFrom: 140,
    priceTo: 280,
    plan: 'premium',
    gender: { sex: 'male', identity: 'cis' },
    highlighted: true,
    images: [{ publicId: 'kiara-hero.svg', width: 900, height: 1200 }],
  },
  {
    title: 'Nico',
    description:
      'Nico combina carisma y discreción para encuentros únicos en Barcelona. Disponible para cenas, viajes y planes especiales.',
    city: 'Barcelona',
    services: ['companionship', 'gfe', 'videocall', 'versatile-role', 'attends-men', 'attends-couple-mm'],
    tags: ['discreción', 'viajes', 'premium'],
    age: 28,
    priceFrom: 110,
    priceTo: 210,
    plan: 'basic',
    gender: { sex: 'male', identity: 'trans' },
    highlighted: false,
    images: [{ publicId: 'marina-hero.svg', width: 900, height: 1200 }],
  },
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

function buildCloudinaryUrl(publicId: string) {
  return `https://res.cloudinary.com/${env.storage.cloudinary.cloudName}//image/upload/${publicId}`;
}

function buildSeedContacts(uniqueId: number) {
  const phoneSuffix = randomInt(100000000, 999999999);
  return {
    whatsapp: `+34${phoneSuffix}`,
    telegram: `@forotrix_${uniqueId}`,
    phone: `+34${phoneSuffix}`,
    email: `contacto+${uniqueId}@forotrix.com`,
    website: `https://forotrix.com/ayuda`,
  };
}

function buildSeedLocation(city: string) {
  const normalized = city.replace(/\s+/g, ' ').trim().toLowerCase();
  const region =
    normalized.includes('barcelona')
      ? 'Cataluña'
      : normalized.includes('madrid')
        ? 'Comunidad de Madrid'
        : normalized.includes('valencia')
          ? 'Comunidad Valenciana'
          : normalized.includes('sevilla')
            ? 'Andalucía'
            : normalized.includes('bilbao')
              ? 'País Vasco'
              : 'España';

  return {
    region,
    city,
    zone: randomItem(['Centro', 'Norte', 'Sur', 'Este', 'Oeste']),
    address: undefined,
    reference: undefined,
  };
}

function buildSeedAvailability(splitDay?: (typeof WEEK_DAYS)[number]) {
  return WEEK_DAYS.map((day) => {
    if (day === 'saturday' || day === 'sunday') {
      return { day, status: 'unavailable' as const };
    }

    const ranges =
      day === splitDay
        ? [
            { from: '10:00', to: '14:00' },
            { from: '16:00', to: '20:00' },
          ]
        : [{ from: '10:00', to: '18:00' }];

    return {
      day,
      status: 'custom' as const,
      ranges,
      from: ranges[0].from,
      to: ranges[0].to,
    };
  });
}

// --- Generator Logic ---

async function generateAndInsertMockAds(count: number) {
  const seedBatch = `seed-${new Date().toISOString().slice(0, 10)}`;

  for (let i = 0; i < count; i++) {
    const roll = Math.random();
    const gender =
      roll < 0.4
        ? ({ sex: 'female' as const, identity: 'cis' as const } satisfies { sex: 'female' | 'male'; identity: 'cis' | 'trans' })
        : roll < 0.6
          ? ({ sex: 'female' as const, identity: 'trans' as const } satisfies { sex: 'female' | 'male'; identity: 'cis' | 'trans' })
          : roll < 0.9
            ? ({ sex: 'male' as const, identity: 'cis' as const } satisfies { sex: 'female' | 'male'; identity: 'cis' | 'trans' })
            : ({ sex: 'male' as const, identity: 'trans' as const } satisfies { sex: 'female' | 'male'; identity: 'cis' | 'trans' });

    const profileType: ProfileType | undefined =
      gender.sex === 'female' ? (gender.identity === 'trans' ? 'trans' : 'chicas') : undefined;
    
    const firstName = faker.person.firstName(gender.sex);
    const uniqueId = i + 1;
    
    // 1. Create User (Provider)
    const email = `provider${uniqueId}@example.com`;
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        email,
        password: 'Seed1234!', // Default password
        role: 'provider',
        name: `${firstName} ${faker.person.lastName()}`,
      });
    }

    // 2. Generate Ad Data
    const city = randomItem(CITIES);
    const adjective = faker.word.adjective();
    const rawTitle = `${firstName}, ${adjective} en ${city}`;
    const title = normalizeAdTitle(rawTitle);
    const description = faker.lorem.paragraph();
    
    const plan = Math.random() > 0.8 ? 'premium' : 'basic';
    const highlighted = plan === 'premium' && Math.random() > 0.5;

    const boostFeatured = highlighted
      ? randomInt(70, 100)
      : plan === 'premium'
        ? randomInt(20, 60)
        : randomInt(0, 20);
    const favoritesWeekly = highlighted ? randomInt(20, 240) : randomInt(0, 120);
    const lastActiveAt = new Date(Date.now() - randomInt(0, 21) * 24 * 60 * 60 * 1000).toISOString();
    
    // Pick random images from our valid pool
    const adImages = randomSubset(CLOUDINARY_IMAGES, 1, 2);
    const splitDay = i === 0 ? 'wednesday' : undefined;

    const ad = await Ad.create({
      owner: user.id,
      title: title.charAt(0).toUpperCase() + title.slice(1), // Capitalize
      description,
      city,
      services: randomSubset(SERVICE_IDS, 3, 6),
      tags: randomSubset(TAGS, 2, 5),
      age: randomInt(18, 45),
      priceFrom: randomInt(50, 150),
      priceTo: randomInt(150, 300),
      plan,
      ...(profileType ? { profileType } : {}),
      highlighted,
      status: 'published',
      images: [],
      metadata: {
        seed: { seedBatch, isMock: true },
        gender,
        contacts: buildSeedContacts(uniqueId),
        location: buildSeedLocation(city),
        availability: buildSeedAvailability(splitDay),
        ranking: {
          boostFeatured,
          favoritesWeekly,
          lastActiveAt,
        },
        attributes: {
          seedBatch,
          seedUserEmail: email,
        },
      },
    });

    // 3. Create Media
    const mediaDocs = await Promise.all(
      adImages.map((image) =>
        Media.create({
          owner: user.id,
          url: buildCloudinaryUrl(image.publicId),
          publicId: image.publicId,
          provider: env.storage.driver,
          format: 'svg', // Assuming svg based on samples, or could be jpg
          width: image.width,
          height: image.height,
          kind: 'image',
          ad: ad.id,
        })
      )
    );

    ad.images = mediaDocs.map((doc) => doc._id);
    await ad.save();
  }
  console.log(`Generated ${count} mock ads.`);
}

async function cleanupSeedData() {
  await Ad.deleteMany({});
  await User.deleteMany({});
  console.info('Wiped all ads and users (media preserved).');
}

async function insertSampleAds() {
  let owner = await User.findOne({ email: SEED_OWNER_EMAIL });
  if (!owner) {
    owner = await User.create({
      email: SEED_OWNER_EMAIL,
      password: 'Seed1234!',
      role: 'provider',
      name: 'Seed Provider',
    });
  }

  const seedBatch = `seed-${new Date().toISOString().slice(0, 10)}`;

  // Clear existing samples for this owner to avoid duplicates if running multiple times without reset
  await Ad.deleteMany({ owner: owner.id });

  for (const sample of SAMPLE_ADS) {
    const gender =
      sample.gender ??
      (sample.profileType === 'trans'
        ? { sex: 'female' as const, identity: 'trans' as const }
        : { sex: 'female' as const, identity: 'cis' as const });
    const legacyProfileType: ProfileType | undefined =
      gender.sex === 'female' ? (gender.identity === 'trans' ? 'trans' : 'chicas') : undefined;
    const splitDay = sample.title === 'Marina' ? 'wednesday' : undefined;
    const ad = await Ad.create({
      owner: owner.id,
      title: normalizeAdTitle(sample.title),
      description: sample.description,
      city: sample.city,
      services: sample.services,
      tags: sample.tags,
      age: sample.age,
      priceFrom: sample.priceFrom,
      priceTo: sample.priceTo,
      plan: sample.plan,
      ...(legacyProfileType ? { profileType: legacyProfileType } : {}),
      highlighted: sample.highlighted,
      status: 'published',
      images: [],
      metadata: {
        seed: { seedBatch, isMock: true },
        gender,
        contacts: buildSeedContacts(randomInt(1000, 9999)),
        location: buildSeedLocation(sample.city),
        availability: buildSeedAvailability(splitDay),
        ranking: {
          boostFeatured: sample.highlighted ? 95 : 35,
          favoritesWeekly: sample.highlighted ? randomInt(60, 220) : randomInt(10, 120),
          lastActiveAt: new Date(Date.now() - randomInt(0, 7) * 24 * 60 * 60 * 1000).toISOString(),
        },
        attributes: {
          seedBatch,
          seedUserEmail: SEED_OWNER_EMAIL,
        },
      },
    });

    const mediaDocs = await Promise.all(
      sample.images.map((image) =>
        Media.create({
          owner: owner.id,
          url: buildCloudinaryUrl(image.publicId),
          publicId: image.publicId,
          provider: env.storage.driver,
          format: 'svg',
          width: image.width,
          height: image.height,
          kind: 'image',
          ad: ad.id,
        })
      )
    );

    ad.images = mediaDocs.map((doc) => doc._id);
    await ad.save();
  }
  console.log(`Inserted ${SAMPLE_ADS.length} sample ads.`);
}

async function normalizeAllTitles() {
  const entries = await Ad.find({}).select({ title: 1 }).lean();
  let updated = 0;

  for (const entry of entries) {
    const currentTitle = typeof entry.title === 'string' ? entry.title : '';
    const safeTitle = normalizeAdTitle(currentTitle);
    if (!safeTitle || safeTitle === currentTitle) continue;
    await Ad.updateOne({ _id: entry._id }, { $set: { title: safeTitle } });
    updated += 1;
  }

  if (updated) {
    console.info(`Normalized ${updated} ad titles`);
  }
}

// --- Main Execution ---

async function main() {
  await connectDB();
  await cleanupSeedData();
  await insertSampleAds();
  await generateAndInsertMockAds(100);
  await normalizeAllTitles();

  console.info('New seed data inserted successfully');
  await mongoose.connection.close();
}

main().catch((err) => {
  console.error(err);
  mongoose.connection.close();
  process.exit(1);
});


