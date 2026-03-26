import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '../../shared/ui/AppHeader';
import { ScreenContainer } from '../../shared/ui/ScreenContainer';
import { Colors } from '../../shared/theme/colors';
import { ProfilePresenter } from '../presenter/ProfilePresenter';

export function ProfileScreen() {
  const viewState = useMemo(() => ProfilePresenter.getViewState(), []);

  return (
    <ScreenContainer>
      <AppHeader title="Profile" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <View style={styles.avatar} />
          <Text style={styles.name}>{viewState.displayName}</Text>
          <Text style={styles.email}>{viewState.email}</Text>
          <Text style={styles.bio}>{viewState.bio}</Text>
          <Pressable style={styles.primaryButton} onPress={ProfilePresenter.onEditProfile}>
            <Text style={styles.primaryButtonText}>Edit profile (TODO)</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <Text style={styles.sectionText}>{viewState.preferenceSummary}</Text>
          <Pressable style={styles.secondaryButton} onPress={ProfilePresenter.onOpenPreferences}>
            <Text style={styles.secondaryButtonText}>Open preferences (TODO)</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Privacy</Text>
          <Text style={styles.sectionText}>{viewState.privacySummary}</Text>
          <Pressable style={styles.secondaryButton} onPress={ProfilePresenter.onOpenPrivacy}>
            <Text style={styles.secondaryButtonText}>Open privacy settings (TODO)</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Data</Text>
          <Text style={styles.sectionText}>Export and sync actions will be connected later.</Text>
          <Pressable style={styles.secondaryButton} onPress={ProfilePresenter.onExportData}>
            <Text style={styles.secondaryButtonText}>Export data (TODO)</Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 14,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.border,
    marginBottom: 10,
  },
  name: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  email: {
    marginTop: 4,
    color: Colors.textSecondary,
    fontSize: 13,
  },
  bio: {
    marginTop: 10,
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  sectionText: {
    marginTop: 8,
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  primaryButton: {
    marginTop: 12,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#001019',
    fontWeight: '700',
  },
  secondaryButton: {
    marginTop: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: Colors.textPrimary,
    fontWeight: '600',
  },
});
