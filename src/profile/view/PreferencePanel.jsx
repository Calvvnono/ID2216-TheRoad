import React from 'react';
import { View, Text, StyleSheet, TextInput, Pressable } from 'react-native';
import { Colors } from '../../shared/theme/colors';

export function PreferencePanel({
  preferences,
  budgetInput,
  onBudgetInputChange,
  onBudgetSave,
}) {
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
        <View style={styles.inlineEditor}>
          <TextInput
            value={budgetInput}
            onChangeText={onBudgetInputChange}
            keyboardType="number-pad"
            style={styles.budgetInput}
            placeholder="Budget"
            placeholderTextColor={Colors.textTertiary}
          />
          <Pressable
            style={styles.saveButton}
            onPress={onBudgetSave}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </Pressable>
        </View>
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
  inlineEditor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  budgetInput: {
    width: 86,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
    color: Colors.textPrimary,
    textAlign: 'center',
    fontSize: 13,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  saveButtonText: {
    color: Colors.surface,
    fontSize: 12,
    fontWeight: '600',
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
