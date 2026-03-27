import { makeAutoObservable, runInAction } from 'mobx';
import { DiscoverService } from './DiscoverService';

/**
 * DiscoverStore — Application State concern (MobX).
 *
 * Owns async status + UI state.
 * All persistence side effects must go through this store.
 */
class DiscoverStoreClass {
  /** @type {Object[]} */
  destinations = [];

  /** @type {Object | null} */
  insights = null;

  /** @type {string} */
  searchQuery = '';

  /** @type {'idle' | 'loading' | 'success' | 'error'} */
  loadStatus = 'idle';

  /** @type {string | null} */
  errorMessage = null;

  constructor() {
    makeAutoObservable(this);
  }

  get filteredDestinations() {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) return this.destinations;
    return this.destinations.filter(
      (d) =>
        d.name.toLowerCase().includes(q) || d.country.toLowerCase().includes(q),
    );
  }

  async loadAll() {
    this.loadStatus = 'loading';
    this.errorMessage = null;
    try {
      const [destinations, insights] = await Promise.all([
        DiscoverService.fetchDestinations(),
        DiscoverService.fetchInsights(),
      ]);
      runInAction(() => {
        this.destinations = destinations;
        this.insights = insights;
        this.loadStatus = 'success';
      });
    } catch (e) {
      runInAction(() => {
        this.loadStatus = 'error';
        this.errorMessage = e.message ?? 'Failed to load discover data';
      });
    }
  }

  setSearchQuery(query) {
    this.searchQuery = query;
  }
}

export const discoverStore = new DiscoverStoreClass();

