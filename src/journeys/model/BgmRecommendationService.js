const JAMENDO_TRACKS_ENDPOINT = 'https://api.jamendo.com/v3.0/tracks';
const JAMENDO_CLIENT_ID = process.env.EXPO_PUBLIC_JAMENDO_CLIENT_ID || '';
const JAMENDO_AUDIO_FORMAT = 'mp32';
const QUERY_COUNT_LIMIT = 6;
const QUERY_RESULT_LIMIT = 18;

const MOOD_HINTS = {
  chill: ['lofi', 'ambient', 'acoustic', 'downtempo', 'instrumental'],
  happy: ['upbeat', 'pop', 'funk', 'dance', 'feel good'],
  romantic: ['love songs', 'r&b', 'soul', 'ballad', 'acoustic'],
  nostalgic: ['retro', 'classic', 'city pop', 'indie', 'soft rock'],
  cinematic: ['soundtrack', 'orchestral', 'instrumental', 'epic', 'movie'],
  adventurous: ['indie rock', 'electronic', 'house', 'synthwave', 'road trip'],
};

const ACTIVITY_HINTS = {
  roadtrip: ['road trip', 'indie rock', 'alt pop', 'driving'],
  hiking: ['folk', 'acoustic', 'ambient', 'nature'],
  beach: ['tropical house', 'reggae', 'summer', 'chill'],
  citywalk: ['lofi', 'jazzhop', 'soul', 'chillhop'],
  nightlife: ['dance', 'edm', 'house', 'club'],
  cafe: ['jazz', 'bossa nova', 'acoustic', 'chill'],
};

const COUNTRY_HINTS = {
  japan: ['j-pop', 'city pop', 'lofi'],
  france: ['french pop', 'chanson', 'nu jazz'],
  italy: ['italian pop', 'acoustic', 'cinematic'],
  spain: ['latin pop', 'flamenco', 'guitar'],
  sweden: ['scandi pop', 'electronic', 'indie pop'],
  korea: ['k-pop', 'r&b', 'electro pop'],
  usa: ['indie pop', 'hip-hop', 'rock'],
};

const SEASON_HINTS = {
  spring: ['fresh', 'bloom', 'indie pop'],
  summer: ['summer', 'tropical', 'beach'],
  autumn: ['warm', 'acoustic', 'folk'],
  winter: ['cozy', 'piano', 'ambient'],
};

const ENERGY_HINTS = {
  1: ['calm', 'ambient', 'soft'],
  2: ['chill', 'lofi', 'acoustic'],
  3: ['indie', 'feel good', 'travel'],
  4: ['upbeat', 'dance', 'electronic'],
  5: ['high energy', 'party', 'edm'],
};

const HIGH_ENERGY_WORDS = [
  'dance',
  'edm',
  'party',
  'club',
  'upbeat',
  'electro',
  'house',
  'trap',
  'drum',
  'fast',
  'workout',
];

const LOW_ENERGY_WORDS = [
  'ambient',
  'acoustic',
  'piano',
  'soft',
  'calm',
  'chill',
  'lofi',
  'study',
  'sleep',
  'slow',
  'meditation',
];

function getJamendoClientId() {
  if (!JAMENDO_CLIENT_ID) {
    throw new Error('Jamendo client id is not configured.');
  }
  return JAMENDO_CLIENT_ID;
}

function normalizeTokenList(value) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item || '').trim().toLowerCase())
      .filter(Boolean);
  }

  return String(value)
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function uniqueList(value) {
  return [...new Set(value.filter(Boolean))];
}

function clampEnergyLevel(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 3;
  return Math.min(5, Math.max(1, Math.round(n)));
}

function getSeasonKeyword(startDate) {
  const date = startDate ? new Date(`${startDate}T00:00:00`) : null;
  const month = Number.isNaN(date?.getTime()) ? 6 : date.getMonth() + 1;

  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
}

function expandHints(keywords, dict) {
  const expanded = [];
  keywords.forEach((keyword) => {
    Object.entries(dict).forEach(([name, hints]) => {
      if (keyword.includes(name) || name.includes(keyword)) {
        expanded.push(...hints);
      }
    });
  });
  return uniqueList(expanded);
}

function tokenScore(text, tokens, pointsPerHit, maxHits) {
  if (!tokens.length) return 0;
  let hits = 0;
  tokens.forEach((token) => {
    if (text.includes(token)) {
      hits += 1;
    }
  });
  return Math.min(hits, maxHits) * pointsPerHit;
}

