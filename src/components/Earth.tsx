import React, { useRef } from 'react';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { extend, useFrame } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';

// Custom Atmosphere Shader - Kept but made subtle or tuned as needed.
// User hated "atmosphere ring" but this shader is the soft glow.
// I'll keep it but perhaps reduce opacity or power if it looks fake.
const AtmosphereMaterial = shaderMaterial(
    { color: new THREE.Color('#40A0FF'), coefficient: 0.5, power: 4.0 },
    // Vertex Shader
    `
    varying vec3 vNormal;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
    // Fragment Shader
    `
    uniform vec3 color;
    uniform float coefficient;
    uniform float power;
    varying vec3 vNormal;
    void main() {
      float intensity = pow(coefficient - dot(vNormal, vec3(0.0, 0.0, 1.0)), power);
      
      float alpha = intensity;
      
      // Hard edge logic if desired, or soften it if user hated "ring"
      if (alpha < 0.05) discard;
      if (alpha > 0.8) alpha = 0.8; 

      gl_FragColor = vec4(color, alpha);
    }
  `
);

extend({ AtmosphereMaterial });

// Declare global JSX for custom shader
declare module '@react-three/fiber' {
    interface ThreeElements {
        atmosphereMaterial: any;
    }
}

export const Earth: React.FC = () => {
    const meshRef = useRef<THREE.Mesh>(null);
    const colorMap = useTexture('/assets/textures/earth_vibrant.png');

    useFrame((_, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += delta * 0.02; // Slow rotation
        }
    });

    return (
        <group>
            {/* Core Earth Sphere */}
            <mesh ref={meshRef} scale={[1, 1, 1]}>
                <sphereGeometry args={[1, 64, 64]} />
                <meshStandardMaterial
                    map={colorMap}
                    color="white"
                    roughness={0.4}
                    metalness={0.2}
                    emissive={new THREE.Color("#112244")}
                    emissiveIntensity={1.2} // High self-illumination
                    envMapIntensity={2.0}
                />
            </mesh>

            {/* Atmosphere Glow (Custom Shader) */}
            <mesh scale={[1.2, 1.2, 1.2]}>
                <sphereGeometry args={[1, 64, 64]} />
                <atmosphereMaterial
                    transparent
                    side={THREE.BackSide}
                    blending={THREE.AdditiveBlending}
                    color={new THREE.Color("#00A3FF")}
                    coefficient={0.4}
                    power={5.0} // Falloff
                />
            </mesh>

            {/* REMOVED Outer Hard Line Ring (Mesh) */}
        </group>
    );
};
