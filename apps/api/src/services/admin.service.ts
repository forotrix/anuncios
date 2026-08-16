// apps/api/src/services/admin.service.ts
import createError from 'http-errors';
import { type FilterQuery } from 'mongoose';
import { User, type IUser } from '../models/User';
import { deleteAccount } from './auth.service';
import { recordAudit } from './audit.service';
import type { UserRole } from '@anuncios/shared';

const MAX_LIMIT = 50;

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function clampPagination(page = 1, limit = 20) {
  const safePage = Math.max(1, Math.floor(page) || 1);
  const safeLimit = Math.min(MAX_LIMIT, Math.max(1, Math.floor(limit) || 20));
  return { page: safePage, limit: safeLimit, skip: (safePage - 1) * safeLimit };
}

export type AdminUserDTO = {
  id: string;
  email: string;
  role: UserRole;
  status: 'active' | 'suspended';
  name: string | null;
  category: string | null;
  location: string | null;
  failedLoginAttempts: number;
  lockedUntil: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

function toAdminUser(user: any): AdminUserDTO {
  return {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    status: user.status,
    name: user.name ?? null,
    category: user.category ?? null,
    location: user.location ?? null,
    failedLoginAttempts: user.failedLoginAttempts ?? 0,
    lockedUntil: user.lockedUntil ?? null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export type ListUsersFilters = {
  role?: UserRole;
  status?: 'active' | 'suspended';
  search?: string;
};

export async function listUsers(filters: ListUsersFilters, page = 1, limit = 20) {
  const { limit: safeLimit, skip, page: safePage } = clampPagination(page, limit);

  const query: FilterQuery<IUser> = {};
  if (filters.role) query.role = filters.role;
  if (filters.status) query.status = filters.status;
  if (filters.search) query.email = { $regex: escapeRegExp(filters.search), $options: 'i' };

  const [items, total] = await Promise.all([
    User.find(query).sort({ createdAt: -1 }).skip(skip).limit(safeLimit).lean(),
    User.countDocuments(query),
  ]);

  return {
    items: items.map(toAdminUser),
    total,
    page: safePage,
    pages: Math.ceil(total / safeLimit),
    limit: safeLimit,
  };
}

export type UpdateUserInput = {
  role?: UserRole;
  status?: 'active' | 'suspended';
};

export async function updateUser(adminId: string, userId: string, updates: UpdateUserInput): Promise<AdminUserDTO> {
  if (userId === adminId && updates.role && updates.role !== 'admin') {
    throw createError(400, 'No puedes quitarte tu propio rol de admin');
  }
  if (userId === adminId && updates.status === 'suspended') {
    throw createError(400, 'No puedes suspender tu propia cuenta');
  }

  const user = await User.findById(userId);
  if (!user) throw createError(404, 'User not found');

  if (updates.role) user.role = updates.role;
  if (updates.status) {
    user.status = updates.status;
    if (updates.status === 'active') {
      user.failedLoginAttempts = 0;
      user.lockedUntil = null;
    }
  }
  await user.save();

  await recordAudit({
    action: 'admin:user:update',
    actorId: adminId,
    targetId: userId,
    metadata: updates,
  });

  return toAdminUser(user);
}

export async function deleteUser(adminId: string, userId: string): Promise<void> {
  if (userId === adminId) throw createError(400, 'No puedes eliminar tu propia cuenta');

  const user = await User.findById(userId);
  if (!user) throw createError(404, 'User not found');

  await deleteAccount(userId, adminId);
}
