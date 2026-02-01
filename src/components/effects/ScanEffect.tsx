import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame, extend } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';
import { useAudio } from '../../hooks/useAudio';
import { shaderMaterial } from '@react-three/drei';

// Define the Shader Logic
const ScanRingMaterial = shaderMaterial(
    {
        uTime: 0,
        uColor: new THREE.Color(0.0, 1.0, 0.0), // Bright Green
        uRadius: 0,
        uWidth: 0.15, // Thickness of the ring
        uTargetDist: 1000.0, // Far away by default
        uTargetAngle: 0.0, // Radians
        uOpacity: 1.0,
    },
    // Vertex Shader
    `
    varying vec2 vUv;
    varying vec3 vPos;
    void main() {
      vUv = uv;
      vPos = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
    // Fragment Shader
    `
    uniform float uRadius;
    uniform float uWidth;
    uniform float uTargetDist;
    uniform float uTargetAngle;
    uniform vec3 uColor;
    uniform float uOpacity;
    varying vec3 vPos;

    #define PI 3.14159265359

    void main() {
      // Convert to Polar
      float x = vPos.x;
      float y = vPos.y; // Since plane is XY
      float r = length(vec2(x, y));
      float angle = atan(y, x); // -PI to PI
      
      // Calculate Angle Difference to Target (Shortest path)
      float diff = abs(angle - uTargetAngle);
      if (diff > PI) diff = 2.0 * PI - diff;

      // Distortion Logic
      // If the ring (uRadius) has passed the target (uTargetDist), and we are near the angle...
      float offset = 0.0;
      
      if (uRadius > uTargetDist) {
         // Gaussian falloff for angle
         // Width of influence ~ 0.5 radians
         float influence = exp(-diff * diff * 20.0); 
         
         // How far past are we?
         float past = uRadius - uTargetDist;
         
         // Drag back amount:
         // We want to drag back 'past' amount at the center of influence (pinning it to uTargetDist)
         // But allow it to snap back eventually? 
         // User "bends back towards earth".
         // Let's pin it firmly for a while (e.g. up to 15 units past), then relax?
         // Let's cap 'past' influence at 25.0
         float sticky = min(past, 25.0);
         
         offset = sticky * influence;
      }

      // The distinct visual radius at this angle
      float visualRadius = uRadius - offset;

      // Ring SDF
      // Distance from the curved line
      float dist = abs(r - visualRadius);
      
      // Smoothstep for soft anti-aliased edges
      // Outer glow
      float brightness = smoothstep(uWidth + 0.5, uWidth, dist);
      
      // Hard core
      float core = smoothstep(uWidth * 0.2, 0.0, dist);
      
      float alpha = (brightness * 0.5 + core) * uOpacity;

      // Fade out far from center (optional vignetting for the ring)
      // alpha *= smoothstep(60.0, 50.0, r);

      gl_FragColor = vec4(uColor, alpha);
    }
  `
);

extend({ ScanRingMaterial });

// Declare for TS
// Declare for TS

declare module '@react-three/fiber' {
    interface ThreeElements {
        scanRingMaterial: any;
    }
}

export const ScanEffect: React.FC = () => {
    const isScanning = useGameStore(state => state.isScanning);
    const finalizeScan = useGameStore(state => state.finalizeScan);
    const revealAsteroid = useGameStore(state => state.revealAsteroid);
    const asteroid = useGameStore(state => state.asteroid);
    const { playSound } = useAudio();

    // Target Calculations
    const targetData = useMemo(() => {
        if (!asteroid) return { dist: 2000, theta: 0 };
        return {
            dist: asteroid.orbit.a,
            theta: asteroid.orbit.theta
        };
    }, [asteroid]);

    const activeRef = useRef(false);
    const radiusRef = useRef(0);
    const materialRef = useRef<any>(null);

    useEffect(() => {
        if (isScanning && !activeRef.current) {
            activeRef.current = true;
            radiusRef.current = 0;
            playSound('scan_sonar');

            setTimeout(() => {
                finalizeScan();
                activeRef.current = false;
            }, 4000);
        }
    }, [isScanning, finalizeScan, playSound]);

    useFrame((_, delta) => {
        if (!activeRef.current || !materialRef.current) return;

        // Expansion Speed
        const speed = 25;
        radiusRef.current += speed * delta;

        // Update Uniforms
        materialRef.current.uRadius = radiusRef.current;
        materialRef.current.uTargetDist = targetData.dist;
        materialRef.current.uTargetAngle = targetData.theta;
        materialRef.current.uTime += delta;

        // Fade out at end
        // Max range approx 100?
        if (radiusRef.current > 80) {
            materialRef.current.uOpacity = Math.max(0, 1 - (radiusRef.current - 80) / 20);
        } else {
            materialRef.current.uOpacity = 1;
        }

        // Logic Reveal
        // If the *distorted* ring passes the asteroid?
        // Actually, the shader just bends the visual. 
        // The logic trigger should technically happen when the UNDISTORTED ring gets there 
        // OR when the visual ring gets there (which is stuck).
        // If visuals stick, the "ring" never passes the asteroid visually until the stickiness breaks.
        // But user wants reveal "When intersects".
        // Let's stick to: Trigger when base radius hits distance.
        if (radiusRef.current >= targetData.dist && !useGameStore.getState().asteroidRevealed) {
            revealAsteroid();
        }
    });

    if (!isScanning && !activeRef.current) return null;

    return (
        // Render a large plane covering the scan area
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
            <planeGeometry args={[200, 200]} />
            <scanRingMaterial
                ref={materialRef}
                transparent
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </mesh>
    );
};
