// apps/api/src/services/auth.service.ts
import createError from 'http-errors';
import bcrypt from 'bcryptjs';
import { type HydratedDocument } from 'mongoose';
import { User, type IUser } from '../models/User';
import { Ad } from '../models/Ad';
import { Media } from '../models/Media';
import { Comment } from '../models/Comment';
import { mediaStorage } from '../storage';
import { detachMediaFromAd } from './media.service';
import { recordAudit } from './audit.service';
import { signAccess, signRefresh, verifyRefresh, hashToken, compareToken, type AccessPayload, type RefreshPayload } from '../utils/jwt';
import type { ContactChannels, UserRole } from '@anuncios/shared';

type RegisterRole = Extract<UserRole, 'provider' | 'agency' | 'customer'>;

type UserDocument = HydratedDocument<IUser> & {
  createdAt: Date;
  updatedAt: Date;
};

export type PublicUser = {
  id: string;
  email: string;
  role: UserRole;
  name: string | null;
  contacts: ContactChannels | null;
  avatarUrl: string | null;
  avatarPublicId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type AuthResponse = {
  user: PublicUser;
  access: string;
  refresh: string;
};

const normalizeEmail = (email: string) => email.trim().toLowerCase();
const sanitizeName = (name?: string) => {
  const trimmed = name?.trim();
  return trimmed ? trimmed : undefined;
};
const sanitizeContacts = (contacts?: ContactChannels | null): ContactChannels | null => {
  if (!contacts) return null;
  const entries: ContactChannels = {};
  (['whatsapp', 'telegram', 'phone', 'email', 'website'] as const).forEach((key) => {
    const value = contacts[key];
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed.length) {
        entries[key] = trimmed;
      }
    }
  });
  return Object.keys(entries).length ? entries : null;
};

function toPublicUser(user: UserDocument): PublicUser {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name ?? null,
    contacts: user.contacts ?? null,
    avatarUrl: user.avatarUrl ?? null,
    avatarPublicId: user.avatarPublicId ?? null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

async function rotateTokens(user: UserDocument): Promise<Omit<AuthResponse, 'user'>> {
  const accessPayload: AccessPayload = { sub: user.id, role: user.role };
  const refreshPayload: RefreshPayload = { sub: user.id };

  const access = signAccess(accessPayload);
  const refresh = signRefresh(refreshPayload);

  user.refreshTokenHash = await hashToken(refresh);
  await user.save();

  return { access, refresh };
}

export async function register(email: string, password: string, role: RegisterRole, name?: string) {
  const normalizedEmail = normalizeEmail(email);
  const exists = await User.findOne({ email: normalizedEmail });
  if (exists) throw createError(409, 'Email already in use');

  const user = (await User.create({
    email: normalizedEmail,
    password,
    role,
    name: sanitizeName(name),
  })) as UserDocument;
  const tokens = await rotateTokens(user);

  return { user: toPublicUser(user), ...tokens };
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const normalizedEmail = normalizeEmail(email);
  const user = (await User.findOne({ email: normalizedEmail })) as UserDocument | null;
  if (!user) throw createError(401, 'Invalid credentials');

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw createError(401, 'Invalid credentials');

  const tokens = await rotateTokens(user);
  return { user: toPublicUser(user), ...tokens };
}

export async function refreshToken(rawRefresh: string): Promise<AuthResponse> {
  let payload: RefreshPayload;
  try {
    payload = verifyRefresh(rawRefresh);
  } catch {
    throw createError(401, 'Invalid refresh');
  }

  const user = (await User.findById(payload.sub)) as UserDocument | null;
  if (!user || !user.refreshTokenHash) throw createError(401, 'No session');

  const ok = await compareToken(rawRefresh, user.refreshTokenHash);
  if (!ok) throw createError(401, 'Invalid refresh');

  const tokens = await rotateTokens(user);
  return { user: toPublicUser(user), ...tokens };
}

export async function logout(userId: string) {
  await User.findByIdAndUpdate(userId, { refreshTokenHash: null });
}

export async function getProfile(userId: string): Promise<PublicUser> {
  const user = (await User.findById(userId)) as UserDocument | null;
  if (!user) throw createError(404, 'User not found');
  return toPublicUser(user);
}

type UpdateProfileInput = {
  email?: string;
  name?: string;
  contacts?: ContactChannels;
  avatar?: { url: string; publicId: string } | null;
};

export async function updateProfile(userId: string, payload: UpdateProfileInput): Promise<PublicUser> {
  const user = (await User.findById(userId)) as UserDocument | null;
  if (!user) throw createError(404, 'User not found');

  if (payload.email) {
    const normalizedEmail = normalizeEmail(payload.email);
    if (normalizedEmail !== user.email) {
      const exists = await User.findOne({ email: normalizedEmail, _id: { $ne: userId } });
      if (exists) throw createError(409, 'Email already in use');
      user.email = normalizedEmail;
    }
  }

  if (payload.name !== undefined) {
    const sanitized = sanitizeName(payload.name);
    user.name = sanitized ?? null;
  }

  if (payload.contacts !== undefined) {
    user.contacts = sanitizeContacts(payload.contacts);
  }

  if (payload.avatar !== undefined) {
    user.avatarUrl = payload.avatar ? payload.avatar.url : null;
    user.avatarPublicId = payload.avatar ? payload.avatar.publicId : null;
  }

  await user.save();
  return toPublicUser(user);
}

export async function updatePassword(userId: string, currentPassword: string, newPassword: string) {
  const user = (await User.findById(userId)) as UserDocument | null;
  if (!user) throw createError(404, 'User not found');

  const ok = await bcrypt.compare(currentPassword, user.password);
  if (!ok) throw createError(401, 'Invalid current password');

  user.password = newPassword;
  await user.save();
}

export async function deleteAccount(userId: string) {
  const user = (await User.findById(userId)) as UserDocument | null;
  if (!user) throw createError(404, 'User not found');

  const ads = await Ad.find({ owner: userId }, { _id: 1 }).lean();
  if (ads.length) {
    await Promise.all(ads.map((ad) => detachMediaFromAd(ad._id.toString())));
    await Ad.deleteMany({ owner: userId });
  }

  const orphanMedia = await Media.find({ owner: userId }).lean();
  if (orphanMedia.length) {
    await Promise.all(
      orphanMedia.map(async (item) => {
        await mediaStorage().deleteAsset(item.publicId);
        await Media.deleteOne({ _id: item._id });
      }),
    );
  }

  await Comment.deleteMany({ author: userId });
  await User.findByIdAndDelete(userId);

  await recordAudit({
    action: 'account:delete',
    actorId: userId,
    targetId: userId,
  });
}
