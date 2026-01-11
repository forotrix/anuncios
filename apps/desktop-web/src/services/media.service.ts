import { postJson } from "./httpClient";
import { authorizedJsonRequest, authorizedRequest } from "./apiClient";

export type UploadSignaturePayload = Record<string, string | number>;

export type UploadSignatureResponse = {
  signature: string;
  params: UploadSignaturePayload;
};

export type RegisterMediaPayload = {
  publicId: string;
  url: string;
  format?: string;
  bytes?: number;
  width?: number;
  height?: number;
  adId?: string;
};

export type RegisteredMedia = {
  id?: string;
  _id?: string;
  url: string;
  publicId: string;
  format?: string;
  bytes?: number;
  width?: number;
  height?: number;
};

export const mediaService = {
  requestSignature(token: string, paramsToSign: UploadSignaturePayload) {
    return postJson<UploadSignatureResponse>(
      "/media/upload-signature",
      { paramsToSign },
      token,
    );
  },
  registerMedia(token: string, payload: RegisterMediaPayload) {
    return authorizedJsonRequest<RegisteredMedia>("/media", token, "POST", payload);
  },
  deleteMedia(token: string, mediaId: string) {
    return authorizedRequest<void>(`/media/${mediaId}`, token, { method: "DELETE" });
  },
};
