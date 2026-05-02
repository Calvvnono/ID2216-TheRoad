import * as FileSystem from 'expo-file-system/legacy';
import { getDownloadURL, ref } from 'firebase/storage';
import { signInAnonymously } from 'firebase/auth';
import { placesClient } from '../../shared/api/placesClient';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  runTransaction,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { auth, db, storage } from '../../shared/api/firebaseClient';
import {
  computeProgress,
  levelFromXp,
  titleForLevel,
  XP_EVENT_KEYS,
} from './xpSystem';

const DEFAULT_PROFILE = {
  name: 'New Traveler',
  avatarUrl:
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop',
  badgeLabel: 'Trail Rookie',
  badgeLevel: 1,
};

const INITIAL_XP = 40;
const INITIAL_GRANTED_KEYS = [XP_EVENT_KEYS.FIRST_PROFILE_BOOTSTRAP];

const DEFAULT_PREFERENCES = {
  budgetPerDay: 200,
  currency: 'USD',
  favoriteActivities: ['Culture', 'Adventure', 'Food', 'Nature', 'Photography'],
};

async function ensureUid(uidArg) {
  if (typeof uidArg === 'string' && uidArg) return uidArg;
  if (auth.currentUser?.uid) return auth.currentUser.uid;
  const cred = await signInAnonymously(auth);
  return cred.user.uid;
}

function userRef(uid) {
  return doc(db, `users/${uid}`);
}

function prefsRef(uid) {
  return doc(db, `users/${uid}/preferences/main`);
}

function wishlistRef(uid) {
  return collection(db, `users/${uid}/wishlist`);
}

function placeWishlistRef(uid, placeId) {
  return doc(db, `users/${uid}/wishlist/${placeId}`);
}

function normalizeProfileFromDoc(uid, data = {}) {
  const totalXpRaw = Number(data.totalXp);
  const totalXp = Number.isFinite(totalXpRaw)
    ? Math.max(0, Math.round(totalXpRaw))
    : INITIAL_XP;
  const derivedLevel = levelFromXp(totalXp);
  const derivedTitle = titleForLevel(derivedLevel);

  return {
    id: uid,
    name: data.displayName ?? DEFAULT_PROFILE.name,
    avatarUrl: data.photoURL ?? DEFAULT_PROFILE.avatarUrl,
    badgeLabel: data.badgeLabel ?? derivedTitle,
    badgeLevel: data.badgeLevel ?? derivedLevel,
    totalXp,
    grantedXpKeys: Array.isArray(data.grantedXpKeys)
      ? data.grantedXpKeys
      : INITIAL_GRANTED_KEYS,
    xpMeta:
      data.xpMeta && typeof data.xpMeta === 'object' ? data.xpMeta : {},
  };
}

