import { Schema, model, Types } from 'mongoose';

const MEDIA_PROVIDERS = ['cloudinary'] as const;
export type MediaProviderName = (typeof MEDIA_PROVIDERS)[number];

export interface IMedia {
  owner: Types.ObjectId;
  url: string;
  publicId: string;
  provider: MediaProviderName;
  format?: string;
  bytes?: number;
  width?: number;
  height?: number;
  kind: 'image';
  ad?: Types.ObjectId;
}

const mediaSchema = new Schema<IMedia>(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    provider: { type: String, enum: MEDIA_PROVIDERS, required: true, default: 'cloudinary' },
    format: String,
    bytes: Number,
    width: Number,
    height: Number,
    kind: { type: String, enum: ['image'], default: 'image' },
    ad: { type: Schema.Types.ObjectId, ref: 'Ad' },
  },
  { timestamps: true }
);

export const Media = model<IMedia>('Media', mediaSchema);
