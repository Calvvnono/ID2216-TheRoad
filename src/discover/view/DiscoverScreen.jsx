import React, { useEffect } from 'react';
import { View, Image, ScrollView, StyleSheet } from 'react-native';
import { Colors } from '../../shared/theme/colors';
import { StatusOverlay } from '../../shared/ui/StatusOverlay';
import { FeaturedRecommendationCarousel } from './FeaturedRecommendationCarousel';
import { CommunityInsightsSection } from './CommunityInsightsSection';
import { PlaceDetailModal } from './PlaceDetailModal';

const APP_HEADER_LOGO = require('../../shared/assets/logo_pic.png');
const HEADER_LOGO_TOP = 10;
const HEADER_LOGO_SIZE = 80;
const CONTENT_BELOW_LOGO = HEADER_LOGO_TOP + HEADER_LOGO_SIZE + 8;

export function DiscoverScreen({
  loadStatus,
  errorMessage,
  topPicks,
  communityInsights,
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
      <Image source={APP_HEADER_LOGO} style={styles.floatingLogo} resizeMode="contain" />
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
  floatingLogo: {
    position: 'absolute',
    top: HEADER_LOGO_TOP,
    left: 20,
    width: HEADER_LOGO_SIZE,
    height: HEADER_LOGO_SIZE,
    zIndex: 20,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 8,
    paddingTop: CONTENT_BELOW_LOGO,
  },
});
