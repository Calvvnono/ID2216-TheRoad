import hubStore from '../model/hubStore';
import { AsyncStatus } from '../model/asyncStatus';

/**
 * Hub presenter — the ONLY bridge between View and Model.
 *
 * Exposes:
 *  - data getters (View reads these, never touches hubStore directly)
 *  - action methods (View calls these on user interaction)
 *
 * MobX reactivity still works: observer() Views that access these
 * getters will re-render when the underlying hubStore observables change.
 */
const HubPresenter = {

  // ── Data getters (View reads) ─────────────────────────

  get loadStatus()          { return hubStore.loadStatus; },
  get isLoading()           { return hubStore.loadStatus === AsyncStatus.LOADING; },
  get isError()             { return hubStore.loadStatus === AsyncStatus.ERROR; },
  get isSuccess()           { return hubStore.loadStatus === AsyncStatus.SUCCESS; },
  get error()               { return hubStore.error; },

  get filteredTrips()       { return hubStore.filteredTrips; },
  get hasFilteredTrips()    { return hubStore.filteredTrips.length > 0; },
  get aggregatedLocations() { return hubStore.aggregatedLocations; },
  get selectedLocationName(){ return hubStore.selectedLocationName; },
  get selectedLocation()    { return hubStore.selectedLocation; },
  get stats()               { return hubStore.stats; },

  get availableYears()      { return hubStore.availableYears; },
  get availableMonths()     { return hubStore.availableMonths; },
  get selectedYear()        { return hubStore.selectedYear; },
  get selectedMonth()       { return hubStore.selectedMonth; },

  // ── Actions (View calls) ──────────────────────────────

  init() {
    if (hubStore.loadStatus === AsyncStatus.IDLE) {
      hubStore.loadTrips();
    }
  },

  onYearChange(year) {
    hubStore.setYear(year);
  },

  onMonthChange(month) {
    hubStore.setMonth(month);
  },

  onMarkerPress(locationName) {
    hubStore.selectLocation(locationName);
  },

  onSheetDismiss() {
    hubStore.clearSelection();
  },

  onRetry() {
    hubStore.retry();
  },
};

export default HubPresenter;
