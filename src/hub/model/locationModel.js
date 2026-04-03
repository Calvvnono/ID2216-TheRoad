import { tripDays, tripTotalExpense, copyCoordinates } from './tripModel';

/**
 * @typedef {Object} AggregatedLocation
 * @property {string}       id
 * @property {string}       name         - city / region (same as trip.destination)
 * @property {string}       nameEn       - English label for map (destinationEn or destination)
 * @property {string}       country
 * @property {import('./tripModel').Coordinates} coordinates
 * @property {string[]}     tripIds
 * @property {number}       visitCount
 * @property {number}       totalSpent
 * @property {number}       totalDays
 * @property {Object.<string,number>} expensesByCategory
 */

/**
 * @typedef {Object} TripStats
 * @property {number} totalTrips
 * @property {number} totalDays
 * @property {number} totalExpenses
 */

/**
 * Group trips by destination into aggregated location objects.
 * @param {import('./tripModel').Trip[]} trips
 * @returns {AggregatedLocation[]}
 */
export function aggregateLocations(trips) {
  /** @type {Map<string, AggregatedLocation>} */
  const map = new Map();

  for (const trip of trips) {
    const key = trip.destination;
    if (!map.has(key)) {
      const nameEn =
        (trip.destinationEn && String(trip.destinationEn).trim()) ||
        trip.destination;
      map.set(key, {
        id: key,
        name: trip.destination,
        nameEn,
        country: trip.country,
        coordinates: copyCoordinates(trip.coordinates),
        tripIds: [],
        visitCount: 0,
        totalSpent: 0,
        totalDays: 0,
        expensesByCategory: {},
      });
    }
    const loc = map.get(key);
    loc.tripIds.push(trip.id);
    loc.visitCount += 1;
    loc.totalDays += tripDays(trip);
    for (const exp of trip.expenses) {
      loc.totalSpent += exp.amount;
      loc.expensesByCategory[exp.category] =
        (loc.expensesByCategory[exp.category] || 0) + exp.amount;
    }
  }

  return [...map.values()];
}

/**
 * Compute summary stats for a set of trips.
 * @param {import('./tripModel').Trip[]} trips
 * @returns {TripStats}
 */
export function computeStats(trips) {
  return {
    totalTrips: trips.length,
    totalDays: trips.reduce((sum, t) => sum + tripDays(t), 0),
    totalExpenses: trips.reduce((sum, t) => sum + tripTotalExpense(t), 0),
  };
}
