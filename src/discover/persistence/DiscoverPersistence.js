import { collectionGroup, getDocs, limit, query } from 'firebase/firestore';
import { reaction } from 'mobx';
import { profileStore } from '../../profile/model/ProfileStore';
import { ProfilePersistence } from '../../profile/persistence/ProfilePersistence';
import {
  aggregateCommunityKeywordCounts,
  pickCommunityKeywordCounts,
} from '../../profile/model/interestKeywords';
import { isDailyAwardSatisfied, XP_EVENT_KEYS } from '../../profile/model/xpSystem';
import { journeysStore } from '../../journeys/model/JourneysStore';
import { JourneysPersistence } from '../../journeys/persistence/JourneysPersistence';
import { discoverStore } from '../model/DiscoverStore';
import { placesClient } from '../../shared/api/placesClient';
import { db } from '../../shared/api/firebaseClient';

const COMMUNITY_SAMPLE_SIZE = 120;
let hasStartedDiscoverReaction = false;

function mapApiPlace(place, keyword) {
  return {
    id: place.id,
    name: place.displayName?.text ?? 'Unknown',
    country: place.shortFormattedAddress ?? '',
    imageUrl: place.photos?.[0] ? placesClient.photoUrl(place.photos[0].name) : null,
    reason: place.editorialSummary?.text ?? `Top ${keyword} destination`,
    keywords: [keyword],
  };
}

async function fetchCommunityJourneySample(maxDocs = COMMUNITY_SAMPLE_SIZE) {
  try {
    const snap = await getDocs(query(collectionGroup(db, 'journeys'), limit(maxDocs)));
    return snap.docs.map((d) => d.data() || {});
  } catch (e) {
    console.warn('Community journeys read failed:', e?.message || e);
    return [];
  }
}

function mapDetail(raw) {
  return {
    name: raw.displayName?.text ?? '',
    address: raw.shortFormattedAddress ?? '',
    description: raw.editorialSummary?.text ?? null,
    rating: raw.rating ?? null,
    ratingCount: raw.userRatingCount ?? null,
    website: raw.websiteUri ?? null,
    openingHours: raw.regularOpeningHours?.weekdayDescriptions ?? null,
  };
}

function buildOverlayLine(budget, forYouKeywords, place) {
  const love =
    forYouKeywords.slice(0, 2).join(' & ') || 'culture & adventure';
  return `$${budget}/day · ${love} · ${place.reason}`;
}

async function searchByKeywords(keywords, offset, seen) {
  if (!Array.isArray(keywords) || keywords.length === 0) return [];
  const results = await Promise.all(
    keywords.map((kw, i) => placesClient.searchText(kw, i + offset)),
  );
  return results
    .flatMap((places, i) => places.map((p) => mapApiPlace(p, keywords[i])))
    .filter((p) => {
      if (seen.has(p.id) || !p.imageUrl) return false;
      seen.add(p.id);
      return true;
    });
}

