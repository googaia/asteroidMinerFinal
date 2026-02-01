import { useCallback } from 'react';
import { Howl } from 'howler';
import { useGameStore } from '../store/useGameStore';

const SFX_MAP: Record<string, string> = {
    'click_clean': '/assets/audio/sfx/ui/click_clean.wav',
    'rocket_launch': '/assets/audio/sfx/gameplay/rocket_launch.mp3',
    'asteroid_shatter': '/assets/audio/sfx/gameplay/asteroid_shatter.mp3',
    'scan_sonar': '/assets/audio/sfx/gameplay/scan_sonar.wav', // USER MUST PROVIDE
};

// Cache for Howl instances to avoid re-loading
const sfxCache: Record<string, Howl> = {};

export const useAudio = () => {
    const { sfxVolume, masterVolume, isMuted } = useGameStore();

    const playSound = useCallback((effectName: keyof typeof SFX_MAP) => {
        if (isMuted) return;

        const src = SFX_MAP[effectName];
        if (!src) return;

        if (!sfxCache[effectName]) {
            sfxCache[effectName] = new Howl({
                src: [src],
                volume: sfxVolume * masterVolume,
                preload: true,
            });
        }

        const sound = sfxCache[effectName];
        sound.volume(sfxVolume * masterVolume);
        sound.play();
    }, [sfxVolume, masterVolume, isMuted]);

    return { playSound };
};
