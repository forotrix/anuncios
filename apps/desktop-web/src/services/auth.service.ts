import type { ContactChannels } from "@anuncios/shared";
import { postJson } from "./httpClient";

export type RegisterData = {
  email: string;
  password: string;
  role: "provider" | "agency" | "customer";
  name?: string;
  category?: string;
  location?: string;
  phone?: string;
};

export type LoginData = {
  email: string;
  password: string;
};

export type AuthUser = {
  id: string;
  email: string;
  role: "provider" | "agency" | "customer" | "admin";
  name: string | null;
  category: string | null;
  location: string | null;
  contacts: ContactChannels | null;
  avatarUrl: string | null;
  avatarPublicId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AuthResponse = {
  user: AuthUser;
  access: string;
  refresh: string;
};

export const authService = {
  register(data: RegisterData) {
    return postJson<AuthResponse>("/auth/register", data);
  },
  login(data: LoginData) {
    return postJson<AuthResponse>("/auth/login", data);
  },
};
