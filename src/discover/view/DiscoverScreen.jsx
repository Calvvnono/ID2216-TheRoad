import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { observer } from 'mobx-react-lite';
import { Colors } from '../../shared/theme/colors';
import { StatusOverlay } from '../../shared/ui/StatusOverlay';
import { DiscoverPresenter } from '../presenter/DiscoverPresenter';
import { FeaturedRecommendationCarousel } from './FeaturedRecommendationCarousel';
import { CommunityInsightsSection } from './CommunityInsightsSection';
import { PlaceDetailModal } from './PlaceDetailModal';

export const DiscoverScreen = observer(function DiscoverScreen() {
  useEffect(() => {
    DiscoverPresenter.init();
  }, []);

  const loadStatus = DiscoverPresenter.getLoadStatus();
  const errorMessage = DiscoverPresenter.getErrorMessage();
  const topPicks = DiscoverPresenter.getTopPicks();
  const communityInsights = DiscoverPresenter.getCommunityInsights();
  const wishToggleStatus = DiscoverPresenter.getWishToggleStatus();
  const selectedPlace = DiscoverPresenter.getSelectedPlace();
  const placeDetail = DiscoverPresenter.getPlaceDetail();
  const detailStatus = DiscoverPresenter.getDetailStatus();

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
          nestedScrollEnabled
        >
          <FeaturedRecommendationCarousel
            places={topPicks}
            onCardPress={(place) => DiscoverPresenter.onPlacePress(place)}
            onLike={(place) => DiscoverPresenter.onToggleWishlist(place)}
            onUnlike={(place) => DiscoverPresenter.onUnlikePlace(place)}
            toggleStatus={wishToggleStatus}
          />
          <CommunityInsightsSection
            items={communityInsights}
            onPress={(place) => DiscoverPresenter.onPlacePress(place)}
          />
        </ScrollView>
      </StatusOverlay>

      <PlaceDetailModal
        place={selectedPlace}
        detail={placeDetail}
        detailStatus={detailStatus}
        onClose={() => DiscoverPresenter.onCloseDetail()}
      />
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
    paddingBottom: 8,
    paddingTop: 12,
  },
});
