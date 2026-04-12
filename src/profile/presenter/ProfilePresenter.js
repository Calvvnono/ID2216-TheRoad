import { profileStore } from '../model/ProfileStore';
import { DiscoverPresenter } from '../../discover/presenter/DiscoverPresenter';

export const ProfilePresenter = {
  init() {
    profileStore.init();
  },

  reload() {
    profileStore.loadAll();
  },

  getLoadStatus() {
    return profileStore.loadStatus;
  },

  getErrorMessage() {
    return profileStore.errorMessage;
  },

  getProfile() {
    const p = profileStore.profile;
    if (!p) return null;
    return {
      ...p,
      badgeLabelText: `${p.badgeLabel} Level ${p.badgeLevel}`,
    };
  },

  getWishlist() {
    return profileStore.wishlist;
  },

  getPreferences() {
    return profileStore.preferences;
  },

  getExportStatus() {
    return profileStore.exportStatus;
  },

  onExportData() {
    profileStore.exportData();
  },

  onUpdatePreferences(newPrefs) {
    profileStore.updatePreferences(newPrefs);
  },

  onUpdateBudgetPerDay(budgetPerDay) {
    void profileStore.updateBudgetPerDay(budgetPerDay).then((saved) => {
      if (saved) DiscoverPresenter.reload();
    });
  },

  onUploadAvatar(localUri) {
    profileStore.uploadAvatar(localUri);
  },

  getAvatarUploadStatus() {
    return profileStore.avatarUploadStatus;
  },

  onWishlistItemPress(item) {
    profileStore.openWishlistPlaceDetail(item);
  },

  onCloseWishlistDetail() {
    profileStore.closeWishlistPlaceDetail();
  },

  getWishlistDetailPlace() {
    const p = profileStore.wishlistDetailPlace;
    if (!p) return null;
    return {
      id: p.id,
      name: p.name,
      country: p.country,
      imageUrl: p.imageUrl,
      whyVisit: p.reason ?? null,
    };
  },

  getWishlistPlaceDetail() {
    return profileStore.wishlistPlaceDetail;
  },

  getWishlistDetailStatus() {
    return profileStore.wishlistDetailStatus;
  },
};
