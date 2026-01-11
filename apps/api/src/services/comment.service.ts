import createError from 'http-errors';
import { Comment } from '../models/Comment';
import { Ad } from '../models/Ad';
import { User } from '../models/User';

const MAX_LIMIT = 50;

type CommentAuthor = {
  id: string;
  name: string;
};

type CommentItem = {
  id: string;
  text: string;
  createdAt: string;
  author: CommentAuthor;
};

function normalizeId(value: unknown) {
  if (!value) return '';
  return typeof value === 'string' ? value : value.toString();
}

async function ensurePublishedAd(adId: string) {
  const ad = await Ad.findOne({ _id: adId, status: 'published' }).select('_id').lean();
  if (!ad) throw createError(404, 'Ad not found');
}

function clampPagination(page = 1, limit = 20) {
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(Math.floor(limit), MAX_LIMIT) : 20;
  return { page: safePage, limit: safeLimit, skip: (safePage - 1) * safeLimit };
}

function serializeComment(raw: any, fallbackName = 'Usuario'): CommentItem {
  const author = raw.author ?? {};
  const authorName = typeof author.name === 'string' && author.name.trim().length ? author.name.trim() : fallbackName;
  return {
    id: normalizeId(raw._id),
    text: raw.text,
    createdAt: raw.createdAt ? new Date(raw.createdAt).toISOString() : new Date().toISOString(),
    author: {
      id: normalizeId(author._id),
      name: authorName,
    },
  };
}

export async function listComments(adId: string, page = 1, limit = 20) {
  await ensurePublishedAd(adId);
  const { page: safePage, limit: safeLimit, skip } = clampPagination(page, limit);

  const [items, total] = await Promise.all([
    Comment.find({ ad: adId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .populate('author', 'name')
      .lean(),
    Comment.countDocuments({ ad: adId }),
  ]);

  return {
    items: items.map((item) => serializeComment(item)),
    total,
    page: safePage,
    pages: Math.max(1, Math.ceil(total / safeLimit)),
    limit: safeLimit,
  };
}

export async function createComment(adId: string, authorId: string, text: string) {
  await ensurePublishedAd(adId);
  const author = await User.findById(authorId).select('name').lean();
  if (!author) throw createError(404, 'User not found');

  const comment = await Comment.create({
    ad: adId,
    author: authorId,
    text: text.trim(),
  });

  return serializeComment({ ...comment.toObject(), author });
}
