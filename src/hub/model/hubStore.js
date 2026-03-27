import { makeAutoObservable, runInAction } from 'mobx';
import { AsyncStatus } from './asyncStatus';
import HubService from './hubService';
import { filterTrips, extractYears, extractMonths } from './tripModel';
import { aggregateLocations, computeStats } from './locationModel';

/**
 * Hub application state (MobX observable).
 *
 * Holds UI state (filters, selection, async status).
 * All domain computation is delegated to Model pure functions
 * (tripModel / locationModel).
 */
class HubStore {
  /** @type {import('./tripModel').Trip[]} */
  trips = [];

  /** @type {number | null} */
  selectedYear = null;

  /** @type {number | null} - 0-indexed (0 = Jan) */
  selectedMonth = null;

  /** @type {string | null} */
  selectedLocationName = null;

  /** @type {string} */
  loadStatus = AsyncStatus.IDLE;

  /** @type {string | null} */
  error = null;

  constructor() {
    makeAutoObservable(this);
  }

  // ── Computed (delegates to Model) ─────────────────────

  get availableYears() {
    return extractYears(this.trips);
  }

  get availableMonths() {
    const base = this.selectedYear
      ? this.trips.filter(
          (t) => new Date(t.startDate).getFullYear() === this.selectedYear,
        )
      : this.trips;
    return extractMonths(base);
  }

  get filteredTrips() {
    return filterTrips(this.trips, this.selectedYear, this.selectedMonth);
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

  // ── Actions ───────────────────────────────────────────

  async loadTrips() {
    this.loadStatus = AsyncStatus.LOADING;
    this.error = null;
    try {
      const data = await HubService.fetchTrips('mock-user');
      runInAction(() => {
        this.trips = data;
        this.loadStatus = AsyncStatus.SUCCESS;
      });
    } catch (err) {
      runInAction(() => {
        this.error = err?.message || 'Failed to load trips';
        this.loadStatus = AsyncStatus.ERROR;
      });
    }
  }

  setYear(year) {
    this.selectedYear = year;
    this.selectedMonth = null;
    this.selectedLocationName = null;
  }

  setMonth(month) {
    this.selectedMonth = month;
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
}

const hubStore = new HubStore();
export default hubStore;
