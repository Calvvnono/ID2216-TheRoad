/**
 * DiscoverService — Persistence concern.
 *
 * The only place where remote APIs / persistence calls should live.
 * Currently returns mock async data to preserve architecture shape.
 */

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const MOCK_DESTINATIONS = [
  {
    id: 'lisbon',
    name: 'Lisbon',
    country: 'Portugal',
    imageUrl:
      'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=600&h=400&fit=crop',
    reason: 'Coastal city with vibrant street culture',
  },
  {
    id: 'queenstown',
    name: 'Queenstown',
    country: 'New Zealand',
    imageUrl:
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&h=400&fit=crop',
    reason: 'Great for hiking and adventure itineraries',
  },
  {
    id: 'kyoto',
    name: 'Kyoto',
    country: 'Japan',
    imageUrl:
      'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=600&h=400&fit=crop',
    reason: 'Temples, food, and seasonal scenery',
  },
];

const MOCK_INSIGHTS = {
  trendTag: 'Popular this week',
  suggestion: 'Try destinations with mild weather and direct flights.',
};

export const DiscoverService = {
  /** @returns {Promise<Object[]>} */
  async fetchDestinations() {
    await delay(500);
    return MOCK_DESTINATIONS;
  },

  /** @returns {Promise<Object>} */
  async fetchInsights() {
    await delay(300);
    return MOCK_INSIGHTS;
  },
};

