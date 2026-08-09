'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface SoundContextType {
  isMuted: boolean;
  toggleMute: () => void;
  volume: number;
  setVolume: (val: number) => void;
}

const SoundContext = createContext<SoundContextType>({
  isMuted: false,
  toggleMute: () => {},
  volume: 0.75,
  setVolume: () => {},
});

const SOUND_MUTE_KEY = 'instascrape_sound_muted';
const SOUND_VOLUME_KEY = 'instascrape_sound_volume';

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolumeState] = useState(0.75);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedMute = localStorage.getItem(SOUND_MUTE_KEY);
    if (storedMute !== null) {
      setIsMuted(storedMute === 'true');
    }
    const storedVol = localStorage.getItem(SOUND_VOLUME_KEY);
    if (storedVol !== null) {
      const parsed = parseFloat(storedVol);
      if (!isNaN(parsed) && parsed >= 0.1) setVolumeState(parsed);
      else setVolumeState(0.75);
    }
  }, []);

  const toggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem(SOUND_MUTE_KEY, String(next));
      }
      return next;
    });
  };

  const setVolume = (val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    setVolumeState(clamped);
    if (typeof window !== 'undefined') {
      localStorage.setItem(SOUND_VOLUME_KEY, String(clamped));
    }
  };

  return (
    <SoundContext.Provider
      value={{
        isMuted: mounted ? isMuted : false,
        toggleMute,
        volume,
        setVolume,
      }}
    >
      {children}
    </SoundContext.Provider>
  );
}

export function useSoundContext() {
  return useContext(SoundContext);
}
