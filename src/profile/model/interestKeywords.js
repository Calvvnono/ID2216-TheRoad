const WEIGHT_ACTIVITY = 3;
const WEIGHT_CUSTOM = 3;
const WEIGHT_MOOD = 2;
const WEIGHT_COUNTRY = 1;

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
    accumulate(allWeights, journey?.bgmActivityTags, WEIGHT_ACTIVITY);
    accumulate(allWeights, journey?.bgmCustomKeywords, WEIGHT_CUSTOM);
    accumulate(allWeights, journey?.bgmMoodTags, WEIGHT_MOOD);
    if (journey?.country) {
      accumulate(allWeights, [journey.country], WEIGHT_COUNTRY);
    }

    accumulate(searchableWeights, journey?.bgmActivityTags, WEIGHT_ACTIVITY);
    accumulate(searchableWeights, journey?.bgmCustomKeywords, WEIGHT_CUSTOM);
    if (journey?.country) {
      accumulate(searchableWeights, [journey.country], WEIGHT_COUNTRY);
    }
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

  journeys.forEach((journey) => {
    const tokens = [
      ...(Array.isArray(journey?.bgmActivityTags) ? journey.bgmActivityTags : []),
      ...(Array.isArray(journey?.bgmCustomKeywords) ? journey.bgmCustomKeywords : []),
    ];
    const unique = new Set();
    tokens.forEach((token) => {
      const normalized = normalizeToken(token);
      if (!normalized) return;
      unique.add(normalized);
    });
    unique.forEach((token) => {
      counts.set(token, (counts.get(token) || 0) + 1);
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
