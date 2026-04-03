/**
 * JourneysService — mock-only data source for Journeys list page.
 * No Firebase/API in this version.
 */

const MOCK_JOURNEYS = [
  {
    id: 'journey-tokyo-2024',
    destination: 'Tokyo',
    country: 'Japan',
    travelDates: 'Mar 1-8, 2024',
    durationLabel: '7 Days',
    spent: 2450,
    photos: 142,
    places: 18,
    imageUrl:
      'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=1200&h=700&fit=crop',
  },
  {
    id: 'journey-paris-2024',
    destination: 'Paris',
    country: 'France',
    travelDates: 'Jan 15-22, 2024',
    durationLabel: '7 Days',
    spent: 2450,
    photos: 142,
    places: 18,
    imageUrl:
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&h=700&fit=crop',
  },
  {
    id: 'journey-seoul-2023',
    destination: 'Seoul',
    country: 'South Korea',
    travelDates: 'Nov 10-20, 2023',
    durationLabel: '10 Days',
    spent: 3120,
    photos: 211,
    places: 24,
    imageUrl:
      'https://images.unsplash.com/photo-1538485399081-7c8979e6f5b1?w=1200&h=700&fit=crop',
  },
];

const SIMULATED_LATENCY_MS = 180;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const JourneysService = {
  async fetchJourneys() {
    await wait(SIMULATED_LATENCY_MS);
    return MOCK_JOURNEYS.map((item) => ({ ...item }));
  },
};
