import { makeAutoObservable, runInAction } from 'mobx';
import { JourneysService } from './JourneysService';

class JourneysStoreClass {
  journeys = [];

  loadStatus = 'idle';

  createStatus = 'idle';

  errorMessage = null;

  createErrorMessage = null;

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
}

export const journeysStore = new JourneysStoreClass();
