import { discoverStore } from '../model/DiscoverStore';

/**
 * DiscoverPresenter — Presenter/Controller concern.
 *
 * Reads state from store and exposes user-intent actions for views.
 * Never imports persistence services directly.
 */
export const DiscoverPresenter = {
  init() {
    if (discoverStore.loadStatus === 'idle') {
      discoverStore.loadAll();
    }
  },

  reload() {
    discoverStore.loadAll();
  },

  onSearchChange(query) {
    discoverStore.setSearchQuery(query);
  },

  getLoadStatus() {
    return discoverStore.loadStatus;
  },

  getErrorMessage() {
    return discoverStore.errorMessage;
  },

  getSearchQuery() {
    return discoverStore.searchQuery;
  },

  getDestinations() {
    return discoverStore.filteredDestinations;
  },

  getInsights() {
    return discoverStore.insights;
  },
};

