import { makeAutoObservable } from 'mobx';

class DiscoverStoreClass {
  topPicks = [];

  communityInsights = [];

  loadStatus = 'idle';

  errorMessage = null;

  wishTogglingMap = {};

  selectedPlace = null;

  placeDetail = null;

  detailStatus = 'idle';

  constructor() {
    makeAutoObservable(this);
  }

  setLoadStarted() {
    this.loadStatus = 'loading';
    this.errorMessage = null;
  }

  setDiscoverData(topPicks, communityInsights) {
    this.topPicks = topPicks;
    this.communityInsights = communityInsights;
    this.loadStatus = 'success';
  }

  setLoadError(message) {
    this.loadStatus = 'error';
    this.errorMessage = message;
  }

  setWishToggleStarted(placeId) {
    this.wishTogglingMap = { ...this.wishTogglingMap, [placeId]: true };
    this.errorMessage = null;
  }

  setTopPickLiked(placeId, liked) {
    this.topPicks = this.topPicks.map((p) =>
      p.id === placeId ? { ...p, isInWishlist: liked } : p,
    );
    const next = { ...this.wishTogglingMap };
    delete next[placeId];
    this.wishTogglingMap = next;
  }

  setWishToggleError(placeId, message) {
    const next = { ...this.wishTogglingMap };
    delete next[placeId];
    this.wishTogglingMap = next;
    this.errorMessage = message;
  }

  setSelectedPlaceLoading(place) {
    this.selectedPlace = place;
    this.placeDetail = null;
    this.detailStatus = 'loading';
  }

  setPlaceDetail(detail) {
    this.placeDetail = detail;
    this.detailStatus = detail ? 'success' : 'error';
  }

  closeDetail() {
    this.selectedPlace = null;
    this.placeDetail = null;
    this.detailStatus = 'idle';
  }
}

export const discoverStore = new DiscoverStoreClass();
