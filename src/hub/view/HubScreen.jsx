import { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { observer } from 'mobx-react-lite';
import {
  Colors,
  Typography,
  Spacing,
  CommonStyles,
  BorderRadius,
} from '../../shared/theme';
import HubPresenter from '../presenter/hubPresenter';
import MapSection from './MapSection';
import TimeFilter from './TimeFilter';
import StatsCards from './StatsCards';
import LocationSheet from './LocationSheet';

/**
 * Hub — primary dashboard screen.
 *
 * Composes MapSection, TimeFilter, StatsCards, and LocationSheet.
 * Handles top-level loading / error / empty states.
 * All data and actions go through HubPresenter only.
 */
function HubScreen() {
  useEffect(() => {
    HubPresenter.init();
  }, []);

  return (
    <View style={styles.root}>
      <View style={CommonStyles.screenPadded}>
        <View style={CommonStyles.appHeader}>
          <Text style={CommonStyles.appHeaderTitle}>The Road Goes Ever On</Text>
          <Text style={CommonStyles.appHeaderSubtitle}>
            All the World's a Road
          </Text>
        </View>

        {HubPresenter.isLoading && (
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
            <TimeFilter />
            <StatsCards />

            {HubPresenter.hasFilteredTrips ? (
              <MapSection />
            ) : (
              <View style={styles.centered}>
                <Text style={styles.emptyTitle}>No trips found</Text>
                <Text style={styles.statusText}>
                  Try adjusting the time filter above.
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      {HubPresenter.isSuccess && <LocationSheet />}
    </View>
  );
}

const styles = StyleSheet.create({
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
  emptyTitle: {
    ...Typography.cardTitle,
    color: Colors.textSecondary,
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
});

export default observer(HubScreen);
