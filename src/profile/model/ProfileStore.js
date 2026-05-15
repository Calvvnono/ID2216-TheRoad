import { makeAutoObservable } from 'mobx';
import {
  DEFAULT_INTEREST_KEYWORDS,
  deriveInterestBuckets,
} from './interestKeywords';
import { journeysStore } from '../../journeys/model/JourneysStore';

class ProfileStoreClass {
  profile = null;

  wishlist = [];

  preferences = null;

  loadStatus = 'idle';

  exportStatus = 'idle';

  errorMessage = null;

  avatarUploadStatus = 'idle';

  wishlistDetailPlace = null;

  wishlistPlaceDetail = null;

  wishlistDetailStatus = 'idle';

  taskModalVisible = false;

  get derivedInterestBuckets() {
    return deriveInterestBuckets(journeysStore.journeys);
  }

  get interestTags() {
    const all = this.derivedInterestBuckets.all;
    if (all.length > 0) return all;
    return DEFAULT_INTEREST_KEYWORDS;
  }

  get forYouKeywords() {
    const searchable = this.derivedInterestBuckets.searchable;
    if (searchable.length > 0) return searchable.slice(0, 3);
    return DEFAULT_INTEREST_KEYWORDS.slice(0, 3);
  }

  constructor() {
    makeAutoObservable(this);
  }

  setLoadStarted() {
    this.loadStatus = 'loading';
    this.errorMessage = null;
  }

  setProfileData(profile, wishlist, preferences) {
    this.profile = profile;
    this.wishlist = wishlist;
    this.preferences = preferences;
    this.loadStatus = 'success';
  }

  setLoadError(message) {
    this.loadStatus = 'error';
    this.errorMessage = message;
  }

  setWishlist(wishlist) {
    this.wishlist = wishlist;
  }

  setProfile(profile) {
    this.profile = profile;
  }

  setWishlistDetailLoading(place) {
    this.wishlistDetailPlace = place;
    this.wishlistPlaceDetail = null;
    this.wishlistDetailStatus = 'loading';
  }

  setWishlistPlaceDetail(detail) {
    this.wishlistPlaceDetail = detail;
    this.wishlistDetailStatus = detail ? 'success' : 'error';
  }

  closeWishlistPlaceDetail() {
    this.wishlistDetailPlace = null;
    this.wishlistPlaceDetail = null;
    this.wishlistDetailStatus = 'idle';
  }

  openTaskModal() {
    this.taskModalVisible = true;
  }

  closeTaskModal() {
    this.taskModalVisible = false;
  }

  setPreferencesSaved(newPrefs, refreshedProfile) {
    this.preferences = { ...this.preferences, ...newPrefs };
    this.profile = refreshedProfile;
  }

  setError(message) {
    this.errorMessage = message;
  }

  setAvatarUploadStarted() {
    this.avatarUploadStatus = 'loading';
    this.errorMessage = null;
  }

  setAvatarUploadSuccess(nextProfile) {
    this.profile = nextProfile;
    this.avatarUploadStatus = 'success';
  }

  setAvatarUploadError(message) {
    this.avatarUploadStatus = 'error';
    this.errorMessage = message;
  }

  setExportStarted() {
    this.exportStatus = 'loading';
  }

  setExportSuccess(refreshedProfile) {
    this.exportStatus = 'success';
    this.profile = refreshedProfile;
  }

  setExportError(message) {
    this.exportStatus = 'error';
    this.errorMessage = message;
  }
}

export const profileStore = new ProfileStoreClass();
