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
