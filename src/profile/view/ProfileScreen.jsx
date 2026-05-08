import React, { useEffect } from 'react';
import { View, ScrollView, StyleSheet, Image } from 'react-native';
import { observer } from 'mobx-react-lite';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../../shared/theme/colors';
import { StatusOverlay } from '../../shared/ui/StatusOverlay';
import { ProfilePresenter } from '../presenter/ProfilePresenter';
import { ProfileHeader } from './ProfileHeader';
import { WishlistCarousel } from './WishlistCarousel';
import { PreferencePanel } from './PreferencePanel';
import { PlaceDetailModal } from '../../discover/view/PlaceDetailModal';
import { TaskModal } from './TaskModal';

const APP_HEADER_LOGO = require('../../shared/assets/logo_pic.png');

/** Match Discover / Journeys floating logo + clearance below */
const HEADER_LOGO_TOP = 10;
const HEADER_LOGO_SIZE = 80;
const CONTENT_BELOW_LOGO = HEADER_LOGO_TOP + HEADER_LOGO_SIZE + 8;

export const ProfileScreen = observer(function ProfileScreen() {
  useEffect(() => {
    ProfilePresenter.init();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      ProfilePresenter.reload();
    }, []),
  );

  const loadStatus = ProfilePresenter.getLoadStatus();
  const errorMessage = ProfilePresenter.getErrorMessage();
  const profile = ProfilePresenter.getProfile();
  const wishlist = ProfilePresenter.getWishlist();
  const preferences = ProfilePresenter.getPreferences();
  const isUploading =
    ProfilePresenter.getAvatarUploadStatus() === 'loading';

  return (
    <View style={styles.screen}>
      <Image source={APP_HEADER_LOGO} style={styles.floatingLogo} resizeMode="contain" />

      <StatusOverlay
        status={loadStatus}
        onRetry={() => ProfilePresenter.reload()}
        errorMessage={errorMessage}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {profile ? (
            <ProfileHeader
              profile={profile}
              onUploadAvatar={() => ProfilePresenter.onPickAvatar()}
              isUploading={isUploading}
              onOpenTasks={() => ProfilePresenter.onOpenTaskModal()}
            />
          ) : null}

          <TaskModal
            visible={ProfilePresenter.getTaskModalVisible()}
            tasks={ProfilePresenter.getTaskList()}
            onClose={() => ProfilePresenter.onCloseTaskModal()}
          />

          <WishlistCarousel
            wishlist={wishlist}
            onItemPress={(item) => ProfilePresenter.onWishlistItemPress(item)}
          />

          <PlaceDetailModal
            place={ProfilePresenter.getWishlistDetailPlace()}
            detail={ProfilePresenter.getWishlistPlaceDetail()}
            detailStatus={ProfilePresenter.getWishlistDetailStatus()}
            onClose={() => ProfilePresenter.onCloseWishlistDetail()}
          />

          {preferences ? (
            <PreferencePanel
              preferences={preferences}
              interestTags={ProfilePresenter.getInterestTags()}
              budgetInput={ProfilePresenter.getBudgetInputValue()}
              onBudgetInputChange={ProfilePresenter.onBudgetInputChange}
              onBudgetSave={() =>
                ProfilePresenter.onUpdateBudgetPerDay(
                  ProfilePresenter.getBudgetInputValue(),
                )
              }
            />
          ) : null}
        </ScrollView>
      </StatusOverlay>
    </View>
  );
});

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  floatingLogo: {
    position: 'absolute',
    top: HEADER_LOGO_TOP,
    left: 20,
    width: HEADER_LOGO_SIZE,
    height: HEADER_LOGO_SIZE,
    zIndex: 20,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: CONTENT_BELOW_LOGO,
    paddingBottom: 32,
  },
});
