import { makeAutoObservable } from 'mobx';

class DiscoverStoreClass {
  topPicks = [];

  communityInsights = [];

  loadStatus = 'idle';

  errorMessage = null;

  wishToggleStatus = 'idle';

  selectedPlace = null;

  placeDetail = null;

  detailStatus = 'idle';

  get topPicksViewModel() {
    return this.topPicks.map((place) => ({
      ...place,
      heartIconName: place.isInWishlist ? 'heart' : 'heart-outline',
      heartActive: !!place.isInWishlist,
    }));
  }

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

  setWishToggleStarted() {
    this.wishToggleStatus = 'loading';
    this.errorMessage = null;
  }

  setTopPickLiked(placeId, liked) {
    this.topPicks = this.topPicks.map((p) =>
      p.id === placeId ? { ...p, isInWishlist: liked } : p,
    );
    this.wishToggleStatus = 'idle';
  }

  setWishToggleError(message) {
    this.wishToggleStatus = 'idle';
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
