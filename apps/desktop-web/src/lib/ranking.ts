import type { Ad } from "@/lib/ads";

export type RankingChannel = "featured" | "weekly";

type RankedAd = {
  score: number;
  tieBreaker: number;
  ad: Ad;
};

function hashToUnitInterval(input: string) {
  let hash = 5381;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  const unsigned = hash >>> 0;
  return unsigned / 0xffffffff;
}

function startOfIsoWeek(date: Date) {
  const utc = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() - day + 1);
  utc.setUTCHours(0, 0, 0, 0);
  return utc;
}

function buildWeekSeed(baseSeed: string) {
  const weekStart = startOfIsoWeek(new Date());
  return `${baseSeed}:${weekStart.toISOString().slice(0, 10)}`;
}

function getRecencyScore(ad: Ad) {
  const lastActiveRaw = ad.metadata?.ranking?.lastActiveAt;
  const dateRaw = lastActiveRaw ?? ad.updatedAt ?? ad.createdAt;
  const timestamp = Date.parse(dateRaw);
  if (!Number.isFinite(timestamp)) return 0;
  const days = Math.floor((Date.now() - timestamp) / (24 * 60 * 60 * 1000));
  const clampedDays = Math.max(0, Math.min(30, days));
  return 30 - clampedDays;
}

function getFeaturedScore(ad: Ad) {
  const boost = typeof ad.metadata?.ranking?.boostFeatured === "number" ? ad.metadata.ranking.boostFeatured : 0;
  const planBonus = ad.plan === "premium" ? 15 : 0;
  return boost + planBonus + getRecencyScore(ad);
}

function getWeeklyScore(ad: Ad) {
  const favorites =
    typeof ad.metadata?.ranking?.favoritesWeekly === "number" ? ad.metadata.ranking.favoritesWeekly : 0;
  return favorites + getRecencyScore(ad);
}

export function rankAds(ads: Ad[], channel: RankingChannel, seed = "desktop-feed") {
  const weekSeed = buildWeekSeed(seed);
  const scored = ads.map<RankedAd>((ad) => {
    const score = channel === "featured" ? getFeaturedScore(ad) : getWeeklyScore(ad);
    const tieBreaker = hashToUnitInterval(`${ad.id}:${channel}:${weekSeed}`);
    return { ad, score, tieBreaker };
  });

  scored.sort((a, b) => {
    if (a.score !== b.score) return b.score - a.score;
    if (a.tieBreaker !== b.tieBreaker) return b.tieBreaker - a.tieBreaker;
    return a.ad.id.localeCompare(b.ad.id);
  });

  return scored.map((entry) => entry.ad);
}

