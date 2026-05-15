import { signInAnonymously } from 'firebase/auth';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { auth, db } from '../../shared/api/firebaseClient';
import { mapFirestoreDocToTrip } from '../model/mapFirestoreJourneyToTrip';
import { resolveCoordinatesForHub } from '../model/resolveCoordinatesForHub';
import hubStore from '../model/hubStore';

/** Same pacing as journeys persistence fetch. */
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
 * Hub persistence — Firestore `users/{uid}/journeys`, same path/query as Journeys.
 * No demo fallback: Hub reads Firebase only.
 */
const HubPersistence = {
  ensureLoaded() {
    if (hubStore.loadStatus === 'idle') {
      this.loadTrips();
    }
  },

  retry() {
    this.loadTrips();
  },

  async loadTrips() {
    hubStore.setLoadStarted();
    try {
      const data = await this.fetchTrips();
      hubStore.setTripsLoaded(data);
    } catch (err) {
      hubStore.setLoadError(err?.message || 'Failed to load trips');
    }
  },

  /**
   * Fetch Firebase trips for the current user only.
   * @returns {Promise<import('../model/tripModel').Trip[]>}
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

export default HubPersistence;
