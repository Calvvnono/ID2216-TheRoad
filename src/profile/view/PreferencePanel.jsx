import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../shared/theme/colors';

export function PreferencePanel({
  preferences,
  interestTags,
  totalSpent,
  avgDailyBudget,
  journeyCount,
}) {
  const tags = Array.isArray(interestTags) ? interestTags : [];
  const hasJourneys = journeyCount > 0;

  return (
    <View style={styles.card}>
      <Text style={styles.cardHeader}>Preferences</Text>

      <View style={styles.divider} />

      <Text style={styles.rowLabel}>Spending Overview</Text>
      <Text style={styles.helperText}>Calculated from your journey data</Text>

      {hasJourneys ? (
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>${totalSpent.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Total spent</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>${avgDailyBudget}/day</Text>
            <Text style={styles.statLabel}>Avg. daily spend</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{journeyCount}</Text>
            <Text style={styles.statLabel}>
              {journeyCount === 1 ? 'Journey' : 'Journeys'}
            </Text>
          </View>
        </View>
      ) : (
        <Text style={styles.emptyText}>
          Add journeys to see your spending stats.
        </Text>
      )}

      <View style={styles.divider} />

      <Text style={styles.rowLabel}>Your Travel Style</Text>
      <Text style={styles.helperText}>Derived from your journey tags</Text>
      <View style={styles.tagWrap}>
        {tags.length === 0 ? (
          <Text style={styles.emptyText}>
            Create journeys with tags to personalize your travel style.
          </Text>
        ) : (
          tags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
    padding: 16,
    marginTop: 24,
  },
  cardHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderSubtle,
    marginVertical: 14,
  },
  rowLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  helperText: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    paddingVertical: 12,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.borderSubtle,
  },
  emptyText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 2,
  },
  tag: {
    backgroundColor: Colors.chipBg,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: Colors.chipBorder,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.primary,
  },
});
