import { signInAnonymously } from 'firebase/auth';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { auth, db } from '../../shared/api/firebaseClient';
import { mapFirestoreDocToTrip } from './mapFirestoreJourneyToTrip';
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
 * No demo fallback: Hub reads Firebase only.
 */
const HubService = {
  /**
   * Fetch Firebase trips for the current user only.
   * @returns {Promise<import('./tripModel').Trip[]>}
   */
  async fetchTrips() {
    await wait(SIMULATED_LATENCY_MS);
    const resolvedUid = await ensureUid();
    const snap = await getDocs(
      query(journeysRef(resolvedUid), orderBy('createdAt', 'desc')),
    );
    const firebaseTrips = await Promise.all(
      snap.docs.map(async (d) => {
        const trip = mapFirestoreDocToTrip(d.data(), d.id);
        trip.coordinates = await resolveCoordinatesForHub(
          trip.destination,
          trip.country,
        );
        return trip;
      }),
    );
    return firebaseTrips;
  },
};

export default HubService;
