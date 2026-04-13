import { View, StyleSheet } from 'react-native';
import { Colors, Spacing } from '../../shared/theme';
import HubStatCard from './HubStatCard';

/**
 * Horizontal row of summary statistics for filtered trips.
 * Stats object passed from HubScreen (HubPresenter.stats).
 */
function StatsCards({ stats }) {
  const { totalTrips, totalDays, totalExpenses } = stats;

  return (
    <View style={styles.row}>
      <HubStatCard
        label="Trips"
        value={totalTrips}
        borderColor={Colors.primary}
      />
      <HubStatCard
        label="Days"
        value={totalDays}
        borderColor={Colors.secondary}
      />
      <HubStatCard
        label="Spent"
        value={`$${totalExpenses.toLocaleString()}`}
        borderColor={Colors.tertiary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
});

export default StatsCards;
