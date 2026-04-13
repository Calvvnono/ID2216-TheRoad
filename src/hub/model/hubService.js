import { signInAnonymously } from 'firebase/auth';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { auth, db } from '../../shared/api/firebaseClient';
import { mapFirestoreDocToTrip } from './mapFirestoreJourneyToTrip';
import { MOCK_TRIPS } from './mockTrips';
import { resolveCoordinatesForHub } from './resolveCoordinatesForHub';

/** Same pacing as `JourneysService.fetchJourneys`. */
const SIMULATED_LATENCY_MS = 180;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function ensureUid() {
  if (auth.currentUser?.uid) return auth.currentUser.uid;
  const cred = await signInAnonymously(auth);
  return cred.user.uid;
}

function journeysRef(uid) {
  return collection(db, `users/${uid}/journeys`);
}

/**
 * Hub data service — Firestore `users/{uid}/journeys`, same path/query as Journeys.
 *
 * Degradation / demo strategy (aligned with Journeys): always append `MOCK_TRIPS`
 * after any Firebase rows so Hub stays populated when the cloud is empty or fails.
 */
const HubService = {
  /**
   * Fetch Firebase trips for the current user, then merge demo trips (like Journeys + mock).
   * @returns {Promise<import('./tripModel').Trip[]>}
   */
  async fetchTrips() {
    await wait(SIMULATED_LATENCY_MS);

    let firebaseTrips = [];
    try {
      const resolvedUid = await ensureUid();
      const snap = await getDocs(
        query(journeysRef(resolvedUid), orderBy('createdAt', 'desc')),
      );
      firebaseTrips = await Promise.all(
        snap.docs.map(async (d) => {
          const trip = mapFirestoreDocToTrip(d.data(), d.id);
          trip.coordinates = await resolveCoordinatesForHub(
            trip.destination,
            trip.country,
          );
          return trip;
        }),
      );
    } catch (e) {
      console.warn(
        'Hub Firebase fetch failed. Demo trips will still be shown:',
        e?.message,
      );
    }

    const demoTrips = MOCK_TRIPS.map((t) => ({
      ...t,
      expenses: t.expenses.map((x) => ({ ...x })),
      companions: [...t.companions],
      coordinates: { ...t.coordinates },
    }));

    return [...firebaseTrips, ...demoTrips];
  },
};

export default HubService;
