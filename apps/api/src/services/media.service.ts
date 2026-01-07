import createError from 'http-errors';
import { Types } from 'mongoose';
import { mediaStorage } from '../storage';
import type { UploadConfig, UploadSignatureParams } from '../storage/provider';
import { Media } from '../models/Media';
import { env } from '../config/env';
import { Ad } from '../models/Ad';
import { recordAudit } from './audit.service';

export type RequestUploadOptions = {
  folder?: string;
};

export async function requestUploadConfig(ownerId: string, opts?: RequestUploadOptions): Promise<UploadConfig> {
  return mediaStorage().getUploadConfig(ownerId, opts);
}

export type UploadSignatureResult = {
  signature: string;
  params: UploadSignatureParams;
};

export async function signUploadParams(ownerId: string, params: UploadSignatureParams): Promise<UploadSignatureResult> {
  const storage = mediaStorage();
  if (!storage.signUploadParams) {
    throw createError(500, 'Media provider does not support upload signatures');
  }

  const expectedFolder = `${env.storage.cloudinary.uploadFolder}/${ownerId}`;
  const sanitized: UploadSignatureParams = { ...params };
  const incomingFolder = sanitized.folder;

  if (incomingFolder && incomingFolder !== expectedFolder) {
    throw createError(400, 'Invalid upload folder');
  }

  sanitized.folder = expectedFolder;

  const rawTimestamp = sanitized.timestamp;
  const parsedTimestamp =
    typeof rawTimestamp === 'number'
      ? rawTimestamp
      : typeof rawTimestamp === 'string'
        ? Number(rawTimestamp)
        : undefined;
  const safeTimestamp =
    typeof parsedTimestamp === 'number' && Number.isFinite(parsedTimestamp) && parsedTimestamp > 0
      ? parsedTimestamp
      : Math.round(Date.now() / 1000);
  sanitized.timestamp = safeTimestamp;

  const signature = storage.signUploadParams(sanitized);
  return { signature, params: sanitized };
}

export type RegisterMediaInput = {
  publicId: string;
  url: string;
  format?: string;
  bytes?: number;
  width?: number;
  height?: number;
  adId?: string;
};

export async function registerMedia(ownerId: string, input: RegisterMediaInput) {
  const expectedFolder = `${env.storage.cloudinary.uploadFolder}/${ownerId}`;
  const normalizedPublicId = input.publicId.replace(/\\/g, '/');

  if (normalizedPublicId.includes('..')) {
    throw createError(400, 'Invalid media path');
  }

  if (!normalizedPublicId.startsWith(`${expectedFolder}/`)) {
    throw createError(400, 'Invalid media origin');
  }

  // Nota: durante el desarrollo usamos URLs mockeadas hasta tener las credenciales reales.
  if (!input.url.includes(env.storage.cloudinary.cloudName)) {
    throw createError(400, 'Unexpected media URL');
  }

  const existing = await Media.findOne({ publicId: normalizedPublicId, owner: ownerId });
  if (existing) throw createError(409, 'Media already registered');

  const doc = await Media.create({
    owner: new Types.ObjectId(ownerId),
    publicId: normalizedPublicId,
    url: input.url,
    provider: env.storage.driver,
    format: input.format,
    bytes: input.bytes,
    width: input.width,
    height: input.height,
    kind: 'image',
    ad: undefined,
  });

  if (input.adId) {
    const ad = await Ad.findOne({ _id: input.adId, owner: ownerId });
    if (!ad) throw createError(404, 'Ad not found for media attachment');
    await replaceAdMedia(ownerId, ad.id, [...ad.images.map((id) => id.toString()), doc.id]);
  }

  await recordAudit({
    action: 'media:register',
    actorId: ownerId,
    targetId: doc.id,
    metadata: { adId: input.adId ?? null },
  });

  return doc.toObject();
}

export async function deleteMedia(ownerId: string, mediaId: string) {
  const media = await Media.findOne({ _id: mediaId, owner: ownerId });
  if (!media) throw createError(404, 'Media not found');

  await mediaStorage().deleteAsset(media.publicId);
  if (media.ad) {
    await Ad.updateOne({ _id: media.ad, owner: ownerId }, { $pull: { images: media._id } });
  }
  await media.deleteOne();

  await recordAudit({
    action: 'media:delete',
    actorId: ownerId,
    targetId: mediaId,
  });
}

export async function detachMediaFromAd(adId: string) {
  const mediaItems = await Media.find({ ad: adId });
  if (!mediaItems.length) return;

  await Promise.all(
    mediaItems.map(async (item) => {
      await mediaStorage().deleteAsset(item.publicId);
      await item.deleteOne();
    })
  );
}

export async function replaceAdMedia(ownerId: string, adId: string, mediaIds: string[]) {
  const ad = await Ad.findOne({ _id: adId, owner: ownerId });
  if (!ad) throw createError(404, 'Ad not found');

  const nextMediaIds = Array.from(new Set(mediaIds));

  const mediaDocs = await ensureOwnedMedia(ownerId, nextMediaIds);
  const linkedToOther = mediaDocs.filter((doc) => doc.ad && doc.ad.toString() !== adId);
  if (linkedToOther.length) throw createError(400, 'Media already linked to another ad');

  const currentIds = ad.images.map((imageId) => imageId.toString());

  const toDetach = currentIds.filter((id) => !nextMediaIds.includes(id));
  if (toDetach.length) {
    await Media.updateMany({ _id: { $in: toDetach.map((id) => new Types.ObjectId(id)) } }, { $set: { ad: undefined } });
  }

  if (mediaDocs.length) {
    await Media.updateMany(
      { _id: { $in: mediaDocs.map((doc) => doc._id) } },
      { $set: { ad: adId } }
    );
  }

  const docById = new Map(mediaDocs.map((doc) => [doc._id.toString(), doc]));
  const orderedDocs = nextMediaIds
    .map((id) => docById.get(id))
    .filter((doc): doc is typeof mediaDocs[number] => Boolean(doc));

  ad.images = orderedDocs.map((doc) => doc._id);
  await ad.save();

  const refreshed = await Ad.findById(adId).populate('images');
  if (!refreshed) throw createError(404, 'Ad not found after media update');
  return refreshed;
}

export async function ensureOwnedMedia(ownerId: string, mediaIds: string[]) {
  if (!mediaIds || mediaIds.length === 0) return [];

  const objectIds = mediaIds.map((id) => new Types.ObjectId(id));
  const media = await Media.find({ _id: { $in: objectIds }, owner: ownerId });

  if (media.length !== mediaIds.length) {
    throw createError(400, 'Some media not found for current user');
  }

  return media;
}
