import { makeAutoObservable, runInAction } from 'mobx';
import { ProfileService } from './ProfileService';

/**
 * ProfileStore — Application State concern (MobX).
 *
 * Grading matrix A requirement:
 *   "State manager (Mobx with actions).
 *    All application state side effects (e.g. persistence) use the state manager."
 *
 * Rules:
 *   - Only this store calls ProfileService (persistence)
 *   - Presenter reads this store, never writes to service directly
 *   - Views observe this store via mobx-react-lite `observer`
 *
 * Call direction: Store → Service (for persistence side effects)
 */
class ProfileStoreClass {
  /** @type {Object | null} */
  profile = null;

  /** @type {Object[]} */
  wishlist = [];

  /** @type {Object | null} */
  preferences = null;

  /** @type {'idle' | 'loading' | 'success' | 'error'} */
  loadStatus = 'idle';

  /** @type {'idle' | 'loading' | 'success' | 'error'} */
  exportStatus = 'idle';

  /** @type {string | null} */
  errorMessage = null;

  /** @type {'idle' | 'loading' | 'success' | 'error'} */
  avatarUploadStatus = 'idle';

  constructor() {
    makeAutoObservable(this);
  }

  /** Load all profile data from persistence via Service. */
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

  /** Persist updated preferences via Service. */
  async updatePreferences(newPrefs) {
    try {
      await ProfileService.savePreferences(newPrefs);
      runInAction(() => {
        this.preferences = { ...this.preferences, ...newPrefs };
      });
    } catch (e) {
      runInAction(() => {
        this.errorMessage = e.message ?? 'Failed to save preferences';
      });
    }
  }

  /** Persist only budget change via service. */
  async updateBudgetPerDay(budgetPerDay) {
    if (!this.preferences) return;
    const nextBudget = Number(budgetPerDay);
    if (!Number.isFinite(nextBudget) || nextBudget <= 0) return;

    await this.updatePreferences({ budgetPerDay: Math.round(nextBudget) });
  }

  /** Upload avatar image and refresh profile object. */
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
      console.error('uploadAvatar failed:', e);
      runInAction(() => {
        this.avatarUploadStatus = 'error';
        this.errorMessage = e.message ?? 'Failed to upload avatar';
      });
    }
  }

  /** Trigger data export via Service. */
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
