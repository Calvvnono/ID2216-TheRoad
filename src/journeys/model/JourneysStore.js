import { makeAutoObservable, runInAction } from 'mobx';
import { JourneysService } from './JourneysService';
import { ProfileService } from '../../profile/model/ProfileService';

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
      await ProfileService.awardJourneyCreatedXp();
      if (Array.isArray(created?.photoMemories) && created.photoMemories.length >= 3) {
        await ProfileService.awardJourneyPhotoMilestoneXp();
      }
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
      await ProfileService.awardJourneyEditedXp();
      if (Array.isArray(updated?.photoMemories) && updated.photoMemories.length >= 3) {
        await ProfileService.awardJourneyPhotoMilestoneXp();
      }
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

  async ensureBgmTrack(journeyId) {
    const targetId = String(journeyId || '').trim();
    if (!targetId || this.bgmMatchInFlight[targetId]) return;

    const target = this.journeys.find((item) => String(item.id) === targetId);
    if (!target || target?.bgmTrack?.previewUrl) return;

    this.bgmMatchInFlight[targetId] = true;

    try {
      const updated = await JourneysService.ensureBgmTrack(target);
      if (updated) {
        if (updated?.bgmTrack?.previewUrl && !target?.bgmTrack?.previewUrl) {
          await ProfileService.awardJourneyBgmMatchedXp();
        }
        runInAction(() => {
          this.journeys = this.journeys.map((item) =>
            String(item.id) === targetId ? updated : item,
          );
        });
      }
    } catch (e) {
      console.warn('BGM ensure failed:', e?.message || e);
    } finally {
      runInAction(() => {
        delete this.bgmMatchInFlight[targetId];
      });
    }
  }

  resetUpdateState() {
    this.updateStatus = 'idle';
    this.updateErrorMessage = null;
  }
}

export const journeysStore = new JourneysStoreClass();
