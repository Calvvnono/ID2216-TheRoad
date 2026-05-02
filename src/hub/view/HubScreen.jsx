import { useLayoutEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
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

/** Hub dashboard: sole view that imports HubPresenter; children are props-driven. */
function HubScreen() {
  const [dashboardOpen, setDashboardOpen] = useState(false);

  useLayoutEffect(() => {
    HubPresenter.init();
  }, []);

  return (
    <GestureHandlerRootView style={styles.gestureRoot}>
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
                <GlobeSection
                  selectedLocationName={HubPresenter.selectedLocationName}
                  timeStartNormalized={HubPresenter.timeStartNormalized}
                  timeEndNormalized={HubPresenter.timeEndNormalized}
                  aggregatedLocationsPlain={HubPresenter.aggregatedLocationsPlain}
                  routeCoordinatesPlain={HubPresenter.routeCoordinatesPlain}
                  timeStartDateLabel={HubPresenter.timeStartDateLabel}
                  timeEndDateLabel={HubPresenter.timeEndDateLabel}
                  onMarkerPress={HubPresenter.onMarkerPress}
                  onTimeStartChange={HubPresenter.onTimeStartChange}
                  onTimeEndChange={HubPresenter.onTimeEndChange}
                  onResetTimeRange={HubPresenter.onResetTimeRange}
                />

                <TouchableOpacity
                  style={styles.dashboardBtn}
                  activeOpacity={0.88}
                  onPress={() => setDashboardOpen((v) => !v)}
                  accessibilityRole="button"
                  accessibilityLabel={
                    dashboardOpen ? 'Hide dashboard' : 'View dashboard'
                  }
                  accessibilityHint={
                    dashboardOpen
                      ? 'Collapses trip stats below the map'
                      : 'Shows trip stats cards below the map'
                  }
                >
                  <Ionicons
                    name={dashboardOpen ? 'chevron-up' : 'stats-chart-outline'}
                    size={22}
                    color={Colors.primary}
                  />
                </TouchableOpacity>

                {dashboardOpen && <StatsCards stats={HubPresenter.stats} />}
              </View>
            )}
          </View>

          {HubPresenter.isSuccess && (
            <LocationSheet
              selectedLocationName={HubPresenter.selectedLocationName}
              selectedLocation={HubPresenter.selectedLocationPlain}
              onSheetDismiss={HubPresenter.onSheetDismiss}
            />
          )}
        </View>
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
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.borderMedium,
    backgroundColor: Colors.surface,
  },
});

export default observer(HubScreen);
