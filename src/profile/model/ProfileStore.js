import * as ImagePicker from 'expo-image-picker';
import { makeAutoObservable, runInAction } from 'mobx';
import { ProfileService } from './ProfileService';

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

  budgetInputDraft = null;

  get profileViewModel() {
    const p = this.profile;
    if (!p) return null;
    return { ...p, badgeLabelText: `${p.badgeLabel} Level ${p.badgeLevel}` };
  }

  constructor() {
    makeAutoObservable(this);
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
      const [profile, wishlist, preferences] = await Promise.all([
        ProfileService.fetchProfile(),
        ProfileService.fetchWishlist(),
        ProfileService.fetchPreferences(),
      ]);

      runInAction(() => {
        this.profile = profile;
        this.wishlist = wishlist;
        this.preferences = preferences;
        this.loadStatus = 'success';
      });
    } catch (e) {
      runInAction(() => {
        this.loadStatus = 'error';
        this.errorMessage = e.message ?? 'Failed to load profile';
      });
    }
  }

  /** Re-fetch wishlist only (e.g. after Discover tab updates Firestore). */
  async refreshWishlist() {
    try {
      const wishlist = await ProfileService.fetchWishlist();
      runInAction(() => {
        this.wishlist = wishlist;
      });
    } catch {
      /* keep existing wishlist */
    }
  }

  async openWishlistPlaceDetail(item) {
    runInAction(() => {
      this.wishlistDetailPlace = {
        id: item.id,
        name: item.name,
        imageUrl: item.imageUrl,
        country: '',
        whyVisit: null,
      };
      this.wishlistPlaceDetail = null;
      this.wishlistDetailStatus = 'loading';
    });
    const detail = await ProfileService.fetchPlaceDetail(item.id, item.name);
    runInAction(() => {
      this.wishlistPlaceDetail = detail;
      this.wishlistDetailStatus = detail ? 'success' : 'error';
    });
  }

  setBudgetInputDraft(value) {
    this.budgetInputDraft = value;
  }

  closeWishlistPlaceDetail() {
    this.wishlistDetailPlace = null;
    this.wishlistPlaceDetail = null;
    this.wishlistDetailStatus = 'idle';
  }

  async updatePreferences(newPrefs) {
    try {
      await ProfileService.savePreferences(newPrefs);
      runInAction(() => {
        this.preferences = { ...this.preferences, ...newPrefs };
        if ('budgetPerDay' in newPrefs) {
          this.budgetInputDraft = null;
        }
      });
      return true;
    } catch (e) {
      runInAction(() => {
        this.errorMessage = e.message ?? 'Failed to save preferences';
      });
      return false;
    }
  }

  async updateBudgetPerDay(budgetPerDay) {
    if (!this.preferences) return false;
    const nextBudget = Number(budgetPerDay);
    if (!Number.isFinite(nextBudget) || nextBudget <= 0) return false;

    return this.updatePreferences({ budgetPerDay: Math.round(nextBudget) });
  }

  async pickAndUploadAvatar() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
      aspect: [1, 1],
    });
    if (result.canceled || !result.assets?.[0]?.uri) return;
    await this.uploadAvatar(result.assets[0].uri);
  }

  async uploadAvatar(localUri) {
    this.avatarUploadStatus = 'loading';
    this.errorMessage = null;
    try {
      const nextProfile = await ProfileService.uploadAvatar(localUri);
      runInAction(() => {
        this.profile = nextProfile;
        this.avatarUploadStatus = 'success';
      });
    } catch (e) {
      runInAction(() => {
        this.avatarUploadStatus = 'error';
        this.errorMessage = e.message ?? 'Failed to upload avatar';
      });
    }
  }

  async exportData() {
    this.exportStatus = 'loading';

    try {
      await ProfileService.exportUserData();
      runInAction(() => {
        this.exportStatus = 'success';
      });
    } catch (e) {
      runInAction(() => {
        this.exportStatus = 'error';
        this.errorMessage = e.message ?? 'Export failed';
      });
    }
  }
}

export const profileStore = new ProfileStoreClass();
