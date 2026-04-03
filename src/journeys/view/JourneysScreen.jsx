import React, { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { observer } from 'mobx-react-lite';
import { useRouter } from 'expo-router';
import { Colors } from '../../shared/theme/colors';
import { StatusOverlay } from '../../shared/ui/StatusOverlay';
import { JourneysPresenter } from '../presenter/JourneysPresenter';
import { JourneyCard } from './JourneyCard';

export const JourneysScreen = observer(function JourneysScreen() {
  const router = useRouter();

  useEffect(() => {
    JourneysPresenter.init();
  }, []);

  const loadStatus = JourneysPresenter.getLoadStatus();
  const errorMessage = JourneysPresenter.getErrorMessage();
  const journeys = JourneysPresenter.getJourneys();

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle} numberOfLines={1}>
          The Road Goes Ever On
        </Text>
        <Text style={styles.headerSubtitle}>All the World's a Road</Text>
      </View>

      <Text style={styles.pageTitle}>My Journeys</Text>
      <Text style={styles.pageSubtitle}>Tap a journey to view details</Text>

      <StatusOverlay
        status={loadStatus}
        errorMessage={errorMessage}
        onRetry={() => JourneysPresenter.reload()}
      >
        <FlatList
          data={journeys}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <JourneyCard
              journey={item}
              onPress={(journeyId) => {
                JourneysPresenter.onJourneyPress(journeyId);
                router.push({
                  pathname: '/journeyDetail',
                  params: { journeyId },
                });
              }}
            />
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No journeys yet.</Text>
          }
        />
      </StatusOverlay>

      <View style={styles.mockFab}>
        <Text style={styles.mockFabText}>+</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
  },
  header: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  pageTitle: {
    marginTop: 18,
    fontSize: 40,
    fontWeight: '300',
    color: Colors.textPrimary,
  },
  pageSubtitle: {
    marginTop: 4,
    marginBottom: 14,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  listContent: {
    paddingBottom: 110,
  },
  emptyText: {
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 30,
    fontSize: 14,
  },
  mockFab: {
    position: 'absolute',
    right: 16,
    bottom: 98,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderMedium,
  },
  mockFabText: {
    fontSize: 34,
    lineHeight: 34,
    color: Colors.textInverse,
    fontWeight: '400',
    marginTop: -2,
  },
});