function estimateEnergyLevel(text) {
  let highHits = 0;
  let lowHits = 0;

  HIGH_ENERGY_WORDS.forEach((word) => {
    if (text.includes(word)) highHits += 1;
  });
  LOW_ENERGY_WORDS.forEach((word) => {
    if (text.includes(word)) lowHits += 1;
  });

  if (highHits === lowHits) return 3;
  if (highHits > lowHits + 2) return 5;
  if (highHits > lowHits) return 4;
  if (lowHits > highHits + 2) return 1;
  return 2;
}

function buildFeatureProfile(journey) {
  const moodKeywords = normalizeTokenList(journey.bgmMoodTags);
  const activityKeywords = normalizeTokenList(journey.bgmActivityTags);
  const preferredGenres = normalizeTokenList(journey.bgmPreferredGenres);
  const customKeywords = normalizeTokenList(journey.bgmCustomKeywords);
  const destinationKeywords = normalizeTokenList([journey.destination, journey.country]);
  const visitedKeywords = normalizeTokenList(journey.visitedLocations).slice(0, 3);
  const locationKeywords = uniqueList([...destinationKeywords, ...visitedKeywords]);

  const countryKey = String(journey.country || '').trim().toLowerCase();
  const countryHints = uniqueList(COUNTRY_HINTS[countryKey] || []);
  const moodHints = expandHints(moodKeywords, MOOD_HINTS);
  const activityHints = expandHints(activityKeywords, ACTIVITY_HINTS);

  const energyLevel = clampEnergyLevel(journey.bgmEnergyLevel);
  const season = getSeasonKeyword(journey.startDate);
  const seasonHints = SEASON_HINTS[season] || [];
  const energyHints = ENERGY_HINTS[energyLevel] || [];

  return {
    moodKeywords,
    activityKeywords,
    preferredGenres,
    customKeywords,
    locationKeywords,
    countryHints,
    moodHints,
    activityHints,
    energyHints,
    energyLevel,
    season,
    seasonHints,
  };
}

function buildQueryTerms(journey, profile) {
  const destination = String(journey.destination || journey.country || 'travel').trim();
  const country = String(journey.country || '').trim();
  const primaryGenre = profile.preferredGenres[0] || profile.countryHints[0] || 'indie';
  const primaryMood = profile.moodKeywords[0] || profile.moodHints[0] || 'chill';
  const primaryActivity = profile.activityKeywords[0] || 'travel';
  const primaryCustom = profile.customKeywords[0] || '';
  const primaryEnergy = profile.energyHints[0] || 'travel vibes';

  const queryTerms = [
    `${destination} ${primaryGenre} travel music`,
    `${country} ${primaryMood} background music`,
    `${primaryActivity} ${primaryMood} instrumental`,
    `${profile.season} ${primaryEnergy} travel playlist`,
    `${primaryGenre} road trip`,
    'travel vlog background music',
  ];

  if (primaryCustom) {
    queryTerms.unshift(`${primaryCustom} ${primaryGenre} travel`);
  }

  return uniqueList(
    queryTerms
      .map((item) => item.replace(/\s+/g, ' ').trim())
      .filter(Boolean),
  ).slice(0, QUERY_COUNT_LIMIT);
}

function getJamendoTags(track) {
  const tags = [];
  const musicinfo = track?.musicinfo || {};
  const tagGroups = musicinfo.tags || {};

  if (Array.isArray(tagGroups.genres)) tags.push(...tagGroups.genres);
  if (Array.isArray(tagGroups.instruments)) tags.push(...tagGroups.instruments);
  if (Array.isArray(tagGroups.vartags)) tags.push(...tagGroups.vartags);
  if (musicinfo.vocalinstrumental) tags.push(musicinfo.vocalinstrumental);
  if (musicinfo.acousticelectric) tags.push(musicinfo.acousticelectric);
  if (musicinfo.speed) tags.push(musicinfo.speed);

  return tags
    .map((item) => String(item || '').trim().toLowerCase())
    .filter(Boolean);
}

function speedScore(speed) {
  if (speed === 'veryhigh') return 2;
  if (speed === 'high') return 1;
  if (speed === 'low') return -1;
  if (speed === 'verylow') return -2;
  return 0;
}

