import { makeAutoObservable, reaction, runInAction } from 'mobx';
import { profileStore } from '../../profile/model/ProfileStore';
import { ProfileService } from '../../profile/model/ProfileService';
import { isDailyAwardSatisfied, XP_EVENT_KEYS } from '../../profile/model/xpSystem';
import { journeysStore } from '../../journeys/model/JourneysStore';
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
        if (profileStore.loadStatus !== 'success') return null;
        const journeysStatus = journeysStore.loadStatus;
        if (journeysStatus !== 'success' && journeysStatus !== 'error') return null;
        const budget = profileStore.preferences?.budgetPerDay ?? 200;
        const forYou = profileStore.forYouKeywords.join('|');
        return `${budget}|${forYou}`;
      },
      (signature, previousSignature) => {
        if (!signature || signature === previousSignature) return;
        void this.loadAll();
      },
    );
  }

  init() {
    journeysStore.init();
    profileStore.init();
    if (this.loadStatus === 'idle') {
      this.loadStatus = 'loading';
    }
  }

  async loadAll() {
    this.loadStatus = 'loading';
    this.errorMessage = null;
    try {
      const { topPicks, communityInsights } =
        await DiscoverService.fetchDiscoverPage({
          forYouKeywords: profileStore.forYouKeywords,
          budget: profileStore.preferences?.budgetPerDay ?? 200,
        });
      const discoverAward = isDailyAwardSatisfied(
        profileStore.profile?.xpMeta,
        XP_EVENT_KEYS.DAILY_DISCOVER_BROWSE,
      )
        ? { isAwarded: false }
        : await ProfileService.awardDailyDiscoverBrowseXp();
      if (discoverAward?.isAwarded) {
        await profileStore.refreshProfile();
      }
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
