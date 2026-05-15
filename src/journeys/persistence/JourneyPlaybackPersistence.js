import { Audio } from 'expo-av';
import { journeyPlaybackStore } from '../model/JourneyPlaybackStore';

export const JourneyPlaybackPersistence = {
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

    if (
      journeyPlaybackStore.bgmSound &&
      journeyPlaybackStore.bgmLoadedUrl === previewUrl
    ) {
      try {
        await journeyPlaybackStore.bgmSound.playAsync();
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

      journeyPlaybackStore.setBgmSound(result.sound, previewUrl);
    } catch (e) {
      console.warn('Failed to start BGM:', e?.message || e);
    }
  },

  async pauseBgm() {
    if (!journeyPlaybackStore.bgmSound) return;
    try {
      const status = await journeyPlaybackStore.bgmSound.getStatusAsync();
      if (status && status.isLoaded && status.isPlaying) {
        await journeyPlaybackStore.bgmSound.pauseAsync();
      }
    } catch (e) {
      console.warn('Failed to pause BGM:', e?.message || e);
    }
  },

  async stopBgm() {
    const sound = journeyPlaybackStore.bgmSound;
    journeyPlaybackStore.clearBgmSound();

    if (!sound) return;
    try {
      await sound.unloadAsync();
    } catch (e) {
      console.warn('Failed to unload BGM:', e?.message || e);
    }
  },
};
