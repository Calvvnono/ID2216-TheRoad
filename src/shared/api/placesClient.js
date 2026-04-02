/**
 * placesClient — Google Places API (New) client.
 *
 * Handles all HTTP communication with the Places API.
 * Nothing here knows about app state, stores, or business logic.
 */

const API_KEY = 'AIzaSyAOMC2T678FvyyQ-mUrvnXKnFlRz2UiNrk';
const BASE = 'https://places.googleapis.com/v1';

// Embed region names in the query to get globally diverse results
// without relying on locationBias (which has a 50km radius limit)
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
  /**
   * Search tourist attractions by keyword + budget, biased to a world region
   * to ensure globally diverse results regardless of device IP.
   * @param {string} keyword  e.g. "Culture"
   * @param {number} budget   user's budgetPerDay in USD
   * @param {number} regionIndex  index into WORLD_REGIONS
   */
  async searchText(keyword, budget, regionIndex = 0) {
    const region = WORLD_REGIONS[regionIndex % WORLD_REGIONS.length];
    const budgetLabel = budget <= 100 ? 'budget' : budget <= 250 ? 'mid-range' : 'luxury';
    const res = await fetch(`${BASE}/places:searchText`, {
      method: 'POST',
      headers: headers(TEXT_SEARCH_FIELDS),
      body: JSON.stringify({
        textQuery: `famous ${keyword} ${budgetLabel} travel destinations ${region}`,
        languageCode: 'en',
        maxResultCount: 5,
      }),
    });
    const data = await handleResponse(res);
    return data.places ?? [];
  },

  /**
   * Search by place name — used as fallback to resolve a real Place ID
   * when only a name is known (e.g. mock community insight items).
   * @param {string} name  e.g. "Ubud Rice Terraces"
   */
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

  /**
   * Fetch full details for a single place by its Places API ID.
   * @param {string} placeId
   */
  async getPlaceDetail(placeId) {
    const res = await fetch(`${BASE}/places/${placeId}`, {
      method: 'GET',
      headers: headers(DETAIL_FIELDS),
    });
    return handleResponse(res);
  },

  /**
   * Build a photo media URL — no network call, used directly by <Image>.
   * @param {string} photoName  e.g. "places/ABC/photos/XYZ"
   */
  photoUrl(photoName) {
    return `${BASE}/${photoName}/media?maxWidthPx=600&key=${API_KEY}`;
  },
};
