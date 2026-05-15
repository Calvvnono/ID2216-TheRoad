// Personal For You: style signals (BGM tags) take priority; location is fallback
const WEIGHT_ACTIVITY = 4;
const WEIGHT_CUSTOM = 3;
const WEIGHT_COUNTRY = 2;
const WEIGHT_DESTINATION = 2;
const WEIGHT_VISITED = 1;
const WEIGHT_MOOD = 1;

export const DEFAULT_INTEREST_KEYWORDS = [
  'culture',
  'adventure',
  'food',
  'nature',
  'photography',
];

function normalizeToken(value) {
  if (!value) return '';
  return String(value).trim().toLowerCase();
}

function accumulate(weights, tokens, weight) {
  if (!Array.isArray(tokens)) return;
  tokens.forEach((token) => {
    const normalized = normalizeToken(token);
    if (!normalized) return;
    weights.set(normalized, (weights.get(normalized) || 0) + weight);
  });
}

function sortedKeys(weights) {
  return Array.from(weights.entries())
    .sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      return a[0].localeCompare(b[0]);
    })
    .map(([token]) => token);
}

export function deriveInterestBuckets(journeys) {
  const empty = { all: [], searchable: [] };
  if (!Array.isArray(journeys) || journeys.length === 0) return empty;

  const allWeights = new Map();
  const searchableWeights = new Map();

  journeys.forEach((journey) => {
    // Primary: country and destination — always filled, directly searchable
    if (journey?.country) {
      accumulate(allWeights, [journey.country], WEIGHT_COUNTRY);
      accumulate(searchableWeights, [journey.country], WEIGHT_COUNTRY);
    }
    if (journey?.destination) {
      accumulate(allWeights, [journey.destination], WEIGHT_DESTINATION);
      accumulate(searchableWeights, [journey.destination], WEIGHT_DESTINATION);
    }

    // Secondary: visited locations — commonly filled
    if (Array.isArray(journey?.visitedLocations)) {
      accumulate(allWeights, journey.visitedLocations, WEIGHT_VISITED);
      accumulate(searchableWeights, journey.visitedLocations, WEIGHT_VISITED);
    }

    // Supplementary: BGM fields — optional, used when present
    accumulate(allWeights, journey?.bgmActivityTags, WEIGHT_ACTIVITY);
    accumulate(allWeights, journey?.bgmCustomKeywords, WEIGHT_CUSTOM);
    accumulate(allWeights, journey?.bgmMoodTags, WEIGHT_MOOD);
    accumulate(searchableWeights, journey?.bgmActivityTags, WEIGHT_ACTIVITY);
    accumulate(searchableWeights, journey?.bgmCustomKeywords, WEIGHT_CUSTOM);
  });

  return {
    all: sortedKeys(allWeights).slice(0, 6),
    searchable: sortedKeys(searchableWeights),
  };
}

export function deriveInterestKeywords(journeys, limit = 6) {
  return deriveInterestBuckets(journeys).all.slice(0, limit);
}

export function aggregateCommunityKeywordCounts(journeys) {
  const counts = new Map();
  if (!Array.isArray(journeys)) return counts;

  function add(token, weight) {
    const normalized = normalizeToken(token);
    if (!normalized) return;
    counts.set(normalized, (counts.get(normalized) || 0) + weight);
  }

  journeys.forEach((journey) => {
    // Primary: country names (weight 4) — most reliable, searchable via Places API
    if (journey?.country) add(journey.country, 4);

    // Secondary: destination city (weight 3)
    if (journey?.destination) add(journey.destination, 3);

    // Tertiary: visited locations (weight 2) — deduplicated per journey
    const visited = Array.isArray(journey?.visitedLocations) ? journey.visitedLocations : [];
    const seenVisited = new Set();
    visited.forEach((loc) => {
      const normalized = normalizeToken(loc);
      if (!normalized || seenVisited.has(normalized)) return;
      seenVisited.add(normalized);
      counts.set(normalized, (counts.get(normalized) || 0) + 2);
    });

    // Supplementary: BGM activity tags (weight 1) — may add interest variety
    const bgmTokens = [
      ...(Array.isArray(journey?.bgmActivityTags) ? journey.bgmActivityTags : []),
      ...(Array.isArray(journey?.bgmCustomKeywords) ? journey.bgmCustomKeywords : []),
    ];
    const seenBgm = new Set();
    bgmTokens.forEach((token) => {
      const normalized = normalizeToken(token);
      if (!normalized || seenBgm.has(normalized)) return;
      seenBgm.add(normalized);
      counts.set(normalized, (counts.get(normalized) || 0) + 1);
    });
  });

  return counts;
}

export function pickCommunityKeywordCounts(counts, excludeSet, limitCount = 3) {
  const blocked = excludeSet instanceof Set ? excludeSet : new Set();
  const sorted = Array.from(counts.entries())
    .filter(([token]) => Boolean(token))
    .sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      return a[0].localeCompare(b[0]);
    });

  const preferred = sorted.filter(([token]) => !blocked.has(token));
  if (preferred.length >= limitCount) return preferred.slice(0, limitCount);

  const backfill = sorted.filter(([token]) => blocked.has(token));
  return [...preferred, ...backfill].slice(0, limitCount);
}
