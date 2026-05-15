import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Colors } from '../../shared/theme/colors';
import { StatusOverlay } from '../../shared/ui/StatusOverlay';
import { FeaturedRecommendationCarousel } from './FeaturedRecommendationCarousel';
import { CommunityInsightsSection } from './CommunityInsightsSection';
import { PlaceDetailModal } from './PlaceDetailModal';

export function DiscoverScreen({
  loadStatus,
  errorMessage,
  topPicks,
  communityInsights,
  wishToggleStatus,
  selectedPlace,
  placeDetail,
  detailStatus,
  onInit,
  onReload,
  onToggleWishlist,
  onUnlikePlace,
  onPlacePress,
  onCloseDetail,
}) {
  useEffect(() => {
    onInit();
  }, [onInit]);

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
        onRetry={onReload}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
        >
          <FeaturedRecommendationCarousel
            places={topPicks}
            onCardPress={onPlacePress}
            onLike={onToggleWishlist}
            onUnlike={onUnlikePlace}
            toggleStatus={wishToggleStatus}
          />
          <CommunityInsightsSection
            items={communityInsights}
            onPress={onPlacePress}
          />
        </ScrollView>
      </StatusOverlay>

      <PlaceDetailModal
        place={selectedPlace}
        detail={placeDetail}
        detailStatus={detailStatus}
        onClose={onCloseDetail}
      />
    </View>
  );
}

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
    paddingBottom: 8,
    paddingTop: 12,
  },
});
