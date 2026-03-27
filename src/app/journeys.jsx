import { View, Text } from "react-native";
import { Colors, Typography, CommonStyles } from "../shared/theme";

export default function JourneysScreen() {
  return (
    <View style={CommonStyles.screenPadded}>
      <View style={CommonStyles.appHeader}>
        <Text style={CommonStyles.appHeaderTitle}>The Road Goes Ever On</Text>
        <Text style={CommonStyles.appHeaderSubtitle}>All the World's a Road</Text>
      </View>

      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ ...Typography.pageTitle, color: Colors.textPrimary }}>
          My Journeys
        </Text>
        <Text style={{ ...Typography.body, color: Colors.textSecondary, marginTop: 8 }}>
          Tap a journey to view details
        </Text>
      </View>
    </View>
  );
}
