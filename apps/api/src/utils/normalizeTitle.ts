const LOWER_MARKERS = [" - ", " | ", " / ", " en ", " en la ", " en el ", " en los ", " en las "];

function trimWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function normalizeAdTitle(rawTitle: string | undefined | null) {
  if (!rawTitle) return "";
  const compactTitle = trimWhitespace(rawTitle);
  if (!compactTitle) return "";

  const lower = compactTitle.toLowerCase();
  let cutIndex = compactTitle.length;

  const commaIndex = compactTitle.indexOf(",");
  if (commaIndex >= 0) {
    cutIndex = Math.min(cutIndex, commaIndex);
  }

  const hashIndex = compactTitle.indexOf("#");
  if (hashIndex >= 0) {
    cutIndex = Math.min(cutIndex, hashIndex);
  }

  for (const marker of LOWER_MARKERS) {
    const markerIndex = lower.indexOf(marker);
    if (markerIndex >= 0) {
      cutIndex = Math.min(cutIndex, markerIndex);
    }
  }

  const sliced = trimWhitespace(compactTitle.slice(0, cutIndex));
  if (sliced) {
    return sliced.replace(/[-/|]+$/g, "").trim();
  }

  const fallback = compactTitle.split(" ")[0] ?? "";
  return fallback.trim();
}
