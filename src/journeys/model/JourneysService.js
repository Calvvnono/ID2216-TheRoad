/**
 * JourneysService — persistence/data source for Journeys list page.
 * Uses Firebase for user-created journeys and keeps mock journeys as fallback/demo data.
 */

import * as FileSystem from 'expo-file-system/legacy';
import { signInAnonymously } from 'firebase/auth';
import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import { getDownloadURL, ref } from 'firebase/storage';
import { auth, db, storage } from '../../shared/api/firebaseClient';

const MOCK_JOURNEYS = [
  {
    id: 'journey-tokyo-2024',
    destination: 'Tokyo',
    country: 'Japan',
    startDate: '2024-03-01',
    endDate: '2024-03-08',
    travelDates: 'Mar 1-8, 2024',
    durationLabel: '7 Days',
    spent: 2450,
    photos: 142,
    places: 18,
    imageUrl:
      'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=1200&h=700&fit=crop',
    detailHeroImage:
      'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=1600&h=900&fit=crop',
    visitedLocations: ['Shibuya', 'Shinjuku', 'Asakusa'],
    dailyExpenses: [280, 340, 420, 300, 380, 290, 430],
    photoMemories: [
      'https://images.unsplash.com/photo-1554797589-7241bb691973?w=700&h=480&fit=crop',
      'https://images.unsplash.com/photo-1526481280695-3c4699d38b45?w=700&h=480&fit=crop',
      'https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=700&h=480&fit=crop',
    ],
  },
  {
    id: 'journey-paris-2024',
    destination: 'Paris',
    country: 'France',
    startDate: '2024-01-15',
    endDate: '2024-01-22',
    travelDates: 'Jan 15-22, 2024',
    durationLabel: '7 Days',
    spent: 2450,
    photos: 142,
    places: 18,
    imageUrl:
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&h=700&fit=crop',
    detailHeroImage:
      'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1600&h=900&fit=crop',
    visitedLocations: ['Louvre', 'Montmartre', 'Seine'],
    dailyExpenses: [250, 300, 390, 280, 410, 320, 500],
    photoMemories: [
      'https://images.unsplash.com/photo-1508057198894-247b23fe5ade?w=700&h=480&fit=crop',
      'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=700&h=480&fit=crop',
      'https://images.unsplash.com/photo-1549144511-f099e773c147?w=700&h=480&fit=crop',
    ],
  },
  {
    id: 'journey-seoul-2023',
    destination: 'Seoul',
    country: 'South Korea',
    startDate: '2023-11-10',
    endDate: '2023-11-20',
    travelDates: 'Nov 10-20, 2023',
    durationLabel: '10 Days',
    spent: 3120,
    photos: 211,
    places: 24,
    imageUrl:
      'https://images.unsplash.com/photo-1538485399081-7c8979e6f5b1?w=1200&h=700&fit=crop',
    detailHeroImage:
      'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=1600&h=900&fit=crop',
    visitedLocations: ['Myeongdong', 'Hongdae', 'Bukchon'],
    dailyExpenses: [320, 360, 410, 380, 450, 340, 390, 420, 360, 410],
    photoMemories: [
      'https://images.unsplash.com/photo-1544085311-11a028465b03?w=700&h=480&fit=crop',
      'https://images.unsplash.com/photo-1536662788221-5a67ad7e2b43?w=700&h=480&fit=crop',
      'https://images.unsplash.com/photo-1528137871618-79d2761e3fd5?w=700&h=480&fit=crop',
    ],
  },
];

