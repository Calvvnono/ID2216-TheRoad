import { makeAutoObservable, runInAction } from 'mobx';
import { JourneysService } from './JourneysService';

class JourneysStoreClass {
  journeys = [];

  loadStatus = 'idle';

  createStatus = 'idle';

  updateStatus = 'idle';

  errorMessage = null;

  createErrorMessage = null;

  updateErrorMessage = null;

  constructor() {
    makeAutoObservable(this);
  }

  async loadJourneys() {
    this.loadStatus = 'loading';
    this.errorMessage = null;

    try {
      const data = await JourneysService.fetchJourneys();
      runInAction(() => {
        this.journeys = data;
        this.loadStatus = 'success';
      });
    } catch (e) {
      runInAction(() => {
        this.loadStatus = 'error';
        this.errorMessage = e.message || 'Failed to load journeys';
      });
    }
  }

  init() {
    if (this.loadStatus === 'idle') {
      this.loadJourneys();
    }
  }

  retry() {
    this.loadJourneys();
  }

  async createJourney(input) {
    this.createStatus = 'loading';
    this.createErrorMessage = null;

    try {
      const created = await JourneysService.createJourney(input);
      runInAction(() => {
        this.journeys = [created, ...this.journeys];
        this.createStatus = 'success';
      });
    } catch (e) {
      runInAction(() => {
        this.createStatus = 'error';
        this.createErrorMessage = e.message || 'Failed to create journey';
      });
    }
  }

  resetCreateState() {
    this.createStatus = 'idle';
    this.createErrorMessage = null;
  }

  async updateJourney(input) {
    this.updateStatus = 'loading';
    this.updateErrorMessage = null;

    try {
      const updated = await JourneysService.updateJourney(input);
      runInAction(() => {
        this.journeys = this.journeys.map((item) =>
          String(item.id) === String(updated.id) ? updated : item,
        );
        this.updateStatus = 'success';
      });
    } catch (e) {
      runInAction(() => {
        this.updateStatus = 'error';
        this.updateErrorMessage = e.message || 'Failed to update journey';
      });
    }
  }

  resetUpdateState() {
    this.updateStatus = 'idle';
    this.updateErrorMessage = null;
  }
}

export const journeysStore = new JourneysStoreClass();
