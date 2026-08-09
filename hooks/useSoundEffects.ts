'use client';

import useSound from 'use-sound';
import { SOFT_CLICK_URI, SOFT_SLIDE_URI, SOFT_CHIME_URI } from '../utils/sounds';
import { useSoundContext } from '../components/sound-provider';
import { useCallback } from 'react';

let lastPlayedTimestamp = 0;
const DEBOUNCE_MS = 80;

export function useSoundEffects() {
  const soundContext = useSoundContext();
  const soundEnabled = soundContext ? !soundContext.isMuted : true;

  const [playClickRaw] = useSound(SOFT_CLICK_URI, { volume: 0.6, soundEnabled });
  const [playSlideRaw] = useSound(SOFT_SLIDE_URI, { volume: 0.95, soundEnabled });
  const [playChimeRaw] = useSound(SOFT_CHIME_URI, { volume: 0.8, soundEnabled });

  const playClick = useCallback(() => {
    const now = Date.now();
    if (now - lastPlayedTimestamp < DEBOUNCE_MS) return;
    lastPlayedTimestamp = now;
    try {
      playClickRaw();
    } catch (e) {
      // Fallback or mute if sound fails
    }
  }, [playClickRaw]);

  const playSlide = useCallback(() => {
    const now = Date.now();
    if (now - lastPlayedTimestamp < DEBOUNCE_MS) return;
    lastPlayedTimestamp = now;
    try {
      playSlideRaw();
    } catch (e) {
      // Fallback
    }
  }, [playSlideRaw]);

  const playChime = useCallback(() => {
    const now = Date.now();
    if (now - lastPlayedTimestamp < DEBOUNCE_MS) return;
    lastPlayedTimestamp = now;
    try {
      playChimeRaw();
    } catch (e) {
      // Fallback
    }
  }, [playChimeRaw]);

  return {
    playClick,
    playSlide,
    playChime,
    playToggle: playSlide,
  };
}
