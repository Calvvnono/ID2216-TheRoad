import { profileStore } from '../model/ProfileStore';

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
    return profileStore.profileViewModel;
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
    profileStore.updateBudgetPerDay(budgetPerDay);
  },

  onPickAvatar() {
    profileStore.pickAndUploadAvatar();
  },

  getAvatarUploadStatus() {
    return profileStore.avatarUploadStatus;
  },

  getBudgetInputValue() {
    if (profileStore.budgetInputDraft !== null) return profileStore.budgetInputDraft;
    return String(profileStore.preferences?.budgetPerDay ?? '');
  },

  onBudgetInputChange(value) {
    profileStore.setBudgetInputDraft(value);
  },

  onWishlistItemPress(item) {
    profileStore.openWishlistPlaceDetail(item);
  },

  onCloseWishlistDetail() {
    profileStore.closeWishlistPlaceDetail();
  },

  getWishlistDetailPlace() {
    return profileStore.wishlistDetailPlace;
  },

  getWishlistPlaceDetail() {
    return profileStore.wishlistPlaceDetail;
  },

  getWishlistDetailStatus() {
    return profileStore.wishlistDetailStatus;
  },
};
