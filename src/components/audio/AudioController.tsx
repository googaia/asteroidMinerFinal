import React, { useEffect, useRef } from 'react';
import { Howl } from 'howler';
import { useGameStore } from '../../store/useGameStore';

const MUSIC_TRACKS: Record<number, string> = {
    1: '/assets/audio/music/slow-sci-fi-synthwave-underscore-music-loop-300694.mp3',
    2: '/assets/audio/music/act2_industrialization.mp3', // Future placeholder
};

export const AudioController: React.FC = () => {
    const { currentAct, musicVolume, masterVolume, isMuted } = useGameStore();

    const currentHowlRef = useRef<Howl | null>(null);
    const currentTrackIdRef = useRef<number>(0);
    const hasInteractedRef = useRef(false);

    // Global Interaction Listener for Autoplay Policy
    useEffect(() => {
        const unlockAudio = () => {
            if (!hasInteractedRef.current) {
                hasInteractedRef.current = true;
                // Try to start music if it's supposed to be playing but isn't
                if (!currentHowlRef.current && MUSIC_TRACKS[currentAct]) {
                    playTrack(currentAct);
                }
            }
        };

        window.addEventListener('click', unlockAudio);
        window.addEventListener('keydown', unlockAudio);
        return () => {
            window.removeEventListener('click', unlockAudio);
            window.removeEventListener('keydown', unlockAudio);
        };
    }, [currentAct]);

    // Volume / Mute Monitor
    useEffect(() => {
        const volume = isMuted ? 0 : musicVolume * masterVolume;
        if (currentHowlRef.current) {
            currentHowlRef.current.volume(volume);
        }
        Howler.volume(isMuted ? 0 : masterVolume); // Global master for SFX too
    }, [musicVolume, masterVolume, isMuted]);

    // Cross-fade Logic
    const playTrack = (act: number) => {
        if (!hasInteractedRef.current) return; // Wait for interaction

        const src = MUSIC_TRACKS[act];
        if (!src) return;

        const volume = isMuted ? 0 : musicVolume * masterVolume;

        // If something is engaging, fade it out
        if (currentHowlRef.current) {
            const oldHowl = currentHowlRef.current;
            oldHowl.fade(oldHowl.volume(), 0, 4000); // 4s fade out
            setTimeout(() => {
                oldHowl.unload();
            }, 4000);
        }

        // Start new track
        const newHowl = new Howl({
            src: [src],
            loop: true,
            volume: 0, // Start at 0 for fade in
            html5: true, // Streaming for large files
            onload: () => {
                newHowl.fade(0, volume, 4000); // 4s fade in
            }
        });

        newHowl.play();
        currentHowlRef.current = newHowl;
        currentTrackIdRef.current = act;
    };

    // Monitor Act Changes
    useEffect(() => {
        if (currentAct !== currentTrackIdRef.current) {
            playTrack(currentAct);
        }
    }, [currentAct]);

    return null; // Logic only component
};
