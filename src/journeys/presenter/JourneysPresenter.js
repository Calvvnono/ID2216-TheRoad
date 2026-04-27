import { journeysStore } from '../model/JourneysStore';

export const JourneysPresenter = {
  init() {
    journeysStore.init();
  },

  reload() {
    journeysStore.retry();
  },

  onCreateJourney(input) {
    journeysStore.createJourney(input);
  },

  onUpdateJourney(input) {
    journeysStore.updateJourney(input);
  },

  resetCreateState() {
    journeysStore.resetCreateState();
  },

  resetUpdateState() {
    journeysStore.resetUpdateState();
  },

  getLoadStatus() {
    return journeysStore.loadStatus;
  },

  getErrorMessage() {
    return journeysStore.errorMessage;
  },

  getCreateStatus() {
    return journeysStore.createStatus;
  },

  getCreateErrorMessage() {
    return journeysStore.createErrorMessage;
  },

  getUpdateStatus() {
    return journeysStore.updateStatus;
  },

  getUpdateErrorMessage() {
    return journeysStore.updateErrorMessage;
  },

  getJourneys() {
    return journeysStore.journeys.map((item) => ({
      ...item,
      spentLabel: `$${item.spent.toLocaleString()}`,
    }));
  },
};
