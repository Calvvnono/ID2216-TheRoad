import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../shared/theme';

const CATEGORY_COLORS = {
  Food: Colors.secondary,
  Transport: Colors.primary,
  Accommodation: Colors.tertiary,
  Activities: Colors.success,
  Shopping: Colors.warning,
};

/**
 * Simple horizontal bar chart for expense category breakdown.
 * Pure view — receives data via props, no store/persistence access.
 *
 * @param {{ expensesByCategory: Object.<string, number> }} props
 */
export default function ExpenseChart({ expensesByCategory }) {
  const entries = Object.entries(expensesByCategory).sort(
    ([, a], [, b]) => b - a,
  );
  const maxAmount = entries.length > 0 ? entries[0][1] : 1;

  if (entries.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No expense data</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Expenses</Text>
      {entries.map(([category, amount]) => (
        <View key={category} style={styles.row}>
          <Text style={styles.categoryLabel}>{category}</Text>
          <View style={styles.barTrack}>
            <View
              style={[
                styles.barFill,
                {
                  width: `${(amount / maxAmount) * 100}%`,
                  backgroundColor:
                    CATEGORY_COLORS[category] || Colors.textTertiary,
                },
              ]}
            />
          </View>
          <Text style={styles.amountLabel}>${amount.toLocaleString()}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  title: {
    ...Typography.section,
    color: Colors.textPrimary,
    fontSize: 16,
    marginBottom: Spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  categoryLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    width: 100,
  },
  barTrack: {
    flex: 1,
    height: 10,
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
  },
  barFill: {
    height: 10,
    borderRadius: BorderRadius.sm,
  },
  amountLabel: {
    ...Typography.caption,
    color: Colors.textPrimary,
    fontWeight: '600',
    width: 60,
    textAlign: 'right',
  },
  empty: {
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textTertiary,
  },
});
