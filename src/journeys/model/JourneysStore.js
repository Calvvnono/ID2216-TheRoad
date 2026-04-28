import { makeAutoObservable, runInAction } from 'mobx';
import { BgmRecommendationService } from './BgmRecommendationService';
import { JourneysService } from './JourneysService';

class JourneysStoreClass {
  journeys = [];

  loadStatus = 'idle';

  createStatus = 'idle';

  updateStatus = 'idle';

  errorMessage = null;

  createErrorMessage = null;

  updateErrorMessage = null;

  bgmStatusByJourneyId = {};

  bgmErrorByJourneyId = {};

  bgmTrackByJourneyId = {};

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
        this.bgmStatusByJourneyId = {};
        this.bgmErrorByJourneyId = {};
        this.bgmTrackByJourneyId = {};
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
        this.bgmStatusByJourneyId[String(created.id)] = 'idle';
        this.bgmErrorByJourneyId[String(created.id)] = null;
        delete this.bgmTrackByJourneyId[String(created.id)];
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
        this.bgmStatusByJourneyId[String(updated.id)] = 'idle';
        this.bgmErrorByJourneyId[String(updated.id)] = null;
        delete this.bgmTrackByJourneyId[String(updated.id)];
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

  async matchBgmForJourney(journeyId) {
    const id = String(journeyId || '');
    if (!id) return null;

    if (this.bgmTrackByJourneyId[id]) {
      this.bgmStatusByJourneyId[id] = 'success';
      return this.bgmTrackByJourneyId[id];
    }

    if (this.bgmStatusByJourneyId[id] === 'loading') {
      return null;
    }

    const journey = this.journeys.find((item) => String(item.id) === id);
    if (!journey) {
      this.bgmStatusByJourneyId[id] = 'error';
      this.bgmErrorByJourneyId[id] = 'Journey not found.';
      return null;
    }

    this.bgmStatusByJourneyId[id] = 'loading';
    this.bgmErrorByJourneyId[id] = null;

    try {
      const track = await BgmRecommendationService.recommendJourneyBgm(journey);
      runInAction(() => {
        if (track) {
          this.bgmTrackByJourneyId[id] = track;
          this.bgmStatusByJourneyId[id] = 'success';
          this.bgmErrorByJourneyId[id] = null;
        } else {
          this.bgmTrackByJourneyId[id] = null;
          this.bgmStatusByJourneyId[id] = 'empty';
          this.bgmErrorByJourneyId[id] = 'No matching BGM preview found.';
        }
      });
      return track;
    } catch (e) {
      runInAction(() => {
        this.bgmTrackByJourneyId[id] = null;
        this.bgmStatusByJourneyId[id] = 'error';
        this.bgmErrorByJourneyId[id] = e.message || 'Failed to match BGM.';
      });
      return null;
    }
  }
}

export const journeysStore = new JourneysStoreClass();
