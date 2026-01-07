import fs from 'node:fs';
import path from 'node:path';
import { config as loadEnv } from 'dotenv';

loadEnv();

if (!process.env.MONGODB_URI) {
  const rootEnvPath = path.resolve(__dirname, '../../../../.env');
  if (fs.existsSync(rootEnvPath)) {
    loadEnv({ path: rootEnvPath });
  }
}

function req(name: string, def?: string) {
  const value = process.env[name] ?? def;
  if (!value) throw new Error(`Missing env: ${name}`);
  return value;
}

function opt(name: string, def?: string) {
  return process.env[name] ?? def;
}

function reqNumber(name: string, def?: string) {
  const value = Number(req(name, def));
  if (Number.isNaN(value)) throw new Error(`Env ${name} must be a number`);
  return value;
}

function parseCsv(value?: string) {
  if (!value) return [];
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseBoolean(value?: string) {
  if (!value) return false;
  const normalized = value.trim().toLowerCase();
  return ['1', 'true', 'yes', 'y', 'on'].includes(normalized);
}

const storageDriver = req('STORAGE_DRIVER', 'cloudinary');
if (!['cloudinary'].includes(storageDriver)) {
  throw new Error(`Unsupported STORAGE_DRIVER: ${storageDriver}`);
}

const corsOriginRaw = opt('CORS_ORIGIN', '');

export const env = {
  port: reqNumber('API_PORT', '8080'),
  mongoUri: req('MONGODB_URI'),
  cors: {
    originAllowlist: parseCsv(corsOriginRaw),
    allowAll: corsOriginRaw.includes('*'),
    allowVercelPreview: parseBoolean(opt('CORS_ALLOW_VERCEL_PREVIEW', 'false')),
  },
  jwt: {
    accessSecret: req('JWT_ACCESS_SECRET'),
    refreshSecret: req('JWT_REFRESH_SECRET'),
    accessTtl: req('JWT_ACCESS_TTL', '15m'),
    refreshTtl: req('JWT_REFRESH_TTL', '7d'),
  },
  storage: {
    driver: storageDriver,
    cloudinary: {
      cloudName: req('CLOUDINARY_CLOUD_NAME'),
      apiKey: req('CLOUDINARY_API_KEY'),
      apiSecret: req('CLOUDINARY_API_SECRET'),
      baseFolder: req('CLOUDINARY_BASE_FOLDER', 'anuncios/data'),
      uploadFolder: req('CLOUDINARY_UPLOAD_FOLDER', 'anuncios/uploads'),
      maxFileSize: reqNumber('CLOUDINARY_MAX_FILE_SIZE', '5242880'),
    },
  },
} as const;
