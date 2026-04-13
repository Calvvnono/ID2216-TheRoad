import { MOCK_TRIPS } from './mockTrips';

/** @type {Map<string, import('./tripModel').Coordinates>} */
const coordByDestination = new Map();
for (const t of MOCK_TRIPS) {
  const key = String(t.destination || '')
    .trim()
    .toLowerCase();
  if (key && !coordByDestination.has(key)) {
    coordByDestination.set(key, {
      latitude: Number(t.coordinates.latitude),
      longitude: Number(t.coordinates.longitude),
    });
  }
}

/**
 * Deterministic pseudo-coordinates when destination is not in mock lookup.
 * @param {string} s
 * @returns {import('./tripModel').Coordinates}
 */
function hashStringToLatLng(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i += 1) {
    h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  }
  const u = h >>> 0;
  const lat = ((u % 17001) / 100) - 85;
  const lng = ((((u / 17001) | 0) >>> 0) % 36001) / 100 - 180;
  return { latitude: lat, longitude: lng };
}

/**
 * @param {string} destination
 * @param {string} country
 * @returns {import('./tripModel').Coordinates}
 */
export function coordinatesForDestination(destination, country) {
  const key = String(destination || '')
    .trim()
    .toLowerCase();
  if (coordByDestination.has(key)) {
    const c = coordByDestination.get(key);
    return { latitude: c.latitude, longitude: c.longitude };
  }
  return hashStringToLatLng(`${destination}|${country}`);
}

/** True when coordinates come from hub mock table (no Places lookup needed). */
export function isDestinationInMockLookup(destination) {
  const key = String(destination || '')
    .trim()
    .toLowerCase();
  return coordByDestination.has(key);
}

function toNonNegativeNumber(value, fallback = 0) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, n);
}

function toPositiveInt(value, fallback = 0) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.round(n));
}

/**
 * Map a Firestore `users/{uid}/journeys` document to Hub `Trip`.
 * @param {Record<string, unknown>} raw
 * @param {string} docId
 * @returns {import('./tripModel').Trip}
 */
export function mapFirestoreDocToTrip(raw, docId) {
  const id = docId || String(raw.id || '') || `trip-${Date.now()}`;
  const destination = String(raw.destination || 'Untitled').trim();
  const country = String(raw.country || 'Unknown').trim();
  let startDate = String(raw.startDate || '').trim();
  let endDate = String(raw.endDate || '').trim();
  if (!startDate) startDate = '2000-01-01';
  if (!endDate) endDate = startDate;

  const spent = toNonNegativeNumber(raw.spent, 0);
  const dailyExpenses = Array.isArray(raw.dailyExpenses)
    ? raw.dailyExpenses
        .map((n) => Number(n))
        .filter((n) => Number.isFinite(n) && n >= 0)
    : [];
  const photos = toPositiveInt(raw.photos, 0);

  /** @type {import('./tripModel').Expense[]} */
  let expenses;
  if (dailyExpenses.length > 0) {
    expenses = dailyExpenses.map((amount, i) => ({
      category: `Day ${i + 1}`,
      amount,
      currency: 'USD',
    }));
  } else {
    expenses = [{ category: 'Total', amount: spent, currency: 'USD' }];
  }

  return {
    id,
    destination,
    country,
    startDate,
    endDate,
    coordinates: coordinatesForDestination(destination, country),
    expenses,
    photos,
    companions: [],
  };
}
