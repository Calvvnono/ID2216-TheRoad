import { makeAutoObservable } from 'mobx';
import { Audio } from 'expo-av';

class JourneyPlaybackStore {
  bgmSound = null;

  bgmLoadedUrl = '';

  constructor() {
    makeAutoObservable(this, { bgmSound: false });
  }

  async playBgm(previewUrl, volume = 0.58) {
    if (!previewUrl) return;

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        staysActiveInBackground: false,
        playThroughEarpieceAndroid: false,
      });
    } catch (e) {
      console.warn('Failed to configure audio mode:', e?.message || e);
    }

    if (this.bgmSound && this.bgmLoadedUrl === previewUrl) {
      try {
        await this.bgmSound.playAsync();
      } catch (e) {
        console.warn('Failed to resume BGM:', e?.message || e);
      }
      return;
    }

    await this.stopBgm();

    try {
      const result = await Audio.Sound.createAsync(
        { uri: previewUrl },
        {
          shouldPlay: true,
          isLooping: true,
          volume,
        },
      );

      this.bgmSound = result.sound;
      this.bgmLoadedUrl = previewUrl;
    } catch (e) {
      console.warn('Failed to start BGM:', e?.message || e);
    }
  }

  async pauseBgm() {
    if (!this.bgmSound) return;
    try {
      const status = await this.bgmSound.getStatusAsync();
      if (status && status.isLoaded && status.isPlaying) {
        await this.bgmSound.pauseAsync();
      }
    } catch (e) {
      console.warn('Failed to pause BGM:', e?.message || e);
    }
  }

  async stopBgm() {
    const sound = this.bgmSound;
    this.bgmSound = null;
    this.bgmLoadedUrl = '';

    if (!sound) return;
    try {
      await sound.unloadAsync();
    } catch (e) {
      console.warn('Failed to unload BGM:', e?.message || e);
    }
  }
}

export const journeyPlaybackStore = new JourneyPlaybackStore();
