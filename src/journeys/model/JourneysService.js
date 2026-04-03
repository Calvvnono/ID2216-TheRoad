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
    detailHeroImage:
      'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=1600&h=900&fit=crop',
    visitedLocations: ['Shibuya', 'Shinjuku', 'Asakusa'],
    dailyExpenses: [280, 340, 420, 300, 380, 290, 430],
    photoMemories: [
      'https://images.unsplash.com/photo-1554797589-7241bb691973?w=700&h=480&fit=crop',
      'https://images.unsplash.com/photo-1526481280695-3c4699d38b45?w=700&h=480&fit=crop',
      'https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=700&h=480&fit=crop',
    ],
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
    detailHeroImage:
      'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1600&h=900&fit=crop',
    visitedLocations: ['Louvre', 'Montmartre', 'Seine'],
    dailyExpenses: [250, 300, 390, 280, 410, 320, 500],
    photoMemories: [
      'https://images.unsplash.com/photo-1508057198894-247b23fe5ade?w=700&h=480&fit=crop',
      'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=700&h=480&fit=crop',
      'https://images.unsplash.com/photo-1549144511-f099e773c147?w=700&h=480&fit=crop',
    ],
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
    detailHeroImage:
      'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=1600&h=900&fit=crop',
    visitedLocations: ['Myeongdong', 'Hongdae', 'Bukchon'],
    dailyExpenses: [320, 360, 410, 380, 450, 340, 390, 420, 360, 410],
    photoMemories: [
      'https://images.unsplash.com/photo-1544085311-11a028465b03?w=700&h=480&fit=crop',
      'https://images.unsplash.com/photo-1536662788221-5a67ad7e2b43?w=700&h=480&fit=crop',
      'https://images.unsplash.com/photo-1528137871618-79d2761e3fd5?w=700&h=480&fit=crop',
    ],
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
