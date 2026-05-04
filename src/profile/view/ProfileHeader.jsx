import React from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { Colors } from '../../shared/theme/colors';

export function ProfileHeader({
  profile,
  onUploadAvatar,
  isUploading,
  onOpenTasks,
}) {
  const badgeLabel = profile.badgeLabelText;
  const progressWidth = `${profile.progressPercent ?? 0}%`;
  const progressText = profile.isMaxLevel
    ? `Level ${profile.badgeLevel} MAX`
    : `XP ${profile.xpIntoLevel}/${profile.xpNeededThisLevel} · ${profile.xpToNextLevel} to next level`;

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
      <Text style={styles.totalXpText}>Total XP: {profile.totalXp ?? 0}</Text>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: progressWidth }]} />
      </View>
      <Text style={styles.progressText}>{progressText}</Text>
      <View style={styles.actionRow}>
        <Pressable style={styles.uploadButton} onPress={onUploadAvatar}>
          <Text style={styles.uploadButtonText}>
            {isUploading ? 'Uploading...' : 'Change Avatar'}
          </Text>
        </Pressable>
        <Pressable style={styles.taskButton} onPress={onOpenTasks}>
          <Text style={styles.taskButtonText}>Upgrade Tasks</Text>
        </Pressable>
      </View>
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
  totalXpText: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  progressTrack: {
    width: '88%',
    height: 8,
    borderRadius: 999,
    marginTop: 8,
    backgroundColor: Colors.borderSubtle,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: Colors.primary,
  },
  progressText: {
    marginTop: 6,
    fontSize: 11,
    color: Colors.textSecondary,
  },
  actionRow: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    justifyContent: 'center',
  },
  uploadButton: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
    borderRadius: 999,
    minHeight: 40,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadButtonText: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  taskButton: {
    backgroundColor: Colors.success,
    borderRadius: 999,
    minHeight: 40,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskButtonText: {
    color: Colors.textInverse,
    fontSize: 12,
    fontWeight: '700',
  },
});
