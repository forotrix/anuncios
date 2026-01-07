export type UploadMethod = 'POST' | 'PUT';

export type UploadConfig = {
  url: string;
  method: UploadMethod;
  fields?: Record<string, string | number>;
  headers?: Record<string, string>;
  maxFileSize?: number;
};

export type UploadSignatureParams = Record<string, string | number>;

export interface MediaProvider {
  getUploadConfig(ownerId: string, opts?: { folder?: string }): Promise<UploadConfig>;
  signUploadParams?(params: UploadSignatureParams): string;
  deleteAsset(publicId: string): Promise<void>;
  getPublicUrl(publicId: string): string;
}
