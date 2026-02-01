import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Trail } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../store/useGameStore';
import { THEME } from '../theme';

interface MinerProps {
    id: string;
}

export const Miner: React.FC<MinerProps> = ({ id }) => {
    const minerRef = useRef<THREE.Group>(null);
    const { updateMinerState, depositResources } = useGameStore();

    const [machineState, setMachineState] = useState<'TRANSIT_OUT' | 'MINING' | 'TRANSIT_HOME'>('TRANSIT_OUT');
    // Removed state-based progress to prevent re-render thrashing
    // const [miningProgress, setMiningProgress] = useState(0); 

    // Refs for loop access
    const stateRef = useRef<'TRANSIT_OUT' | 'MINING' | 'TRANSIT_HOME'>('TRANSIT_OUT');
    const timerRef = useRef(0);
    const progressBarRef = useRef<HTMLDivElement>(null);

    // Settings
    const SPEED = 2.0;
    const MINING_DURATION = 5.0;
    const CARGO_CAPACITY = 100;

    // Random Start Position on Earth Surface (Radius ~0.65 to be visible above surface)
    const startPos = useMemo(() => {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = 0.65;
        return new THREE.Vector3(
            r * Math.sin(phi) * Math.cos(theta),
            r * Math.sin(phi) * Math.sin(theta),
            r * Math.cos(phi)
        );
    }, []);

    useFrame((_, delta) => {
        if (!minerRef.current) return;

        const currentState = stateRef.current;

        // 1. Calculate Target (Asteroid) Position (Single Source of Truth)
        // We do NOT simulate orbit here. We fetch the live physics state.
        const asteroidData = useGameStore.getState().asteroid;

        let asteroidPos = new THREE.Vector3(10, 0, 0); // Default fallback
        if (asteroidData) {
            const { a, e, theta } = asteroidData.orbit;
            const r = (a * (1 - e * e)) / (1 + e * Math.cos(theta));
            asteroidPos.set(
                r * Math.cos(theta),
                0,
                r * Math.sin(theta)
            );
        } else {
            // If no asteroid, maybe we are going home?
            // If we are MINING but asteroid is gone, we should ideally trigger a state change, 
            // but the store handles 'clearAsteroid' logic which likely recalls miners.
        }

        const currentPos = minerRef.current.position;

        // 2. State Machine
        if (currentState === 'TRANSIT_OUT') {
            const direction = new THREE.Vector3().subVectors(asteroidPos, currentPos).normalize();
            const distance = currentPos.distanceTo(asteroidPos);

            // Move towards CURRENT asteroid position (Pure Pursuit)
            currentPos.add(direction.multiplyScalar(SPEED * delta));
            minerRef.current.lookAt(asteroidPos);

            // Landing Check
            if (distance < 0.4) {
                stateRef.current = 'MINING';
                setMachineState('MINING');
                timerRef.current = 0;
            }
        }
        else if (currentState === 'MINING') {
            // HARD LOCK
            const surfaceOffset = new THREE.Vector3(0, 0.25, 0);
            currentPos.copy(asteroidPos).add(surfaceOffset);
            minerRef.current.rotation.set(0, 0, 0);

            // Progress
            timerRef.current += delta;

            // DIRECT DOM UPDATE needed for smooth unblocking UI
            if (progressBarRef.current) {
                const progress = Math.min((timerRef.current / MINING_DURATION) * 100, 100);
                progressBarRef.current.style.width = `${progress}%`;
            }

            if (timerRef.current >= MINING_DURATION) {
                stateRef.current = 'TRANSIT_HOME';
                setMachineState('TRANSIT_HOME');
                timerRef.current = 0;
            }
        }
        else if (currentState === 'TRANSIT_HOME') {
            const earthPos = new THREE.Vector3(0, 0, 0);
            const direction = new THREE.Vector3().subVectors(earthPos, currentPos).normalize();
            const distance = currentPos.distanceTo(earthPos);

            currentPos.add(direction.multiplyScalar(SPEED * delta));
            minerRef.current.lookAt(earthPos);

            // Entry Check
            if (distance < 0.7) {
                depositResources(CARGO_CAPACITY);
                updateMinerState(id, 'IDLE'); // Removes from store
            }
        }
    });

    return (
        <group ref={minerRef} position={startPos}>
            {/* Trail only active during flight */}
            {machineState !== 'MINING' && (
                <Trail
                    width={0.4}
                    length={6}
                    color="#00A3FF" // Command Blueish
                    attenuation={(t) => t}
                >
                    <mesh rotation={[Math.PI / 2, 0, 0]}>
                        <coneGeometry args={[0.08, 0.3, 8]} />
                        <meshStandardMaterial
                            color="#FFFFFF"
                            emissive="#00A3FF"
                            emissiveIntensity={2}
                            toneMapped={false}
                            transparent
                            opacity={0.6}
                        />
                    </mesh>
                </Trail>
            )}

            {/* Visible Miner (if not trail head) - actually cone above is the miner body */}

            {machineState === 'MINING' && (
                <>
                    <mesh position={[0, 0.15, 0]}>
                        <boxGeometry args={[0.15, 0.15, 0.15]} />
                        <meshStandardMaterial color={THEME.colors.glassWhite} wireframe />
                    </mesh>
                    <Html position={[0, 0.5, 0]} center>
                        <div className="flex flex-col items-center gap-1 pointer-events-none">
                            <div className="w-12 h-1 bg-black/50 rounded-full overflow-hidden border border-white/20 backdrop-blur-md">
                                <div
                                    ref={progressBarRef}
                                    className="h-full bg-glass-white shadow-[0_0_10px_white]"
                                    style={{ width: '0%', transition: 'none' }} // transition none for instant requestAnimationFrame updates
                                />
                            </div>
                            <span className="text-[8px] font-mono text-glass-white uppercase tracking-widest drop-shadow-md">
                                Extracting
                            </span>
                        </div>
                    </Html>
                </>
            )}
        </group>
    );
};
