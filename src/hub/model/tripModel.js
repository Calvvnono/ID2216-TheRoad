/**
 * @typedef {Object} Coordinates
 * @property {number} latitude
 * @property {number} longitude
 */

/**
 * @typedef {Object} Expense
 * @property {string} category   - e.g. "Food", "Transport", "Accommodation"
 * @property {number} amount     - numeric value in the trip's currency
 * @property {string} currency   - ISO 4217 code, e.g. "USD"
 */

/**
 * @typedef {Object} Trip
 * @property {string}       id
 * @property {string}       destination  - city / region name (display / grouping key)
 * @property {string}       [destinationEn] - English label for map UI; falls back to destination
 * @property {string}       country
 * @property {string}       startDate    - ISO 8601 date string "YYYY-MM-DD"
 * @property {string}       endDate      - ISO 8601 date string "YYYY-MM-DD"
 * @property {Coordinates}  coordinates
 * @property {Expense[]}    expenses
 * @property {number}       photos       - count of photos taken
 * @property {string[]}     companions   - names of travel companions
 */

// ── Trip domain helpers ─────────────────────────────────

/**
 * Plain { latitude, longitude } — avoids passing MobX observables to native/third-party code.
 * @param {Coordinates} c
 * @returns {Coordinates}
 */
export function copyCoordinates(c) {
  return {
    latitude: Number(c.latitude),
    longitude: Number(c.longitude),
  };
}

/**
 * Number of calendar days between two ISO date strings (inclusive).
 * @param {string} start
 * @param {string} end
 * @returns {number}
 */
export function daysBetween(start, end) {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(1, Math.round(ms / 86400000) + 1);
}

/**
 * Duration of a single trip in days.
 * @param {Trip} trip
 * @returns {number}
 */
export function tripDays(trip) {
  return daysBetween(trip.startDate, trip.endDate);
}

/**
 * Total expense amount for a single trip.
 * @param {Trip} trip
 * @returns {number}
 */
export function tripTotalExpense(trip) {
  return trip.expenses.reduce((sum, e) => sum + e.amount, 0);
}

/**
 * Earliest trip start and latest trip end (ms), for continuous time scrubber.
 * @param {Trip[]} trips
 * @returns {{ minMs: number, maxMs: number }}
 */
export function tripsTimeBounds(trips) {
  if (!trips.length) {
    const n = Date.now();
    return { minMs: n, maxMs: n };
  }
  let minMs = Infinity;
  let maxMs = -Infinity;
  for (const t of trips) {
    const a = new Date(t.startDate).getTime();
    const b = new Date(t.endDate).getTime();
    minMs = Math.min(minMs, a);
    maxMs = Math.max(maxMs, b);
  }
  return { minMs, maxMs };
}

/**
 * Trips whose journey has started on or before the cutoff instant.
 * @param {Trip[]} trips
 * @param {number} cutoffMs
 * @returns {Trip[]}
 */
export function filterTripsByTimeEnd(trips, cutoffMs) {
  return trips.filter((t) => new Date(t.startDate).getTime() <= cutoffMs);
}

/**
 * Chronological route coordinates from a set of trips.
 * @param {Trip[]} trips
 * @returns {Coordinates[]}
 */
export function tripRouteCoordinates(trips) {
  return trips
    .slice()
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
    .map((t) => copyCoordinates(t.coordinates));
}
