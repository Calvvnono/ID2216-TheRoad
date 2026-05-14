import '../auth/persistence/authPersistence';
import { Tabs } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import { Colors, Spacing } from '../shared/theme';
import { authStore } from '../auth/model/authStore';
import AuthPresenter from '../auth/presenter/AuthPresenter';

export default observer(function RootLayout() {
  if (authStore.authStatus === 'loading') {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (authStore.authStatus === 'unauthenticated') {
    return <AuthPresenter />;
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeRoot} edges={['top']}>
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
            options={{ title: 'Hub', tabBarLabel: 'Hub' }}
          />
          <Tabs.Screen
            name="journeys"
            options={{ title: 'Journeys', tabBarLabel: 'Journeys' }}
          />
          <Tabs.Screen
            name="discover"
            options={{ title: 'Discover', tabBarLabel: 'Discover' }}
          />
          <Tabs.Screen
            name="profile"
            options={{ title: 'Profile', tabBarLabel: 'Profile' }}
          />
          <Tabs.Screen
            name="journeyDetail"
            options={{ href: null }}
          />
        </Tabs>
      </SafeAreaView>
    </SafeAreaProvider>
  );
});

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  safeRoot: {
    flex: 1,
    backgroundColor: Colors.background,
  },
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
    fontWeight: '600',
  },
});
