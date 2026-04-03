import { journeysStore } from '../model/JourneysStore';

export const JourneysPresenter = {
  init() {
    journeysStore.init();
  },

  reload() {
    journeysStore.retry();
  },

  onJourneyPress(journeyId) {
    journeysStore.selectJourney(journeyId);
  },

  getLoadStatus() {
    return journeysStore.loadStatus;
  },

  getErrorMessage() {
    return journeysStore.errorMessage;
  },

  getJourneys() {
    return journeysStore.journeys.map((item) => ({
      ...item,
      spentLabel: `$${item.spent.toLocaleString()}`,
    }));
  },

  getSelectedJourneyId() {
    return journeysStore.selectedJourneyId;
  },
};