const SIMULATED_LATENCY_MS = 180;
const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=1200&h=700&fit=crop';
const STORAGE_BUCKET = 'the-road-goes-ever-on.firebasestorage.app';
const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseDateOnly(value) {
  if (!value) return null;
  const d = new Date(`${value}T00:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function toShortDate(date) {
  return `${MONTHS[date.getMonth()]} ${date.getDate()}`;
}

function formatTravelDates(startDate, endDate) {
  const start = parseDateOnly(startDate);
  const end = parseDateOnly(endDate);
  if (!start || !end) return '';

  const sameYear = start.getFullYear() === end.getFullYear();
  const sameMonth = start.getMonth() === end.getMonth();

  if (sameYear && sameMonth) {
    return `${MONTHS[start.getMonth()]} ${start.getDate()}-${end.getDate()}, ${start.getFullYear()}`;
  }

  if (sameYear) {
    return `${toShortDate(start)}-${toShortDate(end)}, ${start.getFullYear()}`;
  }

  return `${toShortDate(start)}, ${start.getFullYear()} - ${toShortDate(end)}, ${end.getFullYear()}`;
}

function durationDays(startDate, endDate) {
  const start = parseDateOnly(startDate);
  const end = parseDateOnly(endDate);
  if (!start || !end) return 1;
  const diff = end.getTime() - start.getTime();
  return Math.max(1, Math.floor(diff / 86400000) + 1);
}

function toPositiveInt(value, fallback = 0) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.round(n));
}

function toNonNegativeNumber(value, fallback = 0) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, n);
}

function parseListText(input) {
  if (!input) return [];
  return String(input)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseListNumber(input) {
  return parseListText(input)
    .map((item) => Number(item))
    .filter((n) => Number.isFinite(n) && n >= 0)
    .map((n) => Math.round(n));
}

function normalizeJourney(raw, idOverride) {
  const id = idOverride || raw.id || `journey-${Date.now()}`;
  const destination = raw.destination || 'Untitled Journey';
  const country = raw.country || 'Unknown';
  const startDate = raw.startDate || '';
  const endDate = raw.endDate || '';
  const spent = toNonNegativeNumber(raw.spent, 0);
  const places = toPositiveInt(raw.places, 0);
  const imageUrl = raw.imageUrl || FALLBACK_IMAGE;
  const detailHeroImage = raw.detailHeroImage || imageUrl;
  const visitedLocations = Array.isArray(raw.visitedLocations)
    ? raw.visitedLocations.filter(Boolean)
    : [];
  const dailyExpenses = Array.isArray(raw.dailyExpenses)
    ? raw.dailyExpenses
        .map((n) => Number(n))
        .filter((n) => Number.isFinite(n) && n >= 0)
    : [];
  const photoMemories = Array.isArray(raw.photoMemories)
    ? raw.photoMemories.filter(Boolean)
    : [];
  const photos = toPositiveInt(raw.photos, photoMemories.length || 0);

  return {
    id,
    destination,
    country,
    startDate,
    endDate,
    travelDates: raw.travelDates || formatTravelDates(startDate, endDate),
    durationLabel: raw.durationLabel || `${durationDays(startDate, endDate)} Days`,
    spent,
    photos,
    places,
    imageUrl,
    detailHeroImage,
    visitedLocations: visitedLocations.length ? visitedLocations : [destination],
    dailyExpenses: dailyExpenses.length ? dailyExpenses : [Math.max(1, Math.round(spent))],
    photoMemories: photoMemories.length ? photoMemories : [imageUrl],
  };
}

function buildCreatePayload(input) {
  const destination = String(input.destination || '').trim();
  const country = String(input.country || '').trim();
  const startDate = String(input.startDate || '').trim();
  const endDate = String(input.endDate || '').trim();
  const localPhotoUris = Array.isArray(input.localPhotoUris)
    ? input.localPhotoUris.filter(Boolean)
    : [];

  if (!destination || !country || !startDate || !endDate) {
    throw new Error('Please fill destination, country, start date and end date.');
  }

  if (!localPhotoUris.length) {
    throw new Error('Please select at least one photo from album.');
  }

  const start = parseDateOnly(startDate);
  const end = parseDateOnly(endDate);
  if (!start || !end || end.getTime() < start.getTime()) {
    throw new Error('Please provide valid dates. End date must be after start date.');
  }

  const spent = toNonNegativeNumber(input.spent, 0);
  const places = toPositiveInt(input.places, 0);
  const visitedLocations = parseListText(input.visitedLocations);
  const dailyExpenses = parseListNumber(input.dailyExpenses);

  return {
    destination,
    country,
    startDate,
    endDate,
    travelDates: formatTravelDates(startDate, endDate),
    durationLabel: `${durationDays(startDate, endDate)} Days`,
    spent,
    places,
    localPhotoUris,
    visitedLocations: visitedLocations.length ? visitedLocations : [destination],
    dailyExpenses: dailyExpenses.length ? dailyExpenses : [Math.max(1, Math.round(spent))],
  };
}

async function ensureUid() {
  if (auth.currentUser?.uid) return auth.currentUser.uid;
  const cred = await signInAnonymously(auth);
  return cred.user.uid;
}

function journeysRef(uid) {
  return collection(db, `users/${uid}/journeys`);
}

async function uploadJourneyPhotos(localPhotoUris, uid) {
  const token = await auth.currentUser.getIdToken();
  const stamp = Date.now();
  const uploadedUrls = [];

  for (let i = 0; i < localPhotoUris.length; i += 1) {
    const localUri = localPhotoUris[i];
    const objectPath = `users/${uid}/journeys/${stamp}-${i}.jpg`;
    const uploadUrl =
      `https://firebasestorage.googleapis.com/v0/b/${STORAGE_BUCKET}/o` +
      `?uploadType=media&name=${encodeURIComponent(objectPath)}`;

    const result = await FileSystem.uploadAsync(uploadUrl, localUri, {
      httpMethod: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'image/jpeg',
      },
      uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
    });

    if (result.status < 200 || result.status >= 300) {
      throw new Error(`Photo upload failed: ${result.status}`);
    }

    const photoRef = ref(storage, objectPath);
    const downloadUrl = await getDownloadURL(photoRef);
    uploadedUrls.push(downloadUrl);
  }

  return uploadedUrls;
}

