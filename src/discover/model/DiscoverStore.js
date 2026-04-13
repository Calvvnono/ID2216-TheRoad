import { makeAutoObservable, reaction, runInAction } from 'mobx';
import { profileStore } from '../../profile/model/ProfileStore';
import { DiscoverService } from './DiscoverService';

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
    reaction(
      () => {
        const prefs = profileStore.preferences;
        if (!prefs) return null;
        const activities = Array.isArray(prefs.favoriteActivities)
          ? prefs.favoriteActivities.join('|')
          : '';
        return `${prefs.budgetPerDay}|${activities}`;
      },
      (signature, previousSignature) => {
        if (!signature || signature === previousSignature) return;
        if (this.loadStatus === 'idle') return;
        void this.loadAll();
      },
    );
  }

  init() {
    if (this.loadStatus === 'idle') {
      this.loadAll();
    }
  }

  async loadAll() {
    this.loadStatus = 'loading';
    this.errorMessage = null;
    try {
      const { topPicks, communityInsights } =
        await DiscoverService.fetchDiscoverPage();
      runInAction(() => {
        this.topPicks = topPicks;
        this.communityInsights = communityInsights;
        this.loadStatus = 'success';
      });
    } catch (e) {
      runInAction(() => {
        this.loadStatus = 'error';
        this.errorMessage = e.message ?? 'Failed to load discover data';
      });
    }
  }

  async setWishlistLiked(place, liked) {
    if (!!place.isInWishlist === liked) return;
    this.wishToggleStatus = 'loading';
    this.errorMessage = null;
    try {
      await DiscoverService.setWishlistLiked(place, liked);
      runInAction(() => {
        this.topPicks = this.topPicks.map((p) =>
          p.id === place.id ? { ...p, isInWishlist: liked } : p,
        );
        this.wishToggleStatus = 'idle';
      });
      profileStore.refreshWishlist();
    } catch (e) {
      runInAction(() => {
        this.wishToggleStatus = 'idle';
        this.errorMessage = e.message ?? 'Could not update wishlist';
      });
    }
  }

  async openPlaceDetail(place) {
    this.selectedPlace = {
      id: place.id,
      name: place.name,
      country: place.country,
      imageUrl: place.imageUrl,
      whyVisit: place.reason ?? null,
    };
    this.placeDetail = null;
    this.detailStatus = 'loading';
    const detail = await DiscoverService.fetchPlaceDetail(place.id, place.name);
    runInAction(() => {
      this.placeDetail = detail;
      this.detailStatus = detail ? 'success' : 'error';
    });
  }

  closeDetail() {
    this.selectedPlace = null;
    this.placeDetail = null;
    this.detailStatus = 'idle';
  }
}

export const discoverStore = new DiscoverStoreClass();
