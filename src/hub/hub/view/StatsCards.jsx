import { View, Text, StyleSheet } from 'react-native';
import { observer } from 'mobx-react-lite';
import { Colors, Spacing, CommonStyles } from '../../shared/theme';
import HubPresenter from '../presenter/hubPresenter';

/**
 * Horizontal row of summary statistics for filtered trips.
 * All data read from HubPresenter; no direct Model imports.
 */
function StatsCards() {
  const { totalTrips, totalDays, totalExpenses } = HubPresenter.stats;

  return (
    <View style={styles.row}>
      <StatCard
        label="Trips"
        value={totalTrips}
        borderColor={Colors.primary}
      />
      <StatCard
        label="Days"
        value={totalDays}
        borderColor={Colors.secondary}
      />
      <StatCard
        label="Spent"
        value={`$${totalExpenses.toLocaleString()}`}
        borderColor={Colors.tertiary}
      />
    </View>
  );
}

function StatCard({ label, value, borderColor }) {
  return (
    <View style={[CommonStyles.statCard, { borderColor }]}>
      <Text style={CommonStyles.statValue}>{value}</Text>
      <Text style={CommonStyles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
});

export default observer(StatsCards);
