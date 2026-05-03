import { collectionGroup, getDocs, limit, query } from 'firebase/firestore';
import { ProfileService } from '../../profile/model/ProfileService';
import {
  aggregateCommunityKeywordCounts,
  pickCommunityKeywordCounts,
} from '../../profile/model/interestKeywords';
import { placesClient } from '../../shared/api/placesClient';
import { db } from '../../shared/api/firebaseClient';

const COMMUNITY_SAMPLE_SIZE = 120;

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

export const DiscoverService = {
  async fetchDiscoverPage({ forYouKeywords = [], budget = 200 } = {}) {
    const [wishlist, communitySample] = await Promise.all([
      ProfileService.fetchWishlist(),
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
      await ProfileService.addWishlistItem({
        id: place.id,
        name: place.name,
        imageUrl: place.imageUrl,
        keywords: place.keywords ?? [],
      });
    } else {
      await ProfileService.removeWishlistItem(place.id);
    }
  },
};
