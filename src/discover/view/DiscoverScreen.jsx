import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { observer } from 'mobx-react-lite';
import { Colors } from '../../shared/theme/colors';
import { StatusOverlay } from '../../shared/ui/StatusOverlay';
import { DiscoverPresenter } from '../presenter/DiscoverPresenter';
import { SearchBar } from './SearchBar';
import { InsightsCard } from './InsightsCard';
import { DestinationList } from './DestinationList';

/**
 * DiscoverScreen — primary View for Discover tab.
 *
 * Concern separation:
 * - View: this file + subviews
 * - Presenter: DiscoverPresenter
 * - App State: DiscoverStore (MobX)
 * - Persistence: DiscoverService
 */
export const DiscoverScreen = observer(function DiscoverScreen() {
  useEffect(() => {
    DiscoverPresenter.init();
  }, []);

  const loadStatus = DiscoverPresenter.getLoadStatus();
  const errorMessage = DiscoverPresenter.getErrorMessage();
  const searchQuery = DiscoverPresenter.getSearchQuery();
  const insights = DiscoverPresenter.getInsights();
  const destinations = DiscoverPresenter.getDestinations();

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle} numberOfLines={1}>
          The Road Goes Ever On
        </Text>
        <Text style={styles.headerSubtitle}>All the World's a Road</Text>
      </View>

      <StatusOverlay
        status={loadStatus}
        errorMessage={errorMessage}
        onRetry={() => DiscoverPresenter.reload()}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.pageTitle}>Discover</Text>
          <SearchBar
            value={searchQuery}
            onChangeText={(text) => DiscoverPresenter.onSearchChange(text)}
          />
          <InsightsCard insights={insights} />
          <DestinationList destinations={destinations} />
        </ScrollView>
      </StatusOverlay>
    </View>
  );
});

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginTop: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  pageTitle: {
    marginTop: 18,
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
});

