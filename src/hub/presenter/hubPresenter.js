import hubStore from '../model/hubStore';
import { AsyncStatus } from '../model/asyncStatus';

/**
 * Hub presenter — the ONLY bridge between View and Model.
 *
 * Views read data exclusively through these getters and dispatch
 * user actions through the methods below. No View may import
 * hubStore or any Model module directly.
 */
const HubPresenter = {

  // ── Data getters (View reads) ─────────────────────────

  get isAwaitingData() {
    return (
      hubStore.loadStatus === AsyncStatus.IDLE ||
      hubStore.loadStatus === AsyncStatus.LOADING
    );
  },
  get isError()             { return hubStore.loadStatus === AsyncStatus.ERROR; },
  get isSuccess()           { return hubStore.loadStatus === AsyncStatus.SUCCESS; },
  get error()               { return hubStore.error; },

  get routeCoordinates()    { return hubStore.routeCoordinates; },
  get aggregatedLocations() { return hubStore.aggregatedLocations; },
  get selectedLocationName(){ return hubStore.selectedLocationName; },
  get selectedLocation()    { return hubStore.selectedLocation; },
  get stats()               { return hubStore.stats; },

  get timeSliderNormalized() { return hubStore.timeSliderNormalized; },

  /** Cutoff instant formatted for display, e.g. "Oct 2024". */
  get timeSliderDateLabel() {
    const cutoff = hubStore.timeSliderCutoffMs;
    if (!hubStore.filteredTrips.length && hubStore.loadStatus === AsyncStatus.SUCCESS) {
      return '—';
    }
    return new Date(cutoff).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  },

  // ── Actions (View calls) ──────────────────────────────

  init() {
    hubStore.ensureLoaded();
  },

  onTimeSliderChange(value) {
    hubStore.setTimeSliderNormalized(value);
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
