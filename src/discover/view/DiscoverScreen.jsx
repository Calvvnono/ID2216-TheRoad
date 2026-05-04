import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Image } from 'react-native';
import { observer } from 'mobx-react-lite';
import { Colors } from '../../shared/theme/colors';
import { StatusOverlay } from '../../shared/ui/StatusOverlay';
import { DiscoverPresenter } from '../presenter/DiscoverPresenter';
import { FeaturedRecommendationCarousel } from './FeaturedRecommendationCarousel';
import { CommunityInsightsSection } from './CommunityInsightsSection';
import { PlaceDetailModal } from './PlaceDetailModal';

const APP_HEADER_LOGO = require('../../shared/assets/logo_pic.png');

/** Space below floating logo so titles/content never overlap it */
const HEADER_LOGO_TOP = 10;
const HEADER_LOGO_SIZE = 80;
const CONTENT_BELOW_LOGO = HEADER_LOGO_TOP + HEADER_LOGO_SIZE + 8;

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
      <Image source={APP_HEADER_LOGO} style={styles.floatingLogo} resizeMode="contain" />
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
          <Text style={styles.pageTitle}>Discover</Text>
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
  pageTitle: {
    fontSize: 40,
    fontWeight: '300',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },
});
