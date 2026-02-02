import React, { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { SouthDock } from './components/layout/SouthDock';
import { Earth } from './components/Earth';
import { Asteroid } from './components/Asteroid';
import { Miner } from './components/Miner';
import { OrbitControls, Stars } from '@react-three/drei';
import { WestWing } from './components/layout/WestWing';
import { EastWing } from './components/layout/EastWing';
import { GameLoop } from './components/GameLoop';
import { AudioController } from './components/audio/AudioController';
import { ScanEffect } from './components/effects/ScanEffect';
import { useGameStore } from './store/useGameStore';
import { CameraController } from './components/CameraController';

export default function App() {
  const { asteroid, asteroidRevealed, miners } = useGameStore();
  const controlsRef = useRef<any>(null);

  return (
    <div className="relative w-full h-screen bg-space-black overflow-hidden">
      {/* 3D Layer */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 20, 20], fov: 45 }}>
          <React.Suspense fallback={null}>
            <CameraController controlsRef={controlsRef} />
            {/* Bright Lighting Setup */}
            <ambientLight intensity={2.0} />
            <pointLight position={[10, 10, 10]} intensity={2.5} />
            <pointLight position={[-10, -10, -10]} intensity={1.0} /> {/* Fill light */}

            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

            <GameLoop />
            <AudioController />
            <ScanEffect />
            <Earth />

            {asteroid && asteroidRevealed && <Asteroid />}

            {miners.map((miner) => (
              <Miner
                key={miner.id}
                id={miner.id}
              />
            ))}

            <OrbitControls
              ref={controlsRef}
              enableZoom={false}
              minDistance={3.2}
              maxDistance={50}
            />
          </React.Suspense>
        </Canvas>
      </div>

      {/* UI Overlay Layer - 3 Zone Layout */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-2 md:p-6">

        {/* Top Row: West and East Wings - ALWAYS ROW */}
        <div className="flex flex-row justify-between items-start h-full pb-20">
          {/* West Wing: Financials & Resources - Top Left */}
          <div className="h-auto md:h-2/3 pointer-events-auto flex justify-start">
            <WestWing />
          </div>

          {/* East Wing: Research - Top Right */}
          <div className="h-auto md:h-3/4 pointer-events-auto flex justify-end">
            <EastWing />
          </div>
        </div>

        {/* Bottom Row: South Dock */}
        <div className="absolute bottom-6 md:bottom-10 left-0 right-0 flex justify-center items-end pointer-events-none">
          <SouthDock />
        </div>
      </div>
    </div>
  );
}
