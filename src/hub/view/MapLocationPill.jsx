import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, BorderRadius } from '../../shared/theme';

/**
 * Compact stat pill inside a map location card (props only — no store).
 */
export default function MapLocationPill({ label, value, color }) {
  return (
    <View style={[styles.pill, { borderColor: color }]}>
      <Text style={[styles.pillValue, { color }]}>{value}</Text>
      <Text style={styles.pillLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.surfaceLight,
  },
  pillValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  pillLabel: {
    fontSize: 10,
    color: Colors.textTertiary,
    marginTop: 1,
  },
});
