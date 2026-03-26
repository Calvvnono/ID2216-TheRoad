import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../shared/theme/colors';

/**
 * Pure view — renders preferences card (budget + activity tags).
 * Data comes via props; no direct persistence access.
 */
export function PreferencePanel({ preferences }) {
  const budgetDisplay = `$${preferences.budgetPerDay}/day`;

  return (
    <View style={styles.card}>
      <Text style={styles.cardHeader}>Preferences</Text>

      <View style={styles.divider} />

      <View style={styles.row}>
        <View>
          <Text style={styles.rowLabel}>Budget Limits</Text>
          <Text style={styles.rowValue}>{budgetDisplay}</Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </View>

      <View style={styles.divider} />

      <Text style={styles.rowLabel}>Favorite Activities</Text>
      <View style={styles.tagWrap}>
        {preferences.favoriteActivities.map((tag) => (
          <View key={tag} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  rowValue: {
    fontSize: 14,
    color: Colors.primary,
  },
  chevron: {
    fontSize: 22,
    color: Colors.textTertiary,
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
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
