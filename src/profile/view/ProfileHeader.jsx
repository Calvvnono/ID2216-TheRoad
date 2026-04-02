import React from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { Colors } from '../../shared/theme/colors';

/**
 * Pure view — renders avatar, name, and badge.
 * Data comes via props from ProfileScreen (which gets it from presenter).
 */
export function ProfileHeader({ profile, onUploadAvatar, isUploading }) {
  const badgeLabel = `${profile.badgeLabel} Level ${profile.badgeLevel}`;

  return (
    <View style={styles.container}>
      <View style={styles.avatarRing}>
        <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
      </View>
      <Text style={styles.name}>{profile.name}</Text>
      <View style={styles.badge}>
        <View style={styles.badgeDot} />
        <Text style={styles.badgeText}>{badgeLabel}</Text>
      </View>
      <Pressable style={styles.uploadButton} onPress={onUploadAvatar}>
        <Text style={styles.uploadButtonText}>
          {isUploading ? 'Uploading...' : 'Change Avatar'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 8,
  },
  avatarRing: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 2,
    borderColor: Colors.primary,
    padding: 3,
    marginBottom: 16,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 52,
  },
  name: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primarySoft,
    borderRadius: 100,
    paddingHorizontal: 16,
    paddingVertical: 7,
    gap: 8,
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  uploadButton: {
    marginTop: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  uploadButtonText: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
});