export const JourneysService = {
  async fetchJourneys() {
    await wait(SIMULATED_LATENCY_MS);

    let firebaseJourneys = [];
    try {
      const resolvedUid = await ensureUid();
      const snap = await getDocs(
        query(journeysRef(resolvedUid), orderBy('createdAt', 'desc')),
      );
      firebaseJourneys = snap.docs.map((d) => normalizeJourney(d.data(), d.id));
    } catch (e) {
      console.warn('Journeys Firebase fetch failed. Showing mock data only:', e.message);
    }

    const mockJourneys = MOCK_JOURNEYS.map((item) => normalizeJourney(item, item.id));
    return [...firebaseJourneys, ...mockJourneys];
  },

  async createJourney(input) {
    const resolvedUid = await ensureUid();
    const payload = buildCreatePayload(input);
    const uploadedPhotoUrls = await uploadJourneyPhotos(
      payload.localPhotoUris,
      resolvedUid,
    );

    const photoMemories = uploadedPhotoUrls;
    const coverPhoto = uploadedPhotoUrls[0] || FALLBACK_IMAGE;

    const writePayload = {
      destination: payload.destination,
      country: payload.country,
      startDate: payload.startDate,
      endDate: payload.endDate,
      travelDates: payload.travelDates,
      durationLabel: payload.durationLabel,
      spent: payload.spent,
      photos: photoMemories.length,
      places: payload.places,
      imageUrl: coverPhoto,
      detailHeroImage: coverPhoto,
      visitedLocations: payload.visitedLocations,
      dailyExpenses: payload.dailyExpenses,
      photoMemories,
    };

    const docRef = await addDoc(journeysRef(resolvedUid), {
      ...writePayload,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return normalizeJourney(writePayload, docRef.id);
  },
};
