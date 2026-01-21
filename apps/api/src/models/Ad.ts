import { Schema, model, Types } from 'mongoose';
import type { AdMetadata, AdStatus, Plan, ProfileType } from '@anuncios/shared';

export interface IAd {
  owner: Types.ObjectId;
  title: string;
  description: string;
  city?: string;
  services?: string[];
  tags?: string[];
  age?: number;
  priceFrom?: number;
  priceTo?: number;
  profileType?: ProfileType;
  highlighted: boolean;
  images: Types.ObjectId[];
  status: AdStatus;
  plan: Plan;
  metadata?: AdMetadata | null;
}

const adSchema = new Schema<IAd>(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    city: { type: String, trim: true },
    services: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    age: { type: Number, min: 18, max: 99 },
    priceFrom: Number,
    priceTo: Number,
    profileType: { type: String, enum: ['chicas', 'trans'], index: true },
    highlighted: { type: Boolean, default: false, index: true },
    images: { type: [Schema.Types.ObjectId], ref: 'Media', default: [] },
    // status y plan ya estaban
    status: { type: String, enum: ['draft', 'published', 'blocked'], default: 'draft', index: true },
    plan: { type: String, enum: ['basic', 'premium'], default: 'basic', index: true },
    metadata: { type: Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
);

adSchema.index({ services: 1 });
adSchema.index({ age: 1 });
adSchema.index({ highlighted: 1, createdAt: -1 });

export const Ad = model<IAd>('Ad', adSchema);
