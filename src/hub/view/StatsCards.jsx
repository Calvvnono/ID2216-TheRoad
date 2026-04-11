import { View, StyleSheet } from 'react-native';
import { observer } from 'mobx-react-lite';
import { Colors, Spacing } from '../../shared/theme';
import HubPresenter from '../presenter/hubPresenter';
import HubStatCard from './HubStatCard';

/**
 * Horizontal row of summary statistics for filtered trips.
 * All data read from HubPresenter; no direct Model imports.
 */
function StatsCards() {
  const { totalTrips, totalDays, totalExpenses } = HubPresenter.stats;

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

export default observer(StatsCards);
