import { MOCK_TRIPS } from './mockTrips';

const SIMULATED_LATENCY_MS = 400;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Hub data service — abstracts the data source.
 * Currently returns mock data; interface is ready to swap to Firebase / REST.
 */
const HubService = {
  /**
   * Fetch all trips for a given user.
   * @param {string} _userId - unused in mock, kept for interface parity
   * @returns {Promise<import('./tripModel').Trip[]>}
   */
  async fetchTrips(_userId) {
    await delay(SIMULATED_LATENCY_MS);
    return [...MOCK_TRIPS];
  },
};

export default HubService;
