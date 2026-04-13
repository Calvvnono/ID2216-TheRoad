import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { observer } from 'mobx-react-lite';
import { Colors } from '../../shared/theme/colors';
import { StatusOverlay } from '../../shared/ui/StatusOverlay';
import { ProfilePresenter } from '../presenter/ProfilePresenter';
import { ProfileHeader } from './ProfileHeader';
import { WishlistCarousel } from './WishlistCarousel';
import { PreferencePanel } from './PreferencePanel';
import { PlaceDetailModal } from '../../discover/view/PlaceDetailModal';

export const ProfileScreen = observer(function ProfileScreen() {
  useEffect(() => {
    ProfilePresenter.init();
  }, []);

  const loadStatus = ProfilePresenter.getLoadStatus();
  const errorMessage = ProfilePresenter.getErrorMessage();
  const profile = ProfilePresenter.getProfile();
  const wishlist = ProfilePresenter.getWishlist();
  const preferences = ProfilePresenter.getPreferences();
  const isUploading =
    ProfilePresenter.getAvatarUploadStatus() === 'loading';

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle} numberOfLines={1}>
          The Road Goes Ever On
        </Text>
        <Text style={styles.headerSubtitle}>All the World's a Road</Text>
      </View>

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
            />
          ) : null}

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
  header: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginTop: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
});
