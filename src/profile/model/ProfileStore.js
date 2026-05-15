import { makeAutoObservable } from 'mobx';
import {
  computeProgress,
  isDailyAwardSatisfied,
  XP_EVENT_KEYS,
} from './xpSystem';
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

  budgetInputDraft = null;

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
    const dailySigninDone = isDailyAwardSatisfied(
      xpMeta,
      XP_EVENT_KEYS.DAILY_SIGNIN,
      1,
    );
    const dailyDiscoverDone = isDailyAwardSatisfied(
      xpMeta,
      XP_EVENT_KEYS.DAILY_DISCOVER_BROWSE,
      1,
    );

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
    if (this.loadStatus === 'idle') this.loadStatus = 'loading';
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

  setPreferencesSaved(newPrefs, refreshedProfile) {
    this.preferences = { ...this.preferences, ...newPrefs };
    this.profile = refreshedProfile;
    if ('budgetPerDay' in newPrefs) {
      this.budgetInputDraft = null;
    }
  }

  setError(message) {
    this.errorMessage = message;
  }

  updateBudgetPerDayValue(budgetPerDay) {
    if (!this.preferences) return false;
    const nextBudget = Number(budgetPerDay);
    if (!Number.isFinite(nextBudget) || nextBudget <= 0) return false;
    return { budgetPerDay: Math.round(nextBudget) };
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
