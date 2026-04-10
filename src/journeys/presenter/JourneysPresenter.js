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

  resetCreateState() {
    journeysStore.resetCreateState();
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

  getJourneys() {
    return journeysStore.journeys.map((item) => ({
      ...item,
      spentLabel: `$${item.spent.toLocaleString()}`,
    }));
  },
};
