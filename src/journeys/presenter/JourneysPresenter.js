import React from 'react';
import { observer } from 'mobx-react-lite';
import { journeysStore } from '../model/JourneysStore';
import { JourneysPersistence } from '../persistence/JourneysPersistence';
import { JourneysScreen } from '../view/JourneysScreen';

const JourneysPresenter = {
  init() {
    JourneysPersistence.init();
  },

  reload() {
    JourneysPersistence.retry();
  },

  onCreateJourney(input) {
    JourneysPersistence.saveNewJourney(input);
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

const journeysPresenterProps = {
  onInit: () => JourneysPresenter.init(),
  onReload: () => JourneysPresenter.reload(),
  onCreateJourney: (input) => JourneysPresenter.onCreateJourney(input),
  onResetCreateState: () => JourneysPresenter.resetCreateState(),
};

function JourneysPresenterView() {
  const props = {
    loadStatus: JourneysPresenter.getLoadStatus(),
    errorMessage: JourneysPresenter.getErrorMessage(),
    createStatus: JourneysPresenter.getCreateStatus(),
    createErrorMessage: JourneysPresenter.getCreateErrorMessage(),
    journeys: JourneysPresenter.getJourneys(),
    ...journeysPresenterProps,
  };

  return <JourneysScreen {...props} />;
}

export default observer(JourneysPresenterView);
