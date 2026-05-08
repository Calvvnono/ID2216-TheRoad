// Default: EXPO_PUBLIC_PLACES_API_KEY from `.env` or EAS.
// Optional embedded fallback: copy `embedded-google-api-key.example.json` →
// `embedded-google-api-key.json` (gitignored), then uncomment the two lines below.
// import embedded from '../../../embedded-google-api-key.json';

const API_KEY = process.env.EXPO_PUBLIC_PLACES_API_KEY;
// const API_KEY =
//   process.env.EXPO_PUBLIC_PLACES_API_KEY || embedded.googleApiKey;
const BASE = 'https://places.googleapis.com/v1';

const WORLD_REGIONS = [
  'Asia',
  'Europe Mediterranean',
  'South America',
  'Middle East Africa',
  'Oceania',
];

const TEXT_SEARCH_FIELDS = [
  'places.id',
  'places.displayName',
  'places.shortFormattedAddress',
  'places.photos',
  'places.editorialSummary',
].join(',');

const DETAIL_FIELDS = [
  'id',
  'displayName',
  'shortFormattedAddress',
  'photos',
  'editorialSummary',
  'rating',
  'userRatingCount',
  'websiteUri',
  'regularOpeningHours',
].join(',');

/** For Hub map pins — lat/lng from city + country. */
const GEOCODE_FIELDS = ['places.location', 'places.displayName'].join(',');

function headers(fieldMask) {
  return {
    'Content-Type': 'application/json',
    'X-Goog-Api-Key': API_KEY,
    'X-Goog-FieldMask': fieldMask,
  };
}

async function handleResponse(res) {
  if (!res.ok) throw new Error(`Places API error: ${res.status}`);
  return res.json();
}

export const placesClient = {
  async searchText(keyword, regionIndex = 0) {
    const region = WORLD_REGIONS[regionIndex % WORLD_REGIONS.length];
    const res = await fetch(`${BASE}/places:searchText`, {
      method: 'POST',
      headers: headers(TEXT_SEARCH_FIELDS),
      body: JSON.stringify({
        textQuery: `famous ${keyword} travel destinations ${region}`,
        languageCode: 'en',
        maxResultCount: 5,
      }),
    });
    const data = await handleResponse(res);
    return data.places ?? [];
  },

  async searchByName(name) {
    const res = await fetch(`${BASE}/places:searchText`, {
      method: 'POST',
      headers: headers(TEXT_SEARCH_FIELDS),
      body: JSON.stringify({
        textQuery: name,
        languageCode: 'en',
        maxResultCount: 1,
      }),
    });
    const data = await handleResponse(res);
    return data.places?.[0] ?? null;
  },

  async getPlaceDetail(placeId) {
    const res = await fetch(`${BASE}/places/${placeId}?languageCode=en`, {
      method: 'GET',
      headers: headers(DETAIL_FIELDS),
    });
    return handleResponse(res);
  },

  /**
   * Resolve coordinates for a city/region (Hub map pins for Firestore journeys without lat/lng).
   * @param {string} destination
   * @param {string} country
   * @returns {Promise<{ latitude: number, longitude: number } | null>}
   */
  async geocodeCity(destination, country) {
    if (!API_KEY?.trim()) return null;
    const textQuery = `${String(destination || '').trim()} ${String(country || '').trim()}`.trim();
    if (!textQuery) return null;
    const res = await fetch(`${BASE}/places:searchText`, {
      method: 'POST',
      headers: headers(GEOCODE_FIELDS),
      body: JSON.stringify({
        textQuery,
        languageCode: 'en',
        maxResultCount: 1,
      }),
    });
    const data = await handleResponse(res);
    const loc = data.places?.[0]?.location;
    if (
      loc &&
      typeof loc.latitude === 'number' &&
      typeof loc.longitude === 'number'
    ) {
      return { latitude: loc.latitude, longitude: loc.longitude };
    }
    return null;
  },

  photoUrl(photoName) {
    return `${BASE}/${photoName}/media?maxWidthPx=600&key=${API_KEY}`;
  },
};
