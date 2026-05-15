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

  onPlacePress(place) {
    DiscoverPersistence.openPlaceDetail(place);
  },

  onCloseDetail() {
    discoverStore.closeDetail();
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
  const topPicks = discoverStore.topPicks.map((place) => ({
    ...place,
    heartIconName: place.isInWishlist ? 'heart' : 'heart-outline',
    heartActive: !!place.isInWishlist,
    isToggling: !!discoverStore.wishTogglingMap[place.id],
  }));

  const props = {
    loadStatus: discoverStore.loadStatus,
    errorMessage: discoverStore.errorMessage,
    topPicks,
    communityInsights: discoverStore.communityInsights,
    selectedPlace: discoverStore.selectedPlace,
    placeDetail: discoverStore.placeDetail,
    detailStatus: discoverStore.detailStatus,
    ...discoverPresenterProps,
  };

  return <DiscoverScreen {...props} />;
}

export default observer(DiscoverPresenterView);
