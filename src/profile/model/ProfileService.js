/**
 * ProfileService — Persistence concern.
 *
 * This is the ONLY place where Firebase/API/AsyncStorage calls belong.
 * Currently returns mock data via async interface.
 * When Firebase is wired in, only this file changes — Store/Presenter/View stay untouched.
 *
 * Call direction: Store → Service (never View → Service)
 */

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

const MOCK_PROFILE = {
  id: 'user-001',
  name: 'Alex Rivera',
  avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop',
  badgeLabel: 'Globetrotter',
  badgeLevel: 7,
};

const MOCK_WISHLIST = [
  {
    id: 'kyoto-autumn',
    name: 'Kyoto Autumn',
    imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=300&h=300&fit=crop',
  },
  {
    id: 'santorini',
    name: 'Santorini',
    imageUrl: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=300&h=300&fit=crop',
  },
  {
    id: 'northern-lights',
    name: 'Northern Lights',
    imageUrl: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=300&h=300&fit=crop',
  },
];

const MOCK_PREFERENCES = {
  budgetPerDay: 200,
  currency: 'USD',
  favoriteActivities: ['Culture', 'Adventure', 'Food', 'Nature', 'Photography'],
};

export const ProfileService = {
  /** @returns {Promise<Object>} */
  async fetchProfile(/* uid */) {
    await delay(600);
    return MOCK_PROFILE;
  },

  /** @returns {Promise<Object[]>} */
  async fetchWishlist(/* uid */) {
    await delay(400);
    return MOCK_WISHLIST;
  },

  /** @returns {Promise<Object>} */
  async fetchPreferences(/* uid */) {
    await delay(300);
    return MOCK_PREFERENCES;
  },

  /** @returns {Promise<void>} */
  async savePreferences(/* uid, prefs */) {
    await delay(200);
  },

  /** @returns {Promise<string>} */
  async exportUserData(/* uid */) {
    await delay(800);
    return 'export-complete';
  },
};
