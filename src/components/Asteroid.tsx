import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useGameStore } from '../store/useGameStore';
import { THEME } from '../theme';
import * as THREE from 'three';
import { useAudio } from '../hooks/useAudio';

const TargetReticle: React.FC = () => {
    const meshRef = useRef<THREE.Mesh>(null);
    const timeRef = useRef(0);

    useFrame((_, delta) => {
        if (!meshRef.current) return;
        timeRef.current += delta;

        // Animation Phase 1: Lock On (0 - 0.5s)
        if (timeRef.current < 0.5) {
            const t = timeRef.current / 0.5;
            // Ease out cubic
            const ease = 1 - Math.pow(1 - t, 3);
            const scale = 5 - (3.5 * ease); // 5 -> 1.5
            meshRef.current.scale.set(scale, scale, scale);
            // @ts-ignore
            if (meshRef.current.material) meshRef.current.material.opacity = t;
        }
        // Phase 2: Pulse (0.5 - 1.0s)
        else if (timeRef.current < 1.0) {
            // Nothing intense, just hold or slight breath
            const scale = 1.5 + Math.sin((timeRef.current - 0.5) * Math.PI * 2) * 0.1;
            meshRef.current.scale.set(scale, scale, scale);
        }
        // Phase 3: Steady
        else {
            // Slow breathe
            const scale = 1.5 + Math.sin(timeRef.current * 2) * 0.05;
            meshRef.current.scale.set(scale, scale, scale);
            // @ts-ignore
            if (meshRef.current.material) meshRef.current.material.opacity = 0.8;
        }

        // Face camera
        meshRef.current.lookAt(0, 50, 50); // Approximation of camera or Earth? 
        // Actually, billboards are better, but a flat ring on the asteroid plane is cool too.
        // Let's make it billboard to camera.
        if (meshRef.current.parent) {
            // Simplified lookAt camera logic handled by strict rotation if needed, 
            // but let's just rotate slowly on Z for tech effect
            meshRef.current.rotation.z += delta * 0.5;
        }
    });

    return (
        <mesh ref={meshRef}>
            <ringGeometry args={[0.9, 1.0, 64]} />
            <meshBasicMaterial color="#4ade80" transparent opacity={0} side={THREE.DoubleSide} toneMapped={false} />
        </mesh>
    );
};

// Orbit Formula: r = a(1-e^2) / (1 + e*cos(theta))
// x = r * cos(theta)
// z = r * sin(theta)