async function fetchTracksByQuery(queryTerm) {
  const clientId = getJamendoClientId();
  console.log(`[DEBUG] 实际读取到的 Client ID 是: >>>${clientId}<<<，长度: ${clientId.length}`);
  const params = new URLSearchParams({
    client_id: clientId,
    format: 'json',
    limit: String(QUERY_RESULT_LIMIT),
    search: queryTerm,
    order: 'relevance',
    audioformat: JAMENDO_AUDIO_FORMAT,
    include: 'musicinfo',
  });

  console.debug('[BGM] Jamendo search:', queryTerm);

  let response;
  try {
    response = await fetch(`${JAMENDO_TRACKS_ENDPOINT}?${params.toString()}`);
  } catch (error) {
    console.warn('[BGM] Jamendo search request failed:', queryTerm, error?.message || error);
    throw error;
  }

  if (!response.ok) {
    console.warn('[BGM] Jamendo API request failed:', {
      query: queryTerm,
      status: response.status,
      statusText: response.statusText,
    });
    throw new Error(`BGM API request failed (${response.status})`);
  }

  const payload = await response.json();
  const status = payload?.headers?.status || '';
  const errorMessage = payload?.headers?.error_message || '';
  if (status && status !== 'success') {
    console.warn('[BGM] Jamendo API error:', {
      query: queryTerm,
      status,
      errorMessage,
    });
    throw new Error(errorMessage || 'Jamendo API error.');
  }

  const results = Array.isArray(payload?.results) ? payload.results : [];
  const previewResults = results.filter(
    (item) => typeof item.audio === 'string' && item.audio,
  );
  console.debug('[BGM] Jamendo search results:', {
    query: queryTerm,
    total: results.length,
    withPreview: previewResults.length,
  });
  return previewResults;
}

function scoreTrack(track, profile, queryIndex) {
  const artistName = String(track.artist_name || '');
  const albumName = String(track.album_name || '');
  const tags = getJamendoTags(track);
  const text = [track.name, artistName, albumName, ...tags]
    .map((item) => String(item || '').toLowerCase())
    .join(' ');
  const genreText = tags.join(' ');

  let score = 0;
  score += tokenScore(genreText, profile.preferredGenres, 14, 2);
  score += tokenScore(text, profile.preferredGenres, 8, 3);
  score += tokenScore(text, profile.moodKeywords, 8, 3);
  score += tokenScore(text, profile.activityKeywords, 7, 2);
  score += tokenScore(text, profile.customKeywords, 8, 2);
  score += tokenScore(text, profile.locationKeywords, 6, 2);
  score += tokenScore(text, profile.countryHints, 7, 2);
  score += tokenScore(text, profile.moodHints, 6, 2);
  score += tokenScore(text, profile.activityHints, 6, 2);
  score += tokenScore(text, profile.seasonHints, 5, 2);
  score += tokenScore(text, profile.energyHints, 5, 2);

  const estimatedEnergy = estimateEnergyLevel(text);
  score += 12 - Math.abs(profile.energyLevel - estimatedEnergy) * 3;
  score += speedScore(String(track?.musicinfo?.speed || '').toLowerCase());

  if (tags.includes('instrumental')) {
    score += 3;
  }

  score += Math.max(0, 3 - queryIndex);
  return score;
}

function normalizeMatchedTrack(track, queryTerm, score) {
  const artistName = track.artist_name || 'Unknown Artist';
  const artworkUrl = track.image || track.album_image || '';
  const genre = Array.isArray(track?.musicinfo?.tags?.genres)
    ? track.musicinfo.tags.genres[0]
    : '';

  return {
    id: String(track.id || track.audio),
    trackName: track.name || 'Unknown Track',
    artistName,
    genre,
    previewUrl: track.audio,
    artworkUrl,
    source: 'Jamendo',
    externalUrl: track.shareurl || track.shorturl || '',
    matchedBy: queryTerm,
    matchScore: Math.round(score * 100) / 100,
  };
}

export const BgmRecommendationService = {
  async recommendJourneyBgm(journey) {
    if (!journey) return null;

    const profile = buildFeatureProfile(journey);
    const queryTerms = buildQueryTerms(journey, profile);
    const seenTrackIds = new Set();
    const scoredCandidates = [];

    for (let i = 0; i < queryTerms.length; i += 1) {
      const queryTerm = queryTerms[i];
      let tracks = [];

      try {
        tracks = await fetchTracksByQuery(queryTerm);
      } catch (error) {
        console.warn('BGM query failed:', queryTerm, error?.message || error);
        continue;
      }

      tracks.forEach((track) => {
        const id = String(track.id || track.audio || '');
        if (!id || seenTrackIds.has(id)) return;

        seenTrackIds.add(id);
        const score = scoreTrack(track, profile, i);
        scoredCandidates.push(normalizeMatchedTrack(track, queryTerm, score));
      });
    }

    if (!scoredCandidates.length) {
      return null;
    }

    scoredCandidates.sort((a, b) => b.matchScore - a.matchScore);
    return scoredCandidates[0];
  },
};
