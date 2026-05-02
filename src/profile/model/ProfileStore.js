import * as ImagePicker from 'expo-image-picker';
import { makeAutoObservable, runInAction } from 'mobx';
import { ProfileService } from './ProfileService';
import { computeProgress, XP_EVENT_KEYS } from './xpSystem';

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

  taskModalVisible = false;

  get profileViewModel() {
    const p = this.profile;
    if (!p) return null;
    const progress = computeProgress(p.totalXp);
    return {
      ...p,
      badgeLevel: progress.level,
      badgeLabel: progress.title,
      badgeLabelText: `${progress.title} Level ${progress.level}`,
      isMaxLevel: progress.isMaxLevel,
      progressPercent: Math.round(progress.progress * 100),
      xpIntoLevel: progress.xpIntoLevel,
      xpNeededThisLevel: progress.xpNeededThisLevel,
      xpToNextLevel: progress.xpToNextLevel,
      totalXp: p.totalXp,
    };
  }

  get taskListViewModel() {
    const profile = this.profile;
    if (!profile) {
      return {
        completed: [],
        pending: [],
        dailyCompleted: [],
        dailyPending: [],
      };
    }

    const granted = new Set(
      Array.isArray(profile.grantedXpKeys) ? profile.grantedXpKeys : [],
    );
    const xpMeta =
      profile.xpMeta && typeof profile.xpMeta === 'object' ? profile.xpMeta : {};
    const today = new Date().toISOString().slice(0, 10);
    const dailySigninDone =
      String(xpMeta.daily_signinDate || '') === today &&
      Number(xpMeta.daily_signinCount || 0) >= 1;
    const dailyDiscoverDone =
      String(xpMeta.daily_discover_browseDate || '') === today &&
      Number(xpMeta.daily_discover_browseCount || 0) >= 1;

    const taskSeed = [
      {
        key: XP_EVENT_KEYS.FIRST_PROFILE_BOOTSTRAP,
        title: 'First profile bootstrap',
        xp: 40,
        completed: granted.has(XP_EVENT_KEYS.FIRST_PROFILE_BOOTSTRAP),
      },
      {
        key: XP_EVENT_KEYS.FIRST_BUDGET_SAVE,
        title: 'Save budget for the first time',
        xp: 40,
        completed: granted.has(XP_EVENT_KEYS.FIRST_BUDGET_SAVE),
      },
      {
        key: XP_EVENT_KEYS.FIRST_AVATAR_UPLOAD,
        title: 'Upload avatar for the first time',
        xp: 40,
        completed: granted.has(XP_EVENT_KEYS.FIRST_AVATAR_UPLOAD),
      },
      {
        key: XP_EVENT_KEYS.FIRST_EXPORT,
        title: 'Export profile data for the first time',
        xp: 20,
        completed: granted.has(XP_EVENT_KEYS.FIRST_EXPORT),
      },
      {
        key: XP_EVENT_KEYS.FIRST_JOURNEY_CREATE,
        title: 'Create first journey',
        xp: 120,
        completed: granted.has(XP_EVENT_KEYS.FIRST_JOURNEY_CREATE),
      },
      {
        key: XP_EVENT_KEYS.FIRST_JOURNEY_EDIT,
        title: 'Edit first journey',
        xp: 60,
        completed: granted.has(XP_EVENT_KEYS.FIRST_JOURNEY_EDIT),
      },
      {
        key: XP_EVENT_KEYS.FIRST_JOURNEY_PHOTO_MILESTONE,
        title: 'Reach 3 photos in a journey',
        xp: 50,
        completed: granted.has(XP_EVENT_KEYS.FIRST_JOURNEY_PHOTO_MILESTONE),
      },
      {
        key: XP_EVENT_KEYS.FIRST_JOURNEY_BGM_MATCH,
        title: 'Trigger first BGM match',
        xp: 40,
        completed: granted.has(XP_EVENT_KEYS.FIRST_JOURNEY_BGM_MATCH),
      },
    ];

    return {
      completed: taskSeed.filter((item) => item.completed),
      pending: taskSeed.filter((item) => !item.completed),
      dailyCompleted: [
        ...(dailySigninDone
          ? [
              {
                key: XP_EVENT_KEYS.DAILY_SIGNIN,
                title: 'Daily check-in',
                subtitle: 'Signed in today',
                xp: 10,
              },
            ]
          : []),
        ...(dailyDiscoverDone
          ? [
              {
                key: XP_EVENT_KEYS.DAILY_DISCOVER_BROWSE,
                title: 'Browse Discover today',
                subtitle: 'Daily Discover browsing completed',
                xp: 10,
              },
            ]
          : []),
      ],
      dailyPending: [
        ...(!dailySigninDone
          ? [
              {
                key: XP_EVENT_KEYS.DAILY_SIGNIN,
                title: 'Daily check-in',
                subtitle: 'Open profile once per day',
                xp: 10,
              },
            ]
          : []),
        ...(!dailyDiscoverDone
          ? [
              {
                key: XP_EVENT_KEYS.DAILY_DISCOVER_BROWSE,
                title: 'Browse Discover today',
                subtitle: 'Open Discover page once per day',
                xp: 10,
              },
            ]
          : []),
      ],
    };
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
      const signinAward = await ProfileService.awardDailySigninXp();
      const latestProfile = signinAward?.isAwarded
        ? await ProfileService.fetchProfile()
        : profile;

      runInAction(() => {
        this.profile = latestProfile;
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

  async refreshProfile() {
    try {
      const profile = await ProfileService.fetchProfile();
      runInAction(() => {
        this.profile = profile;
      });
    } catch {
      /* keep existing profile */
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

  openTaskModal() {
    this.taskModalVisible = true;
  }

  closeTaskModal() {
    this.taskModalVisible = false;
  }

  async updatePreferences(newPrefs) {
    try {
      await ProfileService.savePreferences(newPrefs);
      if (Object.prototype.hasOwnProperty.call(newPrefs, 'budgetPerDay')) {
        await ProfileService.awardBudgetSavedXp();
      }
      const refreshedProfile = await ProfileService.fetchProfile();
      runInAction(() => {
        this.preferences = { ...this.preferences, ...newPrefs };
        this.profile = refreshedProfile;
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
      const [_, refreshedProfile] = await Promise.all([
        ProfileService.awardExportXp(),
        ProfileService.fetchProfile(),
      ]);
      runInAction(() => {
        this.exportStatus = 'success';
        this.profile = refreshedProfile;
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
