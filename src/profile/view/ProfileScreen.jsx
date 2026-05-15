import React, { useEffect } from 'react';
import { View, ScrollView, StyleSheet, Image, TouchableOpacity, Text } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../../shared/theme/colors';
import { StatusOverlay } from '../../shared/ui/StatusOverlay';
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

export function ProfileScreen({
  loadStatus,
  errorMessage,
  profile,
  wishlist,
  preferences,
  interestTags,
  avatarUploadStatus,
  totalSpent,
  avgDailyBudget,
  journeyCount,
  wishlistDetailPlace,
  wishlistPlaceDetail,
  wishlistDetailStatus,
  taskModalVisible,
  taskList,
  onInit,
  onReload,
  onPickAvatar,
  onWishlistItemPress,
  onCloseWishlistDetail,
  onOpenTaskModal,
  onCloseTaskModal,
  onSignOut,
}) {
  useEffect(() => {
    onInit();
  }, [onInit]);

  useFocusEffect(
    React.useCallback(() => {
      onReload();
    }, [onReload]),
  );

  const isUploading = avatarUploadStatus === 'loading';

  return (
    <View style={styles.screen}>
      <Image source={APP_HEADER_LOGO} style={styles.floatingLogo} resizeMode="contain" />

      <StatusOverlay
        status={loadStatus}
        onRetry={onReload}
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
              onUploadAvatar={onPickAvatar}
              isUploading={isUploading}
              onOpenTasks={onOpenTaskModal}
            />
          ) : null}

          <TaskModal
            visible={taskModalVisible}
            tasks={taskList}
            onClose={onCloseTaskModal}
          />

          <WishlistCarousel
            wishlist={wishlist}
            onItemPress={onWishlistItemPress}
          />

          <PlaceDetailModal
            place={wishlistDetailPlace}
            detail={wishlistPlaceDetail}
            detailStatus={wishlistDetailStatus}
            onClose={onCloseWishlistDetail}
          />

          <PreferencePanel
            preferences={preferences}
            interestTags={interestTags}
            totalSpent={totalSpent}
            avgDailyBudget={avgDailyBudget}
            journeyCount={journeyCount}
          />

          <TouchableOpacity
            style={styles.signOutBtn}
            onPress={onSignOut}
            activeOpacity={0.8}
          >
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </ScrollView>
      </StatusOverlay>
    </View>
  );
}

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
  signOutBtn: {
    marginTop: 24,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
    paddingVertical: 14,
    alignItems: 'center',
  },
  signOutText: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
});
