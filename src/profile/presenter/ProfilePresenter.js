import { profileStore } from '../model/ProfileStore';

/**
 * ProfilePresenter — Presenter/Controller concern.
 *
 * Rules:
 *   - Reads from ProfileStore (Application State) only
 *   - NEVER imports ProfileService or any persistence API
 *   - Delegates user commands to store actions
 *   - View calls presenter; presenter does not call view
 *
 * Call direction: View → Presenter → Store
 */
export const ProfilePresenter = {
  /** Trigger initial data load (Store will call Service internally). */
  init() {
    if (profileStore.loadStatus === 'idle') {
      profileStore.loadAll();
    }
  },

  /** Re-trigger data load (e.g. on retry after error). */
  reload() {
    profileStore.loadAll();
  },

  /** @returns {'idle' | 'loading' | 'success' | 'error'} */
  getLoadStatus() {
    return profileStore.loadStatus;
  },

  /** @returns {string | null} */
  getErrorMessage() {
    return profileStore.errorMessage;
  },

  /** @returns {Object | null} */
  getProfile() {
    return profileStore.profile;
  },

  /** @returns {Object[]} */
  getWishlist() {
    return profileStore.wishlist;
  },

  /** @returns {Object | null} */
  getPreferences() {
    return profileStore.preferences;
  },

  /** @returns {'idle' | 'loading' | 'success' | 'error'} */
  getExportStatus() {
    return profileStore.exportStatus;
  },

  /** Handle user requesting data export. */
  onExportData() {
    profileStore.exportData();
  },

  /** Handle user changing preferences. */
  onUpdatePreferences(newPrefs) {
    profileStore.updatePreferences(newPrefs);
  },

  /** Save budget value from view input. */
  onUpdateBudgetPerDay(budgetPerDay) {
    profileStore.updateBudgetPerDay(budgetPerDay);
  },

  /** Upload avatar from local image uri. */
  onUploadAvatar(localUri) {
    profileStore.uploadAvatar(localUri);
  },

  /** @returns {'idle' | 'loading' | 'success' | 'error'} */
  getAvatarUploadStatus() {
    return profileStore.avatarUploadStatus;
  },
};
