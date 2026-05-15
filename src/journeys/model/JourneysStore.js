import { makeAutoObservable } from 'mobx';

class JourneysStoreClass {
  journeys = [];

  loadStatus = 'idle';

  createStatus = 'idle';

  updateStatus = 'idle';

  errorMessage = null;

  createErrorMessage = null;

  updateErrorMessage = null;

  bgmMatchInFlight = {};

  constructor() {
    makeAutoObservable(this);
  }

  setLoadStarted() {
    this.loadStatus = 'loading';
    this.errorMessage = null;
  }

  setJourneysLoaded(data) {
    this.journeys = data;
    this.loadStatus = 'success';
  }

  setLoadError(message) {
    this.loadStatus = 'error';
    this.errorMessage = message;
  }

  setCreateStarted() {
    this.createStatus = 'loading';
    this.createErrorMessage = null;
  }

  addJourney(created) {
    this.journeys = [created, ...this.journeys];
    this.createStatus = 'success';
  }

  setCreateError(message) {
    this.createStatus = 'error';
    this.createErrorMessage = message;
  }

  resetCreateState() {
    this.createStatus = 'idle';
    this.createErrorMessage = null;
  }

  setUpdateStarted() {
    this.updateStatus = 'loading';
    this.updateErrorMessage = null;
  }

  replaceJourney(updated) {
    this.journeys = this.journeys.map((item) =>
      String(item.id) === String(updated.id) ? updated : item,
    );
    this.updateStatus = 'success';
  }

  setUpdateError(message) {
    this.updateStatus = 'error';
    this.updateErrorMessage = message;
  }

  setBgmMatchInFlight(targetId, isInFlight) {
    if (isInFlight) {
      this.bgmMatchInFlight[targetId] = true;
    } else {
      delete this.bgmMatchInFlight[targetId];
    }
  }

  resetUpdateState() {
    this.updateStatus = 'idle';
    this.updateErrorMessage = null;
  }
}

export const journeysStore = new JourneysStoreClass();
