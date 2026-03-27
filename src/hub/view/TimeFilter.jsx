import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { observer } from 'mobx-react-lite';
import { Colors, Typography, Spacing, BorderRadius } from '../../shared/theme';
import HubPresenter from '../presenter/hubPresenter';

const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/**
 * Time Machine filter — year pills + scrollable month chips.
 * All data read from HubPresenter; no direct Model imports.
 */
function TimeFilter() {
  const { availableYears, availableMonths, selectedYear, selectedMonth } =
    HubPresenter;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Time Machine</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        <TouchableOpacity
          style={[styles.chip, !selectedYear && styles.chipActive]}
          onPress={() => HubPresenter.onYearChange(null)}
        >
          <Text style={[styles.chipText, !selectedYear && styles.chipTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        {availableYears.map((year) => (
          <TouchableOpacity
            key={year}
            style={[styles.chip, selectedYear === year && styles.chipActive]}
            onPress={() => HubPresenter.onYearChange(year)}
          >
            <Text
              style={[
                styles.chipText,
                selectedYear === year && styles.chipTextActive,
              ]}
            >
              {year}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {selectedYear && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.row}
        >
          <TouchableOpacity
            style={[styles.chip, selectedMonth === null && styles.chipActive]}
            onPress={() => HubPresenter.onMonthChange(null)}
          >
            <Text
              style={[
                styles.chipText,
                selectedMonth === null && styles.chipTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          {availableMonths.map((m) => (
            <TouchableOpacity
              key={m}
              style={[styles.chip, selectedMonth === m && styles.chipActive]}
              onPress={() => HubPresenter.onMonthChange(m)}
            >
              <Text
                style={[
                  styles.chipText,
                  selectedMonth === m && styles.chipTextActive,
                ]}
              >
                {MONTH_LABELS[m]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  label: {
    ...Typography.label,
    color: Colors.textSecondary,
  },
  row: {
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  chip: {
    backgroundColor: Colors.chipBg,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    borderColor: Colors.chipBorder,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  chipActive: {
    backgroundColor: Colors.primarySoft,
    borderColor: Colors.primary,
  },
  chipText: {
    ...Typography.tagText,
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
});

export default observer(TimeFilter);
