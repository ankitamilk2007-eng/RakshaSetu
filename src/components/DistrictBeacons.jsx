import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { DISTRICTS } from '../utils/gameData';

export function DistrictBeacons({ districtStates, activeDistrictId, playerPos, onEnterDistrict }) {
  return (
    <group>
      {Object.values(DISTRICTS).map((district) => {
        const isCompleted = districtStates[district.id];
        return (
          <SingleBeacon 
            key={district.id} 
            district={district} 
            isCompleted={isCompleted} 
            playerPos={playerPos}
            onEnterDistrict={onEnterDistrict}
          />
        );
      })}
    </group>
  );
}

function SingleBeacon({ district, isCompleted, playerPos, onEnterDistrict }) {
  const diamondRef = useRef();
  const ringRef = useRef();

  const [bx, by, bz] = district.position;
  const beaconHeight = district.buildingSize[1] + 4;

  // Calculate distance to player
  const dist = Math.hypot(playerPos[0] - bx, playerPos[2] - bz);
  const isNear = dist < 14;

  useFrame((state, delta) => {
    if (diamondRef.current) {
      diamondRef.current.rotation.y += delta * 1.5;
      diamondRef.current.position.y = beaconHeight + Math.sin(state.clock.getElapsedTime() * 3) * 0.8;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.8;
    }
  });

  const beaconColor = isCompleted ? '#00ff88' : district.beaconColor;

  return (
    <group position={[bx, 0, bz]}>
      {/* Sky Beam Light Column */}
      <mesh position={[0, 40, 0]}>
        <cylinderGeometry args={[0.6, 1.8, 80, 16]} />
        <meshBasicMaterial color={beaconColor} transparent opacity={0.35} side={THREE.DoubleSide} />
      </mesh>

      {/* Point Light for District Aura */}
      <pointLight position={[0, 5, 0]} intensity={5} color={beaconColor} distance={35} />

      {/* Floating Holographic Diamond Beacon */}
      <mesh ref={diamondRef} position={[0, beaconHeight, 0]}>
        <octahedronGeometry args={[2.5]} />
        <meshBasicMaterial color={beaconColor} wireframe />
      </mesh>

      {/* Pulsating Ground Rings */}
      <mesh ref={ringRef} position={[0, 0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[4, 5.5, 32]} />
        <meshBasicMaterial color={beaconColor} transparent opacity={isNear ? 0.95 : 0.5} side={THREE.DoubleSide} />
      </mesh>

      {/* 3D World Label & Proximity Interaction Prompt */}
      <Html position={[0, 8, 0]} center distanceFactor={30}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '6px',
          fontFamily: 'var(--font-header)',
          pointerEvents: 'none'
        }}>
          <div style={{
            background: '#040a18',
            border: `2px solid ${beaconColor}`,
            color: beaconColor,
            padding: '8px 18px',
            borderRadius: '20px',
            boxShadow: `0 0 20px ${beaconColor}`,
            fontWeight: '800',
            fontSize: '0.95rem',
            whiteSpace: 'nowrap'
          }}>
            {isCompleted ? '✓ ' : ''}{district.name.toUpperCase()}
          </div>

          <div style={{
            fontSize: '0.75rem',
            color: '#e0f7fc',
            fontFamily: 'var(--font-mono)',
            background: 'rgba(0,0,0,0.8)',
            padding: '2px 8px',
            borderRadius: '4px'
          }}>
            {Math.round(dist)}m DISTANCE
          </div>

          {isNear && !isCompleted && (
            <div 
              style={{
                pointerEvents: 'auto',
                cursor: 'pointer',
                background: beaconColor,
                color: '#000',
                padding: '6px 16px',
                borderRadius: '20px',
                fontWeight: '900',
                fontSize: '0.9rem',
                boxShadow: `0 0 25px ${beaconColor}`,
                marginTop: '6px',
                animation: 'prompt-pulse 1s infinite alternate'
              }}
              onClick={() => onEnterDistrict(district.id)}
            >
              [ E ] ENTER DISTRICT
            </div>
          )}
        </div>
      </Html>
    </group>
  );
}
