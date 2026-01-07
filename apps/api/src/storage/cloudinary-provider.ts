import { v2 as cloudinary } from 'cloudinary';
import type { MediaProvider, UploadConfig, UploadSignatureParams } from './provider';
import { env } from '../config/env';

cloudinary.config({
  cloud_name: env.storage.cloudinary.cloudName,
  api_key: env.storage.cloudinary.apiKey,
  api_secret: env.storage.cloudinary.apiSecret,
  secure: true,
});

// Nota: mientras no tengamos credenciales reales, los valores de .env.example son mocks.

export class CloudinaryMediaProvider implements MediaProvider {
  private readonly uploadUrl = `https://api.cloudinary.com/v1_1/${env.storage.cloudinary.cloudName}/image/upload`;

  async getUploadConfig(ownerId: string, opts?: { folder?: string }): Promise<UploadConfig> {
    const timestamp = Math.round(Date.now() / 1000);
    const folder = opts?.folder ?? `${env.storage.cloudinary.uploadFolder}/${ownerId}`;

    const params: Record<string, string | number> = {
      timestamp,
      folder,
    };

    const signature = this.signUploadParams(params);

    return {
      url: this.uploadUrl,
      method: 'POST',
      fields: {
        ...params,
        signature,
        api_key: env.storage.cloudinary.apiKey,
      },
      maxFileSize: env.storage.cloudinary.maxFileSize,
    };
  }

  signUploadParams(params: UploadSignatureParams): string {
    return cloudinary.utils.api_sign_request(params, env.storage.cloudinary.apiSecret);
  }

  async deleteAsset(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId, { invalidate: true });
  }

  getPublicUrl(publicId: string): string {
    return cloudinary.url(publicId, { secure: true });
  }
}
