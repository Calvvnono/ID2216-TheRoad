import { makeAutoObservable } from 'mobx';

class JourneyPlaybackStore {
  bgmSound = null;

  bgmLoadedUrl = '';

  constructor() {
    makeAutoObservable(this, { bgmSound: false });
  }

  setBgmSound(sound, url) {
    this.bgmSound = sound;
    this.bgmLoadedUrl = url;
  }

  clearBgmSound() {
    this.bgmSound = null;
    this.bgmLoadedUrl = '';
  }
}

export const journeyPlaybackStore = new JourneyPlaybackStore();
