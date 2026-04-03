import { makeAutoObservable, runInAction } from 'mobx';
import { JourneysService } from './JourneysService';

class JourneysStoreClass {
  journeys = [];

  loadStatus = 'idle';

  errorMessage = null;

  selectedJourneyId = null;

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

  selectJourney(journeyId) {
    this.selectedJourneyId = journeyId;
  }

  init() {
    if (this.loadStatus === 'idle') {
      this.loadJourneys();
    }
  }

  retry() {
    this.loadJourneys();
  }
}

export const journeysStore = new JourneysStoreClass();
