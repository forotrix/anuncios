import { postJson } from "./httpClient";

export type UploadSignaturePayload = Record<string, string | number>;

export type UploadSignatureResponse = {
  signature: string;
  params: UploadSignaturePayload;
};

export const mediaService = {
  requestSignature(token: string, paramsToSign: UploadSignaturePayload) {
    return postJson<UploadSignatureResponse>(
      "/media/upload-signature",
      { paramsToSign },
      token,
    );
  },
};
