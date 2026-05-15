import React from 'react';
import { observer } from 'mobx-react-lite';
import { journeysStore } from '../model/JourneysStore';
import { JourneysPersistence } from '../persistence/JourneysPersistence';
import { JourneyPlaybackPersistence } from '../persistence/JourneyPlaybackPersistence';
import { JourneyDetailScreen } from '../view/JourneyDetailScreen';

const JourneyDetailPresenter = {
  init() {
    JourneysPersistence.init();
  },

  reload() {
    JourneysPersistence.retry();
  },

  onUpdateJourney(input) {
    JourneysPersistence.saveJourneyUpdate(input);
  },

  ensureBgmTrack(journeyId) {
    JourneysPersistence.loadBgmTrack(journeyId);
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

const journeyDetailPresenterProps = {
  onInit: () => JourneyDetailPresenter.init(),
  onReload: () => JourneyDetailPresenter.reload(),
  onUpdateJourney: (input) => JourneyDetailPresenter.onUpdateJourney(input),
  onEnsureBgmTrack: (journeyId) => JourneyDetailPresenter.ensureBgmTrack(journeyId),
  onPlayBgm: (previewUrl, volume) =>
    JourneyPlaybackPersistence.playBgm(previewUrl, volume),
  onPauseBgm: () => JourneyPlaybackPersistence.pauseBgm(),
  onStopBgm: () => JourneyPlaybackPersistence.stopBgm(),
  onResetUpdateState: () => JourneyDetailPresenter.resetUpdateState(),
};

function JourneyDetailPresenterView() {
  const props = {
    loadStatus: JourneyDetailPresenter.getLoadStatus(),
    errorMessage: JourneyDetailPresenter.getErrorMessage(),
    updateStatus: JourneyDetailPresenter.getUpdateStatus(),
    updateErrorMessage: JourneyDetailPresenter.getUpdateErrorMessage(),
    getJourneyById: (journeyId) => JourneyDetailPresenter.getJourneyById(journeyId),
    ...journeyDetailPresenterProps,
  };

  return <JourneyDetailScreen {...props} />;
}

export default observer(JourneyDetailPresenterView);
