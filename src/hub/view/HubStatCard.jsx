import { View, Text } from 'react-native';
import { CommonStyles } from '../../shared/theme';

/**
 * Single stat tile for the Hub dashboard row (props only — no store).
 */
export default function HubStatCard({ label, value, borderColor }) {
  return (
    <View style={[CommonStyles.statCard, { borderColor }]}>
      <Text style={CommonStyles.statValue}>{value}</Text>
      <Text style={CommonStyles.statLabel}>{label}</Text>
    </View>
  );
}
