import { makeAutoObservable } from 'mobx';
import { AsyncStatus } from './asyncStatus';
import {
  tripsTimeBounds,
  filterTripsByTimeRange,
  tripRouteCoordinates,
} from './tripModel';
import { aggregateLocations, computeStats } from './locationModel';

/**
 * Hub application state (MobX observable).
 *
 * Time filter: start/end continuous sliders (0..1) for a selected range
 * between first trip start and last trip end.
 */
class HubStore {
  /** @type {import('./tripModel').Trip[]} */
  trips = [];

  /** @type {number} */
  timeStartNormalized = 0;

  /** @type {number} */
  timeEndNormalized = 1;

  /** @type {string | null} */
  selectedLocationName = null;

  /** @type {string} */
  loadStatus = AsyncStatus.IDLE;

  /** @type {string | null} */
  error = null;

  constructor() {
    makeAutoObservable(this);
  }

  /** Start timestamp (ms) derived from start slider position and trip bounds. */
  get timeStartMs() {
    const { minMs, maxMs } = tripsTimeBounds(this.trips);
    if (this.trips.length === 0 || maxMs <= minMs) return maxMs;
    return minMs + this.timeStartNormalized * (maxMs - minMs);
  }

  /** End timestamp (ms) derived from end slider position and trip bounds. */
  get timeEndMs() {
    const { minMs, maxMs } = tripsTimeBounds(this.trips);
    if (this.trips.length === 0 || maxMs <= minMs) return maxMs;
    return minMs + this.timeEndNormalized * (maxMs - minMs);
  }

  get filteredTrips() {
    return filterTripsByTimeRange(this.trips, this.timeStartMs, this.timeEndMs);
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

  setLoadStarted() {
    this.loadStatus = AsyncStatus.LOADING;
    this.error = null;
  }

  setTripsLoaded(data) {
    this.trips = data;
    this.timeStartNormalized = 0;
    this.timeEndNormalized = 1;
    this.loadStatus = AsyncStatus.SUCCESS;
  }

  setLoadError(message) {
    this.error = message;
    this.loadStatus = AsyncStatus.ERROR;
  }

  setTimeStartNormalized(value) {
    const v = Number(value);
    const clamped = Math.min(1, Math.max(0, v));
    this.timeStartNormalized = Math.min(clamped, this.timeEndNormalized);
    this.selectedLocationName = null;
  }

  setTimeEndNormalized(value) {
    const v = Number(value);
    const clamped = Math.min(1, Math.max(0, v));
    this.timeEndNormalized = Math.max(clamped, this.timeStartNormalized);
    this.selectedLocationName = null;
  }

  resetTimeRange() {
    this.timeStartNormalized = 0;
    this.timeEndNormalized = 1;
    this.selectedLocationName = null;
  }

  selectLocation(name) {
    this.selectedLocationName = name;
  }

  clearSelection() {
    this.selectedLocationName = null;
  }

}

const hubStore = new HubStore();
export default hubStore;
