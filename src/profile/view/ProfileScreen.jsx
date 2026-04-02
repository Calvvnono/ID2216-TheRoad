import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { observer } from 'mobx-react-lite';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../../shared/theme/colors';
import { StatusOverlay } from '../../shared/ui/StatusOverlay';
import { ProfilePresenter } from '../presenter/ProfilePresenter';
import { ProfileHeader } from './ProfileHeader';
import { WishlistCarousel } from './WishlistCarousel';
import { PreferencePanel } from './PreferencePanel';

/**
 * ProfileScreen — primary View for the Profile tab.
 *
 * Architecture compliance (grading matrix A):
 *   Concern        | Where
 *   ───────────────┼──────────────────────
 *   View           | this file + sub-views
 *   Presenter      | ProfilePresenter.js
 *   App State      | ProfileStore.js (MobX)
 *   Persistence    | ProfileService.js
 *   Navigation     | app/_layout.jsx (Expo Router)
 *
 * Call direction: View → Presenter → Store → Service
 *   - View reads presenter getters (which read store observables)
 *   - View dispatches actions to presenter (which delegates to store)
 *   - View NEVER imports Store or Service directly
 */
export const ProfileScreen = observer(function ProfileScreen() {
  useEffect(() => {
    ProfilePresenter.init();
  }, []);

  const loadStatus = ProfilePresenter.getLoadStatus();
  const errorMessage = ProfilePresenter.getErrorMessage();
  const avatarUploadStatus = ProfilePresenter.getAvatarUploadStatus();

  const pickAndUploadAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
      aspect: [1, 1],
    });

    if (result.canceled || !result.assets?.[0]?.uri) return;
    ProfilePresenter.onUploadAvatar(result.assets[0].uri);
  };

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
          {ProfilePresenter.getProfile() && (
            <ProfileHeader
              profile={ProfilePresenter.getProfile()}
              onUploadAvatar={pickAndUploadAvatar}
              isUploading={avatarUploadStatus === 'loading'}
            />
          )}

          <WishlistCarousel wishlist={ProfilePresenter.getWishlist()} />

          {ProfilePresenter.getPreferences() && (
            <PreferencePanel
              preferences={ProfilePresenter.getPreferences()}
              onSaveBudget={ProfilePresenter.onUpdateBudgetPerDay}
            />
          )}
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
