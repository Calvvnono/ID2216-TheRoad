import React from 'react';
import { observer } from 'mobx-react-lite';
import { discoverStore } from '../model/DiscoverStore';
import { DiscoverPersistence } from '../persistence/DiscoverPersistence';
import { DiscoverScreen } from '../view/DiscoverScreen';

const DiscoverPresenter = {
  init() {
    DiscoverPersistence.init();
  },

  reload() {
    DiscoverPersistence.loadAll();
  },

  onToggleWishlist(place) {
    DiscoverPersistence.updateWishlistLiked(place, !place.isInWishlist);
  },

  onUnlikePlace(place) {
    DiscoverPersistence.updateWishlistLiked(place, false);
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
    DiscoverPersistence.openPlaceDetail(place);
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

const discoverPresenterProps = {
  onInit: () => DiscoverPresenter.init(),
  onReload: () => DiscoverPresenter.reload(),
  onToggleWishlist: (place) => DiscoverPresenter.onToggleWishlist(place),
  onUnlikePlace: (place) => DiscoverPresenter.onUnlikePlace(place),
  onPlacePress: (place) => DiscoverPresenter.onPlacePress(place),
  onCloseDetail: () => DiscoverPresenter.onCloseDetail(),
};

function DiscoverPresenterView() {
  const props = {
    loadStatus: DiscoverPresenter.getLoadStatus(),
    errorMessage: DiscoverPresenter.getErrorMessage(),
    topPicks: DiscoverPresenter.getTopPicks(),
    communityInsights: DiscoverPresenter.getCommunityInsights(),
    wishToggleStatus: DiscoverPresenter.getWishToggleStatus(),
    selectedPlace: DiscoverPresenter.getSelectedPlace(),
    placeDetail: DiscoverPresenter.getPlaceDetail(),
    detailStatus: DiscoverPresenter.getDetailStatus(),
    ...discoverPresenterProps,
  };

  return <DiscoverScreen {...props} />;
}

export default observer(DiscoverPresenterView);
