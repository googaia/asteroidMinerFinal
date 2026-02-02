import { useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useGameStore } from '../store/useGameStore';
import * as THREE from 'three';
import { OrbitControls } from 'three-stdlib';

export const CameraController = ({ controlsRef }: { controlsRef: React.RefObject<OrbitControls> }) => {
    const { } = useThree(); // Camera unused but hook needed? Actually maybe not.
    // If I don't use useThree, I don't need it.

    const hasScan = useGameStore(s => s.research.scan);

    // Zoom Levels
    const ZOOM_INTRO = 3.2; // Locked Intro Zoom
    const ZOOM_GAME = 12.0; // Game Zoom (Earth + 1st Asteroid)

    // Helper ref to track current zoom target for smooth animation
    const currentZoom = useRef(ZOOM_INTRO);

    useFrame((_, delta) => {
        const controls = controlsRef.current;
        if (!controls) return;

        // Ensure controls are enabled for rotation
        controls.enabled = true;
        controls.enableRotate = true;

        // Disable Zoom logic handled by App.tsx (enableZoom={false}), 
        // but we enforce it here via min/max distance which effectively sets the camera radius.

        const targetZoom = hasScan ? ZOOM_GAME : ZOOM_INTRO;

        // Slow Zoom Out Animation
        // Determine speed: Slower if we are zooming out
        const speed = hasScan ? 0.3 : 2.0; // Slower zoom out (0.3)

        currentZoom.current = THREE.MathUtils.lerp(currentZoom.current, targetZoom, delta * speed);

        // Apply to controls
        controls.minDistance = currentZoom.current;
        controls.maxDistance = currentZoom.current;

        controls.update();
    });

    return null;
};
