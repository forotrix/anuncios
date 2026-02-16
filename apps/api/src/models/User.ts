// apps/api/src/models/User.ts
import { Schema, model, type HydratedDocument } from 'mongoose';
import bcrypt from 'bcryptjs';
import type { ContactChannels, UserRole } from '@anuncios/shared';

// Runtime enum (necesario para Mongoose)
const USER_ROLES = ['admin', 'agency', 'provider', 'customer'] as const;

export interface IUser {
  email: string;
  password: string;
  role: UserRole;
  name?: string | null;
  category?: string | null;
  location?: string | null;
  refreshTokenHash?: string | null;
  contacts?: ContactChannels | null;
  avatarUrl?: string | null;
  avatarPublicId?: string | null;
}

const contactSchema = new Schema(
  {
    whatsapp: { type: String, trim: true },
    telegram: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true },
    website: { type: String, trim: true },
  },
  { _id: false }
);

const userSchema = new Schema<IUser>(
  {
    email: { type: String, unique: true, required: true, index: true },
    password: { type: String, required: true },
    role: { type: String, enum: USER_ROLES, default: 'customer' },
    name: String,
    category: String,
    location: String,
    refreshTokenHash: { type: String, default: null },
    contacts: { type: contactSchema, default: null },
    avatarUrl: { type: String, default: null },
    avatarPublicId: { type: String, default: null },
  },
  { timestamps: true }
);

// importante: function normal (no arrow) y tipar this
userSchema.pre('save', async function (this: HydratedDocument<IUser>, next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

export const User = model<IUser>('User', userSchema);
export type { UserRole };