async function ensureProfileDoc(uid) {
  const ref = userRef(uid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    const data = snap.data();
    const normalized = normalizeProfileFromDoc(uid, data);
    const progress = computeProgress(normalized.totalXp);

    const needsBackfill =
      !Number.isFinite(Number(data.totalXp)) ||
      !Array.isArray(data.grantedXpKeys) ||
      data.badgeLevel !== progress.level ||
      data.badgeLabel !== progress.title;

    if (needsBackfill) {
      await setDoc(
        ref,
        {
          totalXp: normalized.totalXp,
          grantedXpKeys: normalized.grantedXpKeys,
          xpMeta: normalized.xpMeta,
          badgeLevel: progress.level,
          badgeLabel: progress.title,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
    }

    return {
      id: uid,
      name: normalized.name,
      avatarUrl: normalized.avatarUrl,
      badgeLevel: progress.level,
      badgeLabel: progress.title,
      totalXp: normalized.totalXp,
      grantedXpKeys: normalized.grantedXpKeys,
      xpMeta: normalized.xpMeta,
    };
  }

  const initialProgress = computeProgress(INITIAL_XP);

  await setDoc(
    ref,
    {
      uid,
      provider: auth.currentUser?.providerData?.[0]?.providerId ?? 'anonymous',
      displayName: DEFAULT_PROFILE.name,
      photoURL: DEFAULT_PROFILE.avatarUrl,
      totalXp: INITIAL_XP,
      grantedXpKeys: INITIAL_GRANTED_KEYS,
      xpMeta: {},
      badgeLabel: initialProgress.title,
      badgeLevel: initialProgress.level,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  return {
    id: uid,
    name: DEFAULT_PROFILE.name,
    avatarUrl: DEFAULT_PROFILE.avatarUrl,
    badgeLabel: initialProgress.title,
    badgeLevel: initialProgress.level,
    totalXp: INITIAL_XP,
    grantedXpKeys: INITIAL_GRANTED_KEYS,
    xpMeta: {},
  };
}

async function ensurePreferencesDoc(uid) {
  const ref = prefsRef(uid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    const data = snap.data();
    return {
      budgetPerDay: data.budgetPerDay ?? DEFAULT_PREFERENCES.budgetPerDay,
      currency: data.currency ?? DEFAULT_PREFERENCES.currency,
      favoriteActivities:
        data.favoriteActivities ?? DEFAULT_PREFERENCES.favoriteActivities,
    };
  }

  await setDoc(
    ref,
    {
      ...DEFAULT_PREFERENCES,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
  return DEFAULT_PREFERENCES;
}

export const ProfileService = {
  async awardXpByRule(rule, uidArg) {
    const resolvedUid = await ensureUid(uidArg);
    const refDoc = userRef(resolvedUid);

    return runTransaction(db, async (tx) => {
      const snap = await tx.get(refDoc);
      const existing = snap.exists() ? snap.data() : {};
      const normalized = normalizeProfileFromDoc(resolvedUid, existing);

      const grantedSet = new Set(normalized.grantedXpKeys);
      const xpMeta = { ...normalized.xpMeta };
      let awardedXp = 0;

      if (rule?.once && grantedSet.has(rule.key)) {
        return {
          awardedXp: 0,
          totalXp: normalized.totalXp,
          badgeLevel: levelFromXp(normalized.totalXp),
          badgeLabel: titleForLevel(levelFromXp(normalized.totalXp)),
          isAwarded: false,
        };
      }

      if (rule?.dailyCapKey && Number.isFinite(rule?.dailyCap)) {
        const today = new Date().toISOString().slice(0, 10);
        const dateField = `${rule.dailyCapKey}Date`;
        const countField = `${rule.dailyCapKey}Count`;
        const previousDate = String(xpMeta[dateField] || '');
        const previousCount =
          previousDate === today ? Number(xpMeta[countField] || 0) : 0;

        if (previousCount >= rule.dailyCap) {
          return {
            awardedXp: 0,
            totalXp: normalized.totalXp,
            badgeLevel: levelFromXp(normalized.totalXp),
            badgeLabel: titleForLevel(levelFromXp(normalized.totalXp)),
            isAwarded: false,
          };
        }

        xpMeta[dateField] = today;
        xpMeta[countField] = previousCount + 1;
        awardedXp = Math.max(0, Math.round(Number(rule.amount) || 0));
      } else {
        awardedXp = Math.max(0, Math.round(Number(rule?.amount) || 0));
      }

      if (rule?.once) {
        grantedSet.add(rule.key);
      }

      if (awardedXp < 1) {
        return {
          awardedXp: 0,
          totalXp: normalized.totalXp,
          badgeLevel: levelFromXp(normalized.totalXp),
          badgeLabel: titleForLevel(levelFromXp(normalized.totalXp)),
          isAwarded: false,
        };
      }

      const totalXp = normalized.totalXp + awardedXp;
      const nextLevel = levelFromXp(totalXp);
      const nextTitle = titleForLevel(nextLevel);

      tx.set(
        refDoc,
        {
          uid: resolvedUid,
          provider: auth.currentUser?.providerData?.[0]?.providerId ?? 'anonymous',
          displayName: normalized.name,
          photoURL: normalized.avatarUrl,
          totalXp,
          grantedXpKeys: Array.from(grantedSet),
          xpMeta,
          badgeLevel: nextLevel,
          badgeLabel: nextTitle,
          updatedAt: serverTimestamp(),
          createdAt: existing.createdAt ?? serverTimestamp(),
        },
        { merge: true },
      );

      return {
        awardedXp,
        totalXp,
        badgeLevel: nextLevel,
        badgeLabel: nextTitle,
        isAwarded: true,
      };
    });
  },

  async awardWishlistAddedXp(uid) {
    return this.awardXpByRule(
      {
        key: XP_EVENT_KEYS.WISHLIST_ADD_DAILY,
        amount: 30,
        dailyCapKey: XP_EVENT_KEYS.WISHLIST_ADD_DAILY,
        dailyCap: 3,
      },
      uid,
    );
  },

  async awardDailySigninXp(uid) {
    return this.awardXpByRule(
      {
        key: XP_EVENT_KEYS.DAILY_SIGNIN,
        amount: 10,
        dailyCapKey: XP_EVENT_KEYS.DAILY_SIGNIN,
        dailyCap: 1,
      },
      uid,
    );
  },

  async awardDailyDiscoverBrowseXp(uid) {
    return this.awardXpByRule(
      {
        key: XP_EVENT_KEYS.DAILY_DISCOVER_BROWSE,
        amount: 10,
        dailyCapKey: XP_EVENT_KEYS.DAILY_DISCOVER_BROWSE,
        dailyCap: 1,
      },
      uid,
    );
  },

  async awardBudgetSavedXp(uid) {
    return this.awardXpByRule(
      { key: XP_EVENT_KEYS.FIRST_BUDGET_SAVE, amount: 40, once: true },
      uid,
    );
  },

  async awardAvatarUploadedXp(uid) {
    return this.awardXpByRule(
      { key: XP_EVENT_KEYS.FIRST_AVATAR_UPLOAD, amount: 40, once: true },
      uid,
    );
  },

  async awardExportXp(uid) {
    return this.awardXpByRule(
      { key: XP_EVENT_KEYS.FIRST_EXPORT, amount: 20, once: true },
      uid,
    );
  },

  async awardJourneyCreatedXp(uid) {
    return this.awardXpByRule(
      { key: XP_EVENT_KEYS.FIRST_JOURNEY_CREATE, amount: 120, once: true },
      uid,
    );
  },

  async awardJourneyEditedXp(uid) {
    return this.awardXpByRule(
      { key: XP_EVENT_KEYS.FIRST_JOURNEY_EDIT, amount: 60, once: true },
      uid,
    );
  },

  async awardJourneyPhotoMilestoneXp(uid) {
    return this.awardXpByRule(
      {
        key: XP_EVENT_KEYS.FIRST_JOURNEY_PHOTO_MILESTONE,
        amount: 50,
        once: true,
      },
      uid,
    );
  },

  async awardJourneyBgmMatchedXp(uid) {
    return this.awardXpByRule(
      { key: XP_EVENT_KEYS.FIRST_JOURNEY_BGM_MATCH, amount: 40, once: true },
      uid,
    );
  },

  async fetchProfile(uid) {
    const resolvedUid = await ensureUid(uid);
    const base = await ensureProfileDoc(resolvedUid);
    const progress = computeProgress(base.totalXp);
    return {
      id: base.id,
      name: base.name,
      avatarUrl: base.avatarUrl,
      totalXp: base.totalXp,
      badgeLevel: progress.level,
      badgeLabel: progress.title,
      grantedXpKeys: base.grantedXpKeys,
      xpMeta: base.xpMeta,
    };
  },

  async fetchWishlist(uid) {
    const resolvedUid = await ensureUid(uid);
    const snap = await getDocs(wishlistRef(resolvedUid));
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        name: data.name ?? 'Untitled',
        imageUrl:
          data.imageUrl ??
          'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&h=300&fit=crop',
      };
    });
  },

  async addWishlistItem(item, uid) {
    const resolvedUid = await ensureUid(uid);
    const placeId = item.id;
    if (!placeId) throw new Error('Wishlist item requires id');
    const placeRef = placeWishlistRef(resolvedUid, placeId);
    const existing = await getDoc(placeRef);
    await setDoc(
      placeRef,
      {
        name: item.name ?? 'Untitled',
        imageUrl: item.imageUrl ?? '',
        keywords: item.keywords ?? [],
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
    if (!existing.exists()) {
      await this.awardWishlistAddedXp(resolvedUid);
      return { added: true };
    }
    return { added: false };
  },

  async removeWishlistItem(placeId, uid) {
    const resolvedUid = await ensureUid(uid);
    await deleteDoc(doc(db, `users/${resolvedUid}/wishlist/${placeId}`));
  },

  async fetchPreferences(uid) {
    const resolvedUid = await ensureUid(uid);
    return ensurePreferencesDoc(resolvedUid);
  },

  async savePreferences(uidOrPrefs, maybePrefs) {
    const maybeUid = typeof uidOrPrefs === 'string' ? uidOrPrefs : undefined;
    const prefs = maybeUid ? maybePrefs : uidOrPrefs;
    const resolvedUid = await ensureUid(maybeUid);
    await setDoc(
      prefsRef(resolvedUid),
      {
        ...prefs,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  },

  async updateProfilePatch(patch, uid) {
    const resolvedUid = await ensureUid(uid);
    const payload = {
      updatedAt: serverTimestamp(),
    };

    if (typeof patch?.name === 'string' && patch.name.trim()) {
      payload.displayName = patch.name.trim();
    }
    if (typeof patch?.avatarUrl === 'string' && patch.avatarUrl.trim()) {
      payload.photoURL = patch.avatarUrl.trim();
    }

    await setDoc(userRef(resolvedUid), payload, { merge: true });
    return this.fetchProfile(resolvedUid);
  },

  async uploadAvatar(localUri, uid) {
    if (!localUri) throw new Error('Missing local image uri');
    const resolvedUid = await ensureUid(uid);

    const token = await auth.currentUser.getIdToken();
    const bucket = 'the-road-goes-ever-on.firebasestorage.app';
    const avatarPath = `users/${resolvedUid}/avatars/current.jpg`;
    const uploadUrl =
      `https://firebasestorage.googleapis.com/v0/b/${bucket}/o` +
      `?uploadType=media&name=${encodeURIComponent(avatarPath)}`;

    const result = await FileSystem.uploadAsync(uploadUrl, localUri, {
      httpMethod: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'image/jpeg',
      },
      uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
    });

    if (result.status < 200 || result.status >= 300) {
      throw new Error(`Upload failed: ${result.status} — ${result.body}`);
    }

    const avatarStorageRef = ref(storage, avatarPath);
    const downloadUrl = await getDownloadURL(avatarStorageRef);
    await this.updateProfilePatch({ avatarUrl: downloadUrl }, resolvedUid);
    await this.awardAvatarUploadedXp(resolvedUid);
    return this.fetchProfile(resolvedUid);
  },

  async fetchPlaceDetail(placeId, placeName) {
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

  async exportUserData(uid) {
    const resolvedUid = await ensureUid(uid);
    const [profile, preferences, wishlist] = await Promise.all([
      this.fetchProfile(resolvedUid),
      this.fetchPreferences(resolvedUid),
      this.fetchWishlist(resolvedUid),
    ]);
    return JSON.stringify({ profile, preferences, wishlist });
  },
};
