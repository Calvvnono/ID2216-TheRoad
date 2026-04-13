import { makeAutoObservable, runInAction } from 'mobx';
import { AsyncStatus } from './asyncStatus';
import HubService from './hubService';
import {
  tripsTimeBounds,
  filterTripsByTimeEnd,
  tripRouteCoordinates,
} from './tripModel';
import { aggregateLocations, computeStats } from './locationModel';

/**
 * Hub application state (MobX observable).
 *
 * Time filter: single continuous slider 0..1 → cutoff between first trip start
 * and last trip end (see filteredTrips).
 */
class HubStore {
  /** @type {import('./tripModel').Trip[]} */
  trips = [];

  /**
   * 0 = earliest moment only, 1 = full timeline (default after load).
   * @type {number}
   */
  timeSliderNormalized = 1;

  /** @type {string | null} */
  selectedLocationName = null;

  /** @type {string} */
  loadStatus = AsyncStatus.IDLE;

  /** @type {string | null} */
  error = null;

  constructor() {
    makeAutoObservable(this);
  }

  /** Cutoff timestamp (ms) derived from slider position and trip time bounds. */
  get timeSliderCutoffMs() {
    const { minMs, maxMs } = tripsTimeBounds(this.trips);
    if (this.trips.length === 0 || maxMs <= minMs) return maxMs;
    return minMs + this.timeSliderNormalized * (maxMs - minMs);
  }

  get filteredTrips() {
    return filterTripsByTimeEnd(this.trips, this.timeSliderCutoffMs);
  }

  /** @returns {import('./locationModel').AggregatedLocation[]} */
  get aggregatedLocations() {
    return aggregateLocations(this.filteredTrips);
  }

  get selectedLocation() {
    if (!this.selectedLocationName) return null;
    return (
      this.aggregatedLocations.find(
        (loc) => loc.name === this.selectedLocationName,
      ) || null
    );
  }

  /** @returns {import('./locationModel').TripStats} */
  get stats() {
    return computeStats(this.filteredTrips);
  }

  /** Chronological route points for Polyline (filtered trips). */
  get routeCoordinates() {
    return tripRouteCoordinates(this.filteredTrips);
  }

  // ── Actions ───────────────────────────────────────────

  async loadTrips() {
    runInAction(() => {
      this.loadStatus = AsyncStatus.LOADING;
      this.error = null;
    });
    try {
      const data = await HubService.fetchTrips();
      runInAction(() => {
        this.trips = data;
        this.timeSliderNormalized = 1;
        this.loadStatus = AsyncStatus.SUCCESS;
      });
    } catch (err) {
      runInAction(() => {
        this.error = err?.message || 'Failed to load trips';
        this.loadStatus = AsyncStatus.ERROR;
      });
    }
  }

  setTimeSliderNormalized(value) {
    const v = Number(value);
    this.timeSliderNormalized = Math.min(1, Math.max(0, v));
    this.selectedLocationName = null;
  }

  selectLocation(name) {
    this.selectedLocationName = name;
  }

  clearSelection() {
    this.selectedLocationName = null;
  }

  retry() {
    this.loadTrips();
  }

  ensureLoaded() {
    if (this.loadStatus === AsyncStatus.IDLE) {
      this.loadTrips();
    }
  }
}

const hubStore = new HubStore();
export default hubStore;
