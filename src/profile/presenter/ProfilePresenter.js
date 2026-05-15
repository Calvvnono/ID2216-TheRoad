import React from 'react';
import { observer } from 'mobx-react-lite';
import { profileStore } from '../model/ProfileStore';
import { ProfilePersistence } from '../persistence/ProfilePersistence';
import { authPersistence } from '../../auth/persistence/authPersistence';
import { JourneysPersistence } from '../../journeys/persistence/JourneysPersistence';
import { journeysStore } from '../../journeys/model/JourneysStore';
import { computeProgress, isDailyAwardSatisfied, XP_EVENT_KEYS } from '../model/xpSystem';
import { ProfileScreen } from '../view/ProfileScreen';

function parseDateOnly(value) {
  if (!value) return null;
  const d = new Date(`${value}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function journeyDurationDays(j) {
  const start = parseDateOnly(j.startDate);
  const end = parseDateOnly(j.endDate);
  if (!start || !end) return 1;
  return Math.max(1, Math.floor((end.getTime() - start.getTime()) / 86400000) + 1);
}

function buildProfileViewModel(p) {
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

function buildTaskListViewModel(profile) {
  if (!profile) {
    return { completed: [], pending: [], dailyCompleted: [], dailyPending: [] };
  }
  const granted = new Set(
    Array.isArray(profile.grantedXpKeys) ? profile.grantedXpKeys : [],
  );
  const xpMeta =
    profile.xpMeta && typeof profile.xpMeta === 'object' ? profile.xpMeta : {};
  const dailySigninDone = isDailyAwardSatisfied(xpMeta, XP_EVENT_KEYS.DAILY_SIGNIN, 1);
  const dailyDiscoverDone = isDailyAwardSatisfied(xpMeta, XP_EVENT_KEYS.DAILY_DISCOVER_BROWSE, 1);

  const taskSeed = [
    {
      key: XP_EVENT_KEYS.FIRST_PROFILE_BOOTSTRAP,
      title: 'First profile bootstrap',
      subtitle: 'Set up your traveler profile',
      xp: 40,
      completed: granted.has(XP_EVENT_KEYS.FIRST_PROFILE_BOOTSTRAP),
    },
    {
      key: XP_EVENT_KEYS.FIRST_AVATAR_UPLOAD,
      title: 'Upload avatar for the first time',
      subtitle: 'Tap your profile picture to upload a photo',
      xp: 40,
      completed: granted.has(XP_EVENT_KEYS.FIRST_AVATAR_UPLOAD),
    },
    {
      key: XP_EVENT_KEYS.FIRST_EXPORT,
      title: 'Export profile data for the first time',
      subtitle: 'Download all your travel data as a file',
      xp: 20,
      completed: granted.has(XP_EVENT_KEYS.FIRST_EXPORT),
    },
    {
      key: XP_EVENT_KEYS.FIRST_JOURNEY_CREATE,
      title: 'Create first journey',
      subtitle: 'Add your first travel memory in My Journeys',
      xp: 120,
      completed: granted.has(XP_EVENT_KEYS.FIRST_JOURNEY_CREATE),
    },
    {
      key: XP_EVENT_KEYS.FIRST_JOURNEY_EDIT,
      title: 'Edit first journey',
      subtitle: 'Update or improve a saved journey entry',
      xp: 60,
      completed: granted.has(XP_EVENT_KEYS.FIRST_JOURNEY_EDIT),
    },
    {
      key: XP_EVENT_KEYS.FIRST_JOURNEY_PHOTO_MILESTONE,
      title: 'Reach 3 photos in a journey',
      subtitle: 'Upload at least 3 photos to a single journey',
      xp: 50,
      completed: granted.has(XP_EVENT_KEYS.FIRST_JOURNEY_PHOTO_MILESTONE),
    },
    {
      key: XP_EVENT_KEYS.FIRST_JOURNEY_BGM_MATCH,
      title: 'Trigger first BGM match',
      subtitle: 'Create a journey — the app picks a soundtrack for it',
      xp: 40,
      completed: granted.has(XP_EVENT_KEYS.FIRST_JOURNEY_BGM_MATCH),
    },
  ];

  return {
    completed: taskSeed.filter((item) => item.completed),
    pending: taskSeed.filter((item) => !item.completed),
    dailyCompleted: [
      ...(dailySigninDone
        ? [{ key: XP_EVENT_KEYS.DAILY_SIGNIN, title: 'Daily check-in', subtitle: 'Signed in today', xp: 10 }]
        : []),
      ...(dailyDiscoverDone
        ? [{ key: XP_EVENT_KEYS.DAILY_DISCOVER_BROWSE, title: 'Browse Discover today', subtitle: 'Daily browsing completed', xp: 10 }]
        : []),
    ],
    dailyPending: [
      ...(!dailySigninDone
        ? [{ key: XP_EVENT_KEYS.DAILY_SIGNIN, title: 'Daily check-in', subtitle: 'Open profile once per day', xp: 10 }]
        : []),
      ...(!dailyDiscoverDone
        ? [{ key: XP_EVENT_KEYS.DAILY_DISCOVER_BROWSE, title: 'Browse Discover today', subtitle: 'Open the Discover page once per day', xp: 10 }]
        : []),
    ],
  };
}

const ProfilePresenter = {
  init() {
    ProfilePersistence.init();
    JourneysPersistence.init();
  },
  reload() {
    ProfilePersistence.loadAll();
  },
  onExportData() {
    ProfilePersistence.exportData();
  },
  onPickAvatar() {
    ProfilePersistence.pickAndUploadAvatar();
  },
  onWishlistItemPress(item) {
    ProfilePersistence.openWishlistPlaceDetail(item);
  },
  onCloseWishlistDetail() {
    profileStore.closeWishlistPlaceDetail();
  },
  onOpenTaskModal() {
    profileStore.openTaskModal();
  },
  onCloseTaskModal() {
    profileStore.closeTaskModal();
  },
  onSignOut() {
    authPersistence.signOut();
  },
};

const profilePresenterProps = {
  onInit: () => ProfilePresenter.init(),
  onReload: () => ProfilePresenter.reload(),
  onExportData: () => ProfilePresenter.onExportData(),
  onPickAvatar: () => ProfilePresenter.onPickAvatar(),
  onWishlistItemPress: (item) => ProfilePresenter.onWishlistItemPress(item),
  onCloseWishlistDetail: () => ProfilePresenter.onCloseWishlistDetail(),
  onOpenTaskModal: () => ProfilePresenter.onOpenTaskModal(),
  onCloseTaskModal: () => ProfilePresenter.onCloseTaskModal(),
  onSignOut: () => ProfilePresenter.onSignOut(),
};

function ProfilePresenterView() {
  const journeys = journeysStore.journeys;
  const totalSpent = journeys.reduce((sum, j) => sum + (Number(j.spent) || 0), 0);
  const totalDays = journeys.reduce((sum, j) => sum + journeyDurationDays(j), 0);
  const avgDailyBudget = totalDays > 0 ? Math.round(totalSpent / totalDays) : 0;

  const props = {
    loadStatus: profileStore.loadStatus,
    errorMessage: profileStore.errorMessage,
    profile: buildProfileViewModel(profileStore.profile),
    wishlist: profileStore.wishlist,
    preferences: profileStore.preferences,
    interestTags: profileStore.interestTags,
    exportStatus: profileStore.exportStatus,
    avatarUploadStatus: profileStore.avatarUploadStatus,
    totalSpent,
    avgDailyBudget,
    journeyCount: journeys.length,
    wishlistDetailPlace: profileStore.wishlistDetailPlace,
    wishlistPlaceDetail: profileStore.wishlistPlaceDetail,
    wishlistDetailStatus: profileStore.wishlistDetailStatus,
    taskModalVisible: profileStore.taskModalVisible,
    taskList: buildTaskListViewModel(profileStore.profile),
    ...profilePresenterProps,
  };

  return <ProfileScreen {...props} />;
}

export default observer(ProfilePresenterView);
