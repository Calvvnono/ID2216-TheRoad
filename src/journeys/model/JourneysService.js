/**
 * JourneysService — persistence/data source for Journeys list page.
 * Uses Firebase as the single source of truth.
 */

import * as FileSystem from 'expo-file-system/legacy';
import { signInAnonymously } from 'firebase/auth';
import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { getDownloadURL, ref } from 'firebase/storage';
import { auth, db, storage } from '../../shared/api/firebaseClient';

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

function cleanPhotoUrlList(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => String(item || '').trim())
    .filter(Boolean);
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

function buildUpdatePayload(input) {
  const journeyId = String(input.id || input.journeyId || '').trim();
  if (!journeyId) {
    throw new Error('Journey id is missing.');
  }

  const destination = String(input.destination || '').trim();
  const country = String(input.country || '').trim();
  const startDate = String(input.startDate || '').trim();
  const endDate = String(input.endDate || '').trim();
  const existingPhotoUrls = cleanPhotoUrlList(input.existingPhotoUrls);
  const localPhotoUris = cleanPhotoUrlList(input.localPhotoUris);

  if (!destination || !country || !startDate || !endDate) {
    throw new Error('Please fill destination, country, start date and end date.');
  }

  if (existingPhotoUrls.length + localPhotoUris.length < 1) {
    throw new Error('Please keep or select at least one photo.');
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
    id: journeyId,
    destination,
    country,
    startDate,
    endDate,
    travelDates: formatTravelDates(startDate, endDate),
    durationLabel: `${durationDays(startDate, endDate)} Days`,
    spent,
    places,
    existingPhotoUrls,
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
    const resolvedUid = await ensureUid();
    const snap = await getDocs(
      query(journeysRef(resolvedUid), orderBy('createdAt', 'desc')),
    );
    return snap.docs.map((d) => normalizeJourney(d.data(), d.id));
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

  async updateJourney(input) {
    const resolvedUid = await ensureUid();
    const payload = buildUpdatePayload(input);
    const uploadedPhotoUrls = payload.localPhotoUris.length
      ? await uploadJourneyPhotos(payload.localPhotoUris, resolvedUid)
      : [];

    const photoMemories = [...payload.existingPhotoUrls, ...uploadedPhotoUrls];
    const coverPhoto = photoMemories[0] || FALLBACK_IMAGE;

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

    const refDoc = doc(db, `users/${resolvedUid}/journeys/${payload.id}`);
    await setDoc(
      refDoc,
      {
        ...writePayload,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );

    return normalizeJourney(writePayload, payload.id);
  },
};
