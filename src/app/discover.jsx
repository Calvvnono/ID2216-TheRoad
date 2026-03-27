import { View, Text } from "react-native";
import { Colors, Typography, CommonStyles } from "../shared/theme";

export default function DiscoverScreen() {
  return (
    <View style={CommonStyles.screenPadded}>
      <View style={CommonStyles.appHeader}>
        <Text style={CommonStyles.appHeaderTitle}>The Road Goes Ever On</Text>
        <Text style={CommonStyles.appHeaderSubtitle}>All the World's a Road</Text>
      </View>

      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ ...Typography.pageTitle, color: Colors.textPrimary }}>
          Discover
        </Text>
        <Text style={{ ...Typography.body, color: Colors.textSecondary, marginTop: 8 }}>
          Explore new destinations
        </Text>
      </View>
    </View>
  );
}