export const Asteroid: React.FC = () => {
    // Only subscribe to the ID/Status to avoid 60fps re-renders when Orbit updates
    const asteroidId = useGameStore(state => state.asteroid?.id);
    const asteroidStatus = useGameStore(state => state.asteroid?.status);
    const clearAsteroid = useGameStore(state => state.clearAsteroid);
    const { playSound } = useAudio();

    // We need the data, but we'll fetch it repeatedly in useFrame to avoid reacting to 'theta' changes

    const meshRef = useRef<THREE.Mesh>(null);
    const groupsRef = useRef<THREE.Group>(null);

    // Shatter State
    const [isShattering, setIsShattering] = React.useState(false);

    // Spawn Fade In
    const spawnTimeRef = useRef(0);
    useFrame((_, delta) => {
        if (!groupsRef.current) return;

        // Only run if we are NOT destroying it
        if (!isShattering && asteroidStatus !== 'DEPLETED') {
            spawnTimeRef.current += delta;
            const opacity = Math.min(1, spawnTimeRef.current / 1.5); // 1.5s fade in

            groupsRef.current.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    if (child.material) {
                        const materials = Array.isArray(child.material) ? child.material : [child.material];
                        materials.forEach(mat => {
                            mat.transparent = true;
                            // Only update if we are fading in. Once full, stop checking to save perf? 
                            // Actually it's fine to clamp at 1.
                            if (spawnTimeRef.current < 2.0) mat.opacity = opacity;
                            else mat.opacity = 1;
                        });
                    }
                }
            });
        }
    });

    // Watch for depletion (Status driven)
    React.useEffect(() => {
        if (asteroidStatus === 'DEPLETED' && !isShattering) {
            setIsShattering(true);
            playSound('asteroid_shatter');
            // Cleanup chain
            setTimeout(() => {
                clearAsteroid();
                setIsShattering(false);
                spawnTimeRef.current = 0; // Reset fade time for next shatter
            }, 3000);
        }
    }, [asteroidStatus, clearAsteroid, isShattering]);

    useFrame((state) => {
        // Read FRESH state directly
        const currentData = useGameStore.getState().asteroid;
        if (!currentData || !meshRef.current) return;

        // Use the Store's authoritative Theta
        const { a, e, theta } = currentData.orbit;

        const r = (a * (1 - e * e)) / (1 + e * Math.cos(theta));
        const x = r * Math.cos(theta);
        const z = r * Math.sin(theta);

        // Update Position
        meshRef.current.position.set(x, 0, z);
        if (!isShattering) {
            const time = state.clock.getElapsedTime();
            meshRef.current.rotation.x = time * 0.5;
            meshRef.current.rotation.y = time * 0.8;
        }

        // Shatter Animation
        if (isShattering && groupsRef.current) {
            // Expand children
            groupsRef.current.children.forEach((child, i) => {
                const speed = 0.5;
                const dir = new THREE.Vector3(
                    Math.sin(i), Math.cos(i), Math.sin(i * 2)
                ).normalize();
                child.position.add(dir.multiplyScalar(speed * 0.016));
                child.rotation.x += 0.1;

                // Fade out (Naive approach, requires transparent material)
                if (child instanceof THREE.Mesh) {
                    // @ts-ignore
                    if (child.material) child.material.opacity -= (1.0 / 180); // approx 3s at 60fps
                }
            });
        }
    });

    if (!asteroidId && !isShattering) return null;

    // We render using the captured ID/Props or the last known state for shattering
    const displayData = useGameStore.getState().asteroid;
    if (!displayData && !isShattering) return null;

    // Use displayData for rendering. It must exist if not shattering (due to check above)
    // or if shattering, we might rely on debris locally.
    const safeData = displayData || { name: 'Unknown', aetherite: 0, orbit: { a: 10, e: 0 } };

    if (isShattering) {
        return (
            <group ref={meshRef}> {/* Follows orbit */}
                <TargetReticle />
                <group ref={groupsRef}>
                    {[...Array(8)].map((_, i) => (
                        <mesh key={i} position={[Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5]}>
                            <dodecahedronGeometry args={[0.08, 0]} />
                            <meshStandardMaterial
                                color={THEME.colors.aetherite}
                                transparent
                                opacity={1}
                            />
                        </mesh>
                    ))}
                </group>
            </group>
        )
    }

    return (
        <group>
            <mesh ref={meshRef}>
                <dodecahedronGeometry args={[0.2, 0]} /> {/* Low-poly look */}
                <meshStandardMaterial
                    color={THEME.colors.aetherite}
                    emissive={THEME.colors.aetherite}
                    emissiveIntensity={0.4}
                    roughness={0.8}
                    flatShading={true}
                />

                <Html
                    position={[0, 0.4, 0]}
                    center
                    distanceFactor={10}
                    zIndexRange={[100, 0]}
                    pointerEvents="none"
                >
                    <div className="pointer-events-none min-w-[80px]">
                        <div
                            className="backdrop-blur-sm bg-white/5 border border-white/20 p-1 px-2 rounded"
                        >
                            <div className="text-[8px] text-glass-white font-mono font-bold whitespace-nowrap">
                                {safeData.name}
                            </div>
                            <div className="text-[8px] text-aetherite font-mono">
                                {safeData.aetherite} U
                            </div>
                        </div>
                        {/* Connector Line */}
                        <div className="w-[1px] h-2 bg-glass-white opacity-30 mx-auto"></div>
                    </div>
                </Html>
            </mesh>

            <OrbitPath a={safeData.orbit.a} e={safeData.orbit.e} />
        </group>
    );
};

const OrbitPath: React.FC<{ a: number; e: number }> = ({ a, e }) => {
    const points = [];
    const segments = 64;
    for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        const r = (a * (1 - e * e)) / (1 + e * Math.cos(theta));
        points.push(new THREE.Vector3(r * Math.cos(theta), 0, r * Math.sin(theta)));
    }
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);

    return (
        <primitive object={new THREE.Line(
            lineGeometry,
            new THREE.LineBasicMaterial({
                color: THEME.colors.glassWhite,
                opacity: 0.1,
                transparent: true
            })
        )} />
    );
};
