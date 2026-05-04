import { toJS } from 'mobx';
import hubStore from '../model/hubStore';
import { AsyncStatus } from '../model/asyncStatus';

/**
 * Hub presenter — the ONLY bridge between View and Model.
 *
 * HubScreen (observer) reads from these getters and passes values
 * into child view components via props. Sub-views must not import
 * hubStore, MobX, HubPresenter, or any Model / persistence module.
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

  /**
   * Plain JS copies for Views (and native map children). MobX `toJS` lives here only.
   */
  get aggregatedLocationsPlain() {
    return toJS(hubStore.aggregatedLocations);
  },

  get routeCoordinatesPlain() {
    return toJS(hubStore.routeCoordinates);
  },

  get selectedLocationPlain() {
    const loc = hubStore.selectedLocation;
    return loc ? toJS(loc) : null;
  },

  get timeStartNormalized() { return hubStore.timeStartNormalized; },
  get timeEndNormalized()   { return hubStore.timeEndNormalized; },

  /** Start instant formatted for display, e.g. "Oct 2024". */
  get timeStartDateLabel() {
    const startMs = hubStore.timeStartMs;
    if (!hubStore.filteredTrips.length && hubStore.loadStatus === AsyncStatus.SUCCESS) {
      return '—';
    }
    return new Date(startMs).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  },

  /** End instant formatted for display, e.g. "Dec 2024". */
  get timeEndDateLabel() {
    const endMs = hubStore.timeEndMs;
    if (!hubStore.filteredTrips.length && hubStore.loadStatus === AsyncStatus.SUCCESS) {
      return '—';
    }
    return new Date(endMs).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  },

  // ── Actions (View calls) ──────────────────────────────

  init() {
    hubStore.ensureLoaded();
  },

  onTimeStartChange(value) {
    hubStore.setTimeStartNormalized(value);
  },

  onTimeEndChange(value) {
    hubStore.setTimeEndNormalized(value);
  },

  onResetTimeRange() {
    hubStore.resetTimeRange();
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
