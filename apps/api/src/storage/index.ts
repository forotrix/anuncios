import { env } from '../config/env';
import type { MediaProvider } from './provider';
import { CloudinaryMediaProvider } from './cloudinary-provider';

let provider: MediaProvider | null = null;

function buildProvider(): MediaProvider {
  switch (env.storage.driver) {
    case 'cloudinary':
      return new CloudinaryMediaProvider();
    default:
      throw new Error(`Unsupported storage driver: ${env.storage.driver}`);
  }
}

export function mediaStorage(): MediaProvider {
  if (!provider) {
    provider = buildProvider();
  }
  return provider;
}
