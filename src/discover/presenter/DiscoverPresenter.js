import { discoverStore } from '../model/DiscoverStore';

export const DiscoverPresenter = {
  init() {
    discoverStore.init();
  },

  reload() {
    discoverStore.loadAll();
  },

  onToggleWishlist(place) {
    discoverStore.setWishlistLiked(place, !place.isInWishlist);
  },

  onUnlikePlace(place) {
    discoverStore.setWishlistLiked(place, false);
  },

  getLoadStatus() {
    return discoverStore.loadStatus;
  },

  getErrorMessage() {
    return discoverStore.errorMessage;
  },

  getTopPicks() {
    return discoverStore.topPicksViewModel;
  },

  getCommunityInsights() {
    return discoverStore.communityInsights;
  },

  getWishToggleStatus() {
    return discoverStore.wishToggleStatus;
  },

  onPlacePress(place) {
    discoverStore.openPlaceDetail(place);
  },

  onCloseDetail() {
    discoverStore.closeDetail();
  },

  getSelectedPlace() {
    return discoverStore.selectedPlace;
  },

  getPlaceDetail() {
    return discoverStore.placeDetail;
  },

  getDetailStatus() {
    return discoverStore.detailStatus;
  },
};
