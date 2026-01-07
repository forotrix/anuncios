import jwt, { type JwtPayload, type Secret, type SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { env } from '../config/env';
import type { UserRole } from '@anuncios/shared';

const ACCESS_SECRET: Secret = env.jwt.accessSecret;
const REFRESH_SECRET: Secret = env.jwt.refreshSecret;
const ACCESS_EXPIRES_IN = env.jwt.accessTtl as SignOptions['expiresIn'];
const REFRESH_EXPIRES_IN = env.jwt.refreshTtl as SignOptions['expiresIn'];

export type AccessPayload = JwtPayload & {
  sub: string;
  role: UserRole;
};

export type RefreshPayload = JwtPayload & {
  sub: string;
};

export function signAccess(payload: AccessPayload) {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES_IN });
}

export function signRefresh(payload: RefreshPayload) {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN });
}

export function verifyAccess(token: string) {
  return jwt.verify(token, ACCESS_SECRET) as AccessPayload;
}

export function verifyRefresh(token: string) {
  return jwt.verify(token, REFRESH_SECRET) as RefreshPayload;
}

export async function hashToken(raw: string) {
  return bcrypt.hash(raw, 10);
}

export async function compareToken(raw: string, hash: string) {
  return bcrypt.compare(raw, hash);
}
