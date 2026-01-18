import type { ContactChannels, UserRole } from "@anuncios/shared";
import { isApiConfigured } from "./httpClient";
import { authorizedJsonRequest, authorizedRequest, ensureAccessToken } from "./apiClient";

export type AccountProfile = {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  contacts?: ContactChannels;
  avatarUrl?: string | null;
  avatarPublicId?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UpdateProfilePayload = {
  email?: string;
  name?: string;
  contacts?: ContactChannels;
  avatar?: {
    url: string;
    publicId: string;
  } | null;
};

export type UpdatePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};

let mockProfileState: AccountProfile = {
  id: "mock-user",
  email: "mock@anuncios.com",
  name: "Perfil demo",
  role: "provider",
  contacts: {
    whatsapp: "+34 600 000 000",
    phone: "+34 600 000 001",
  },
  avatarUrl: null,
  avatarPublicId: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const profileService = {
  async getProfile(token: string | null | undefined): Promise<AccountProfile> {
    ensureAccessToken(token);
    if (!isApiConfigured()) {
      return mockProfileState;
    }
    return authorizedRequest<AccountProfile>("/auth/profile", token);
  },
  async updateProfile(
    token: string | null | undefined,
    payload: UpdateProfilePayload,
  ): Promise<AccountProfile> {
    ensureAccessToken(token);
    if (!isApiConfigured()) {
      mockProfileState = {
        ...mockProfileState,
        email: payload.email ?? mockProfileState.email,
        name: payload.name !== undefined ? payload.name : mockProfileState.name,
        contacts: payload.contacts !== undefined ? payload.contacts : mockProfileState.contacts,
        avatarUrl:
          payload.avatar !== undefined
            ? payload.avatar
              ? payload.avatar.url
              : null
            : mockProfileState.avatarUrl,
        avatarPublicId:
          payload.avatar !== undefined
            ? payload.avatar
              ? payload.avatar.publicId
              : null
            : mockProfileState.avatarPublicId,
        updatedAt: new Date().toISOString(),
      };
      return mockProfileState;
    }
    return authorizedJsonRequest<AccountProfile>("/auth/profile", token, "PATCH", payload);
  },
  async updatePassword(
    token: string | null | undefined,
    payload: UpdatePasswordPayload,
  ): Promise<void> {
    ensureAccessToken(token);
    if (!isApiConfigured()) {
      return;
    }
    await authorizedJsonRequest<undefined>("/auth/password", token, "PATCH", payload);
  },
  async deleteAccount(token: string | null | undefined): Promise<void> {
    ensureAccessToken(token);
    if (!isApiConfigured()) {
      return;
    }
    await authorizedRequest<undefined>("/auth/account", token, "DELETE");
  },
};
