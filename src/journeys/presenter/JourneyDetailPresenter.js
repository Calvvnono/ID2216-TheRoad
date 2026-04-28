import { journeysStore } from '../model/JourneysStore';

export const JourneyDetailPresenter = {
  init() {
    journeysStore.init();
  },

  reload() {
    journeysStore.retry();
  },

  onUpdateJourney(input) {
    journeysStore.updateJourney(input);
  },

  ensureBgmTrack(journeyId) {
    journeysStore.ensureBgmTrack(journeyId);
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

  getUpdateStatus() {
    return journeysStore.updateStatus;
  },

  getUpdateErrorMessage() {
    return journeysStore.updateErrorMessage;
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
