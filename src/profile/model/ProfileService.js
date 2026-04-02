/**
 * ProfileService — Persistence concern.
 *
 * Store calls this service; View/Presenter stay untouched.
 * This implementation uses Firebase Auth + Firestore.
 */
import * as FileSystem from 'expo-file-system/legacy';
import { getDownloadURL, ref } from 'firebase/storage';
import { signInAnonymously } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { auth, db, storage } from '../../shared/api/firebaseClient';

const DEFAULT_PROFILE = {
  name: 'New Traveler',
  avatarUrl:
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop',
  badgeLabel: 'Globetrotter',
  badgeLevel: 1,
};

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

async function ensureProfileDoc(uid) {
  const ref = userRef(uid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    const data = snap.data();
    return {
      id: uid,
      name: data.displayName ?? DEFAULT_PROFILE.name,
      avatarUrl: data.photoURL ?? DEFAULT_PROFILE.avatarUrl,
      badgeLabel: data.badgeLabel ?? DEFAULT_PROFILE.badgeLabel,
      badgeLevel: data.badgeLevel ?? DEFAULT_PROFILE.badgeLevel,
    };
  }

  await setDoc(
    ref,
    {
      uid,
      provider: auth.currentUser?.providerData?.[0]?.providerId ?? 'anonymous',
      displayName: DEFAULT_PROFILE.name,
      photoURL: DEFAULT_PROFILE.avatarUrl,
      badgeLabel: DEFAULT_PROFILE.badgeLabel,
      badgeLevel: DEFAULT_PROFILE.badgeLevel,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  return {
    id: uid,
    name: DEFAULT_PROFILE.name,
    avatarUrl: DEFAULT_PROFILE.avatarUrl,
    badgeLabel: DEFAULT_PROFILE.badgeLabel,
    badgeLevel: DEFAULT_PROFILE.badgeLevel,
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
  /** @returns {Promise<Object>} */
  async fetchProfile(uid) {
    const resolvedUid = await ensureUid(uid);
    return ensureProfileDoc(resolvedUid);
  },

  /** @returns {Promise<Object[]>} */
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

  /** @returns {Promise<Object>} */
  async fetchPreferences(uid) {
    const resolvedUid = await ensureUid(uid);
    return ensurePreferencesDoc(resolvedUid);
  },

  /** @returns {Promise<void>} */
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

  /** @returns {Promise<Object>} */
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

  /** @returns {Promise<Object>} */
  async uploadAvatar(localUri, uid) {
    if (!localUri) throw new Error('Missing local image uri');
    const resolvedUid = await ensureUid(uid);

    // 用 expo-file-system 原生上传，完全绕开 Firebase JS SDK 的 Blob/ArrayBuffer 限制
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
    return this.updateProfilePatch({ avatarUrl: downloadUrl }, resolvedUid);
  },

  /** @returns {Promise<string>} */
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
