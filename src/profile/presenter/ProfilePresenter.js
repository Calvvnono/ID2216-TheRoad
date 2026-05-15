import React from 'react';
import { observer } from 'mobx-react-lite';
import { profileStore } from '../model/ProfileStore';
import { ProfilePersistence } from '../persistence/ProfilePersistence';
import { authPersistence } from '../../auth/persistence/authPersistence';
import { JourneysPersistence } from '../../journeys/persistence/JourneysPersistence';
import { ProfileScreen } from '../view/ProfileScreen';

const ProfilePresenter = {
  init() {
    ProfilePersistence.init();
    JourneysPersistence.init();
  },

  reload() {
    ProfilePersistence.loadAll();
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

  getInterestTags() {
    return profileStore.interestTags;
  },

  getExportStatus() {
    return profileStore.exportStatus;
  },

  onExportData() {
    ProfilePersistence.exportData();
  },

  onUpdatePreferences(newPrefs) {
    ProfilePersistence.updatePreferences(newPrefs);
  },

  onUpdateBudgetPerDay(budgetPerDay) {
    const nextPrefs = profileStore.updateBudgetPerDayValue(budgetPerDay);
    if (!nextPrefs) return false;
    return ProfilePersistence.updatePreferences(nextPrefs);
  },

  onPickAvatar() {
    ProfilePersistence.pickAndUploadAvatar();
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
    ProfilePersistence.openWishlistPlaceDetail(item);
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

  onOpenTaskModal() {
    profileStore.openTaskModal();
  },

  onCloseTaskModal() {
    profileStore.closeTaskModal();
  },

  getTaskModalVisible() {
    return profileStore.taskModalVisible;
  },

  getTaskList() {
    return profileStore.taskListViewModel;
  },

  onSignOut() {
    authPersistence.signOut();
  },
};

const profilePresenterProps = {
  onInit: () => ProfilePresenter.init(),
  onReload: () => ProfilePresenter.reload(),
  onExportData: () => ProfilePresenter.onExportData(),
  onUpdateBudgetPerDay: (budgetPerDay) =>
    ProfilePresenter.onUpdateBudgetPerDay(budgetPerDay),
  onPickAvatar: () => ProfilePresenter.onPickAvatar(),
  onBudgetInputChange: (value) => ProfilePresenter.onBudgetInputChange(value),
  onWishlistItemPress: (item) => ProfilePresenter.onWishlistItemPress(item),
  onCloseWishlistDetail: () => ProfilePresenter.onCloseWishlistDetail(),
  onOpenTaskModal: () => ProfilePresenter.onOpenTaskModal(),
  onCloseTaskModal: () => ProfilePresenter.onCloseTaskModal(),
  onSignOut: () => ProfilePresenter.onSignOut(),
};

function ProfilePresenterView() {
  const props = {
    loadStatus: ProfilePresenter.getLoadStatus(),
    errorMessage: ProfilePresenter.getErrorMessage(),
    profile: ProfilePresenter.getProfile(),
    wishlist: ProfilePresenter.getWishlist(),
    preferences: ProfilePresenter.getPreferences(),
    interestTags: ProfilePresenter.getInterestTags(),
    exportStatus: ProfilePresenter.getExportStatus(),
    avatarUploadStatus: ProfilePresenter.getAvatarUploadStatus(),
    budgetInputValue: ProfilePresenter.getBudgetInputValue(),
    wishlistDetailPlace: ProfilePresenter.getWishlistDetailPlace(),
    wishlistPlaceDetail: ProfilePresenter.getWishlistPlaceDetail(),
    wishlistDetailStatus: ProfilePresenter.getWishlistDetailStatus(),
    taskModalVisible: ProfilePresenter.getTaskModalVisible(),
    taskList: ProfilePresenter.getTaskList(),
    ...profilePresenterProps,
  };

  return <ProfileScreen {...props} />;
}

export default observer(ProfilePresenterView);
