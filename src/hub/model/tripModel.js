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
 * @property {string}       destination  - city / region name
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
 * Filter trips by optional year and month.
 * @param {Trip[]} trips
 * @param {number | null} year
 * @param {number | null} month - 0-indexed (0 = Jan)
 * @returns {Trip[]}
 */
export function filterTrips(trips, year, month) {
  return trips.filter((trip) => {
    const d = new Date(trip.startDate);
    if (year !== null && d.getFullYear() !== year) return false;
    if (month !== null && d.getMonth() !== month) return false;
    return true;
  });
}

/**
 * Extract distinct years from trips, sorted ascending.
 * @param {Trip[]} trips
 * @returns {number[]}
 */
export function extractYears(trips) {
  const s = new Set(trips.map((t) => new Date(t.startDate).getFullYear()));
  return [...s].sort((a, b) => a - b);
}

/**
 * Extract distinct months (0-11) from trips, sorted ascending.
 * @param {Trip[]} trips
 * @returns {number[]}
 */
export function extractMonths(trips) {
  const s = new Set(trips.map((t) => new Date(t.startDate).getMonth()));
  return [...s].sort((a, b) => a - b);
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
    .map((t) => t.coordinates);
}
