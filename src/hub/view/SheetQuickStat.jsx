import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../shared/theme';

/**
 * One metric in the location bottom sheet header row (props only — no store).
 */
export default function SheetQuickStat({ label, value, color }) {
  return (
    <View style={[styles.quickStat, { borderColor: color }]}>
      <Text style={[styles.quickStatValue, { color }]}>{value}</Text>
      <Text style={styles.quickStatLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  quickStat: {
    flex: 1,
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    padding: Spacing.md,
    alignItems: 'center',
  },
  quickStatValue: {
    ...Typography.statSmall,
  },
  quickStatLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.xxs,
  },
});