export const DiscoverPersistence = {
  init() {
    this.startAutoReload();
    JourneysPersistence.init();
    ProfilePersistence.init();
    if (discoverStore.loadStatus === 'idle') {
      discoverStore.setLoadStarted();
    }
  },

  startAutoReload() {
    if (hasStartedDiscoverReaction) return;
    hasStartedDiscoverReaction = true;
    reaction(
      () => {
        if (profileStore.loadStatus !== 'success') return null;
        const journeysStatus = journeysStore.loadStatus;
        if (journeysStatus !== 'success' && journeysStatus !== 'error') return null;
        const budget = profileStore.preferences?.budgetPerDay ?? 200;
        const forYou = profileStore.forYouKeywords.join('|');
        return `${budget}|${forYou}`;
      },
      (signature, previousSignature) => {
        if (!signature || signature === previousSignature) return;
        void this.loadAll();
      },
    );
  },

  async loadAll() {
    discoverStore.setLoadStarted();
    try {
      const { topPicks, communityInsights } =
        await this.fetchDiscoverPage({
          forYouKeywords: profileStore.forYouKeywords,
          budget: profileStore.preferences?.budgetPerDay ?? 200,
        });
      const discoverAward = isDailyAwardSatisfied(
        profileStore.profile?.xpMeta,
        XP_EVENT_KEYS.DAILY_DISCOVER_BROWSE,
      )
        ? { isAwarded: false }
        : await ProfilePersistence.awardDailyDiscoverBrowseXp();
      if (discoverAward?.isAwarded) {
        await ProfilePersistence.refreshProfile();
      }
      discoverStore.setDiscoverData(topPicks, communityInsights);
    } catch (e) {
      discoverStore.setLoadError(e.message ?? 'Failed to load discover data');
    }
  },

  async updateWishlistLiked(place, liked) {
    if (!!place.isInWishlist === liked) return;
    discoverStore.setWishToggleStarted();
    try {
      await this.setWishlistLiked(place, liked);
      discoverStore.setTopPickLiked(place.id, liked);
      ProfilePersistence.refreshWishlist();
    } catch (e) {
      discoverStore.setWishToggleError(e.message ?? 'Could not update wishlist');
    }
  },

  async openPlaceDetail(place) {
    discoverStore.setSelectedPlaceLoading({
      id: place.id,
      name: place.name,
      country: place.country,
      imageUrl: place.imageUrl,
      whyVisit: place.reason ?? null,
    });
    const detail = await this.fetchPlaceDetail(place.id, place.name);
    discoverStore.setPlaceDetail(detail);
  },

  async fetchDiscoverPage({ forYouKeywords = [], budget = 200 } = {}) {
    const [wishlist, communitySample] = await Promise.all([
      ProfilePersistence.fetchWishlist(),
      fetchCommunityJourneySample(),
    ]);
    const wishlistIds = new Set(wishlist.map((w) => w.id));

    const excludeSet = new Set(
      forYouKeywords.map((k) => String(k || '').trim().toLowerCase()).filter(Boolean),
    );
    const communityCounts = aggregateCommunityKeywordCounts(communitySample);
    const communityPicks = pickCommunityKeywordCounts(communityCounts, excludeSet, 3);
    const communityKeywords = communityPicks.map(([token]) => token);
    const communityCountByKeyword = new Map(communityPicks);

    const seen = new Set();
    const rawPicks = (
      await searchByKeywords(forYouKeywords, 0, seen)
    ).slice(0, 4);
    const rawInsights = (
      await searchByKeywords(communityKeywords, 3, seen)
    ).slice(0, 4);

    const topPicks = rawPicks.map((p) => ({
      ...p,
      overlayLine: buildOverlayLine(budget, forYouKeywords, p),
      isInWishlist: wishlistIds.has(p.id),
    }));

    const communityInsights = rawInsights.map((p) => {
      const keyword = p.keywords?.[0] ?? '';
      const count = communityCountByKeyword.get(keyword) ?? 0;
      const peerNote =
        count >= 2
          ? `Shared by ${count} travelers`
          : 'Trending in the community';
      return {
        ...p,
        badge: keyword,
        peerNote,
        isInWishlist: wishlistIds.has(p.id),
      };
    });

    return { topPicks, communityInsights };
  },

  async fetchPlaceDetail(placeId, placeName) {
    try {
      const raw = await placesClient.getPlaceDetail(placeId);
      return mapDetail(raw);
    } catch {
      if (!placeName) return null;
      try {
        const found = await placesClient.searchByName(placeName);
        if (!found) return null;
        const raw = await placesClient.getPlaceDetail(found.id);
        return mapDetail(raw);
      } catch {
        return null;
      }
    }
  },

  async setWishlistLiked(place, liked) {
    if (liked) {
      await ProfilePersistence.addWishlistItem({
        id: place.id,
        name: place.name,
        imageUrl: place.imageUrl,
        keywords: place.keywords ?? [],
      });
    } else {
      await ProfilePersistence.removeWishlistItem(place.id);
    }
  },
};
