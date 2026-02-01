import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { THEME } from '../theme';
import * as THREE from 'three';

export const Earth: React.FC = () => {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((_, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += delta * 0.1; // Slow rotation
        }
    });

    return (
        <group>
            {/* Core Earth Sphere */}
            <mesh ref={meshRef} scale={[1, 1, 1]}>
                <sphereGeometry args={[1, 64, 64]} />
                <meshStandardMaterial
                    color="#1a2b3c" // Deep ocean blue-ish base
                    emissive={THEME.colors.glassWhite}
                    emissiveIntensity={0.2}
                    roughness={0.7}
                    wireframe={true} // Tactical wireframe look for now
                />
            </mesh>

            {/* Atmosphere Glow */}
            <mesh scale={[1.1, 1.1, 1.1]}>
                <sphereGeometry args={[1, 32, 32]} />
                <meshBasicMaterial
                    color={THEME.colors.glassWhite}
                    transparent={true}
                    opacity={0.05}
                    side={THREE.BackSide}
                />
            </mesh>
        </group>
    );
};
