import { Tabs } from "expo-router";
import { View, StyleSheet } from "react-native";
import { Colors, Spacing } from "../shared/theme";

function TabIcon({ focused, color }) {
  return null;
}

export default function RootLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.tabBarActive,
        tabBarInactiveTintColor: Colors.tabBarInactive,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Hub", tabBarLabel: "Hub" }}
      />
      <Tabs.Screen
        name="journeys"
        options={{ title: "Journeys", tabBarLabel: "Journeys" }}
      />
      <Tabs.Screen
        name="discover"
        options={{ title: "Discover", tabBarLabel: "Discover" }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: "Profile", tabBarLabel: "Profile" }}
      />
      <Tabs.Screen
        name="journeyDetail"
        options={{ href: null }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.tabBarBg,
    borderTopWidth: 1,
    borderTopColor: Colors.tabBarBorder,
    paddingBottom: Spacing.sm,
    paddingTop: Spacing.sm,
    height: 64,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: "600",
  },
});
