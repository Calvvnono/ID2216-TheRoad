import { useLayoutEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import {
  Colors,
  Typography,
  Spacing,
  CommonStyles,
  BorderRadius,
} from '../../shared/theme';
import HubPresenter from '../presenter/hubPresenter';
import GlobeSection from './GlobeSection';
import StatsCards from './StatsCards';
import LocationSheet from './LocationSheet';

/** Hub dashboard: GlobeSection, stats, location sheet; state via HubPresenter / MobX. */
function HubScreen() {
  const [dashboardOpen, setDashboardOpen] = useState(false);

  useLayoutEffect(() => {
    HubPresenter.init();
  }, []);

  return (
    <GestureHandlerRootView style={styles.gestureRoot}>
      <SafeAreaProvider>
        <View style={styles.root}>
          <View style={CommonStyles.screenPadded}>
            <View style={CommonStyles.appHeader}>
              <Text style={CommonStyles.appHeaderTitle}>The Road Goes Ever On</Text>
              <Text style={CommonStyles.appHeaderSubtitle}>
                All the World's a Road
              </Text>
            </View>

            {HubPresenter.isAwaitingData && (
              <View style={styles.centered}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.statusText}>Loading your journeys…</Text>
              </View>
            )}

            {HubPresenter.isError && (
              <View style={styles.centered}>
                <View style={styles.errorIcon}>
                  <Text style={styles.errorIconText}>!</Text>
                </View>
                <Text style={styles.statusText}>
                  {HubPresenter.error || 'Something went wrong.'}
                </Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={HubPresenter.onRetry}
                >
                  <Text style={styles.retryText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            )}

            {HubPresenter.isSuccess && (
              <View style={styles.body}>
                <GlobeSection />

                <TouchableOpacity
                  style={styles.dashboardBtn}
                  activeOpacity={0.88}
                  onPress={() => setDashboardOpen((v) => !v)}
                >
                  <Text style={styles.dashboardChevron}>
                    {dashboardOpen ? '⌄' : '⌃'}
                  </Text>
                  <Text style={styles.dashboardBtnText}>
                    {dashboardOpen ? 'Hide dashboard' : 'View Dashboard'}
                  </Text>
                </TouchableOpacity>

                {dashboardOpen && <StatsCards />}
              </View>
            )}
          </View>

          {HubPresenter.isSuccess && <LocationSheet />}
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  gestureRoot: {
    flex: 1,
  },
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  body: {
    flex: 1,
    gap: Spacing.lg,
    marginTop: Spacing.lg,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  statusText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  errorIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.dangerMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorIconText: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.danger,
  },
  retryButton: {
    backgroundColor: Colors.primarySoft,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
  },
  retryText: {
    ...Typography.buttonText,
    color: Colors.primary,
  },
  dashboardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xxl,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    borderColor: Colors.borderMedium,
    backgroundColor: Colors.surface,
  },
  dashboardChevron: {
    fontSize: 18,
    color: Colors.primary,
    fontWeight: '700',
  },
  dashboardBtnText: {
    ...Typography.buttonText,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
});

export default observer(HubScreen);
