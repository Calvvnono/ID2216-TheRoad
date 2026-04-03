import { journeysStore } from '../model/JourneysStore';

export const JourneyDetailPresenter = {
  init() {
    journeysStore.init();
  },

  reload() {
    journeysStore.retry();
  },

  getLoadStatus() {
    return journeysStore.loadStatus;
  },

  getErrorMessage() {
    return journeysStore.errorMessage;
  },

  getJourneyById(journeyId) {
    if (!journeyId) return null;
    const targetId = String(journeyId);
    const raw = journeysStore.journeys.find((item) => String(item.id) === targetId);
    if (!raw) return null;

    return {
      ...raw,
      spentLabel: `$${raw.spent.toLocaleString()}`,
    };
  },
};
