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

function parseDateOnly(value) {
  if (!value) return null;
  const d = new Date(`${value}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function journeyDurationDays(j) {
  const start = parseDateOnly(j.startDate);
  const end = parseDateOnly(j.endDate);
  if (!start || !end) return 1;
  return Math.max(1, Math.floor((end.getTime() - start.getTime()) / 86400000) + 1);
}

function computeAvgDailyBudget(journeys) {
  if (!Array.isArray(journeys) || journeys.length === 0) return 200;
  const totalSpent = journeys.reduce((sum, j) => sum + (Number(j.spent) || 0), 0);
  const totalDays = journeys.reduce((sum, j) => sum + journeyDurationDays(j), 0);
  return totalDays > 0 ? Math.round(totalSpent / totalDays) : 200;
}

function mapApiPlace(place, keyword) {
  return {
    id: place.id,
    name: place.displayName?.text ?? 'Unknown',
    country: place.shortFormattedAddress ?? '',
    imageUrl: place.photos?.[0] ? placesClient.photoUrl(place.photos[0].name) : null,
    reason: place.editorialSummary?.text ?? `Popular ${keyword} destination`,
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
  const love = forYouKeywords.slice(0, 2).join(' & ') || 'culture & adventure';
  const budgetLabel = budget > 0 ? `$${budget}/day · ` : '';
  return `${budgetLabel}${love} · ${place.reason}`;
}

async function searchPlacesByQuery(keyword, textQuery, seen) {
  try {
    const places = await placesClient.searchByQuery(textQuery);
    return places
      .map((p) => mapApiPlace(p, keyword))
      .filter((p) => {
        if (seen.has(p.id) || !p.imageUrl) return false;
        seen.add(p.id);
        return true;
      });
  } catch {
    return [];
  }
}

async function searchByKeywords(keywordQueryPairs, seen) {
  if (!Array.isArray(keywordQueryPairs) || keywordQueryPairs.length === 0) return [];
  const results = await Promise.all(
    keywordQueryPairs.map(({ keyword, query }) => searchPlacesByQuery(keyword, query, seen)),
  );
  return results.flat();
}

function buildPicksQueryPairs(locations, styleTags, fallbacks) {
  if (locations.length > 0 && styleTags.length > 0) {
    const pairs = [];
    locations.slice(0, 2).forEach((loc) => {
      pairs.push({ keyword: loc, query: `${styleTags[0]} attractions in ${loc}` });
    });
    styleTags.forEach((tag) => {
      pairs.push({ keyword: tag, query: `best ${tag} travel destinations` });
    });
    return pairs.slice(0, 4);
  }
  if (styleTags.length > 0) {
    return styleTags.map((tag) => ({
      keyword: tag,
      query: `best ${tag} travel destinations`,
    }));
  }
  if (locations.length > 0) {
    return locations.map((loc) => ({
      keyword: loc,
      query: `top tourist attractions in ${loc}`,
    }));
  }
  return fallbacks.slice(0, 3).map((kw) => ({
    keyword: kw,
    query: `top tourist attractions in ${kw}`,
  }));
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
        const forYou = profileStore.forYouKeywords.join('|');
        return forYou || 'default';
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
      const avgBudget = computeAvgDailyBudget(journeysStore.journeys);

      const { topPicks, communityInsights } = await this.fetchDiscoverPage({
        forYouKeywords: profileStore.forYouKeywords,
        budget: avgBudget,
        userJourneys: journeysStore.journeys,
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
    discoverStore.setWishToggleStarted(place.id);
    try {
      await this.setWishlistLiked(place, liked);
      discoverStore.setTopPickLiked(place.id, liked);
      ProfilePersistence.refreshWishlist();
    } catch (e) {
      discoverStore.setWishToggleError(place.id, e.message ?? 'Could not update wishlist');
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

  async fetchDiscoverPage({ forYouKeywords = [], budget = 200, userJourneys = [] } = {}) {
    const [wishlist, communitySample] = await Promise.all([
      ProfilePersistence.fetchWishlist(),
      fetchCommunityJourneySample(),
    ]);
    const wishlistIds = new Set(wishlist.map((w) => w.id));

    // User's travel style from BGM tags (activity + custom keywords)
    const userStyleTags = [...new Set(
      userJourneys.flatMap((j) => [
        ...(Array.isArray(j.bgmActivityTags) ? j.bgmActivityTags : []),
        ...(Array.isArray(j.bgmCustomKeywords) ? j.bgmCustomKeywords : []),
      ]).map((t) => String(t || '').trim().toLowerCase()).filter(Boolean),
    )].slice(0, 2);

    // User's visited locations (country or destination, deduplicated)
    const userLocations = userJourneys
      .map((j) => j.country || j.destination)
      .filter(Boolean)
      .filter((v, i, arr) => arr.indexOf(v) === i)
      .slice(0, 3);

    // Community section: exclude keywords already used in For You picks
    const picksExcludeSet = new Set([
      ...userLocations.map((k) => k.toLowerCase()),
      ...userStyleTags,
    ]);
    const communityCounts = aggregateCommunityKeywordCounts(communitySample);
    const communityPicks = pickCommunityKeywordCounts(communityCounts, picksExcludeSet, 3);
    const communityKeywords = communityPicks.map(([token]) => token);
    const communityCountByKeyword = new Map(communityPicks);

    const seen = new Set();

    // For You picks — combine style tags and locations into meaningful queries
    const picksQueryPairs = buildPicksQueryPairs(userLocations, userStyleTags, forYouKeywords);
    const rawPicks = (await searchByKeywords(picksQueryPairs, seen)).slice(0, 4);

    // Community insights — search real destinations that community travelers visited
    const communityQueryPairs = communityKeywords.map((kw) => ({
      keyword: kw,
      query: `must-visit places in ${kw}`,
    }));
    const rawInsights = (await searchByKeywords(communityQueryPairs, seen)).slice(0, 4);

    const topPicks = rawPicks.map((p) => ({
      ...p,
      overlayLine: buildOverlayLine(budget, forYouKeywords, p),
      isInWishlist: wishlistIds.has(p.id),
    }));

    const communityInsights = rawInsights.map((p) => {
      const keyword = p.keywords?.[0] ?? '';
      const count = communityCountByKeyword.get(keyword) ?? 0;
      const peerNote =
        count >= 2 ? `Visited by ${count} travelers` : 'Trending in the community';
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
