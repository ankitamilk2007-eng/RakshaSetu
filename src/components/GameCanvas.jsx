import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { CityScene } from './CityScene';
import { PlayerCharacter } from './PlayerCharacter';
import { DistrictBeacons } from './DistrictBeacons';
import { DISTRICTS } from '../utils/gameData';
import { soundEngine } from '../audio/synthAudio';

// Smooth 3rd-Person Camera Controller
function CameraFollow({ playerPos, playerRot }) {
  const cameraRef = useRef();

  useFrame(() => {
    if (cameraRef.current) {
      const dist = 16;
      const height = 9;
      const targetX = playerPos[0] - Math.sin(playerRot) * dist;
      const targetZ = playerPos[2] - Math.cos(playerRot) * dist;

      // Lerp camera for smooth fluid tracking
      cameraRef.current.position.x = THREE.MathUtils.lerp(cameraRef.current.position.x, targetX, 0.12);
      cameraRef.current.position.y = THREE.MathUtils.lerp(cameraRef.current.position.y, height, 0.12);
      cameraRef.current.position.z = THREE.MathUtils.lerp(cameraRef.current.position.z, targetZ, 0.12);

      // Camera focuses at player torso level
      cameraRef.current.lookAt(playerPos[0], playerPos[1] + 2.0, playerPos[2]);
    }
  });

  return (
    <PerspectiveCamera 
      ref={cameraRef} 
      makeDefault 
      fov={60} 
      position={[0, 9, 31]} 
      near={0.1} 
      far={500} 
    />
  );
}

export function GameCanvas({ 
  districtStates, 
  activeDistrictId, 
  onEnterDistrict, 
  onPause, 
  onPlayerMove, 
  timeRemaining 
}) {
  const [playerPos, setPlayerPos] = useState([0, 0, 15]); // Spawn in front of NEXUS HQ
  const [playerRot, setPlayerRot] = useState(0);
  const [isSprinting, setIsSprinting] = useState(false);
  const [isMoving, setIsMoving] = useState(false);

  const keysPressed = useRef({});

  // Keyboard controls listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      keysPressed.current[e.key.toLowerCase()] = true;

      if (e.key === 'Shift') setIsSprinting(true);

      if (e.key.toLowerCase() === 'e') {
        Object.values(DISTRICTS).forEach(district => {
          const [bx, by, bz] = district.position;
          const dist = Math.hypot(playerPos[0] - bx, playerPos[2] - bz);
          if (dist < 14) {
            soundEngine.playClick();
            onEnterDistrict(district.id);
          }
        });
      }

      if (e.key === 'Escape') {
        onPause();
      }
    };

    const handleKeyUp = (e) => {
      keysPressed.current[e.key.toLowerCase()] = false;
      if (e.key === 'Shift') setIsSprinting(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [playerPos, onEnterDistrict, onPause]);

  // Movement loop tick (WASD)
  useEffect(() => {
    const interval = setInterval(() => {
      let dx = 0;
      let dz = 0;

      if (keysPressed.current['w']) dz -= 1;
      if (keysPressed.current['s']) dz += 1;
      if (keysPressed.current['a']) dx -= 1;
      if (keysPressed.current['d']) dx += 1;

      if (dx !== 0 || dz !== 0) {
        setIsMoving(true);
        const speed = isSprinting ? 0.65 : 0.38;
        const newRot = Math.atan2(dx, dz);

        setPlayerRot(newRot);

        setPlayerPos(prev => {
          const nextX = Math.max(-120, Math.min(120, prev[0] + Math.sin(newRot) * speed));
          const nextZ = Math.max(-120, Math.min(120, prev[2] + Math.cos(newRot) * speed));
          const newPos = [nextX, 0, nextZ];
          onPlayerMove(newPos);
          return newPos;
        });
      } else {
        setIsMoving(false);
      }
    }, 16); // ~60 FPS update loop

    return () => clearInterval(interval);
  }, [isSprinting, onPlayerMove]);

  return (
    <div className="game-container" style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', zindex: 1 }}>
      <Canvas className="webgl-canvas" shadows gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}>
        <CameraFollow playerPos={playerPos} playerRot={playerRot} />
        
        {/* Guaranteed Visible City & Test Objects */}
        <CityScene timeRemaining={timeRemaining} />

        {/* 3D Player Avatar */}
        <PlayerCharacter 
          position={playerPos} 
          rotation={playerRot} 
          isSprinting={isSprinting} 
          isMoving={isMoving} 
        />

        {/* 3D District Beacons */}
        <DistrictBeacons 
          districtStates={districtStates} 
          activeDistrictId={activeDistrictId} 
          playerPos={playerPos} 
          onEnterDistrict={onEnterDistrict} 
        />
      </Canvas>
    </div>
  );
}
