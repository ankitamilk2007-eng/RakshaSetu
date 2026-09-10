import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function PlayerCharacter({ position, rotation, isSprinting, isMoving }) {
  const groupRef = useRef();
  const leftLegRef = useRef();
  const rightLegRef = useRef();
  const leftArmRef = useRef();
  const rightArmRef = useRef();

  // Procedural movement animation (walking / running limb swing)
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.set(...position);
      groupRef.current.rotation.y = rotation;

      if (isMoving) {
        const speedMultiplier = isSprinting ? 20 : 12;
        const angle = Math.sin(state.clock.getElapsedTime() * speedMultiplier) * 0.6;

        if (leftLegRef.current) leftLegRef.current.rotation.x = angle;
        if (rightLegRef.current) rightLegRef.current.rotation.x = -angle;
        if (leftArmRef.current) leftArmRef.current.rotation.x = -angle * 0.8;
        if (rightArmRef.current) rightArmRef.current.rotation.x = angle * 0.8;
      } else {
        // Idle breathing animation
        const idleAngle = Math.sin(state.clock.getElapsedTime() * 2) * 0.05;
        if (leftLegRef.current) leftLegRef.current.rotation.x = 0;
        if (rightLegRef.current) rightLegRef.current.rotation.x = 0;
        if (leftArmRef.current) leftArmRef.current.rotation.x = idleAngle;
        if (rightArmRef.current) rightArmRef.current.rotation.x = -idleAngle;
      }
    }
  });

  return (
    <group ref={groupRef}>
      {/* Player Ground Target Ring (Ensures player is instantly visible on map!) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <ringGeometry args={[1.2, 1.6, 32]} />
        <meshBasicMaterial color={isSprinting ? "#ff007f" : "#00f3ff"} side={THREE.DoubleSide} />
      </mesh>

      {/* Dynamic Player Spotlight (Headlight) */}
      <spotLight 
        position={[0, 2.5, 0.5]} 
        target-position={[0, 0, 10]}
        angle={0.6} 
        penumbra={0.4} 
        intensity={isSprinting ? 6 : 4} 
        color="#00f3ff" 
        distance={30}
        castShadow
      />

      {/* Player Point Light Aura */}
      <pointLight position={[0, 2, 0]} intensity={2.5} color={isSprinting ? "#ff007f" : "#00f3ff"} distance={10} />

      {/* Head & Glowing Visor */}
      <mesh position={[0, 2.4, 0]}>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial color="#1e293b" roughness={0.1} metalness={0.9} />
      </mesh>
      {/* Glowing Neon Visor */}
      <mesh position={[0, 2.45, 0.22]}>
        <boxGeometry args={[0.4, 0.15, 0.15]} />
        <meshBasicMaterial color={isSprinting ? "#ff007f" : "#00f3ff"} />
      </mesh>

      {/* Torso & Armor Chestplate */}
      <mesh position={[0, 1.4, 0]}>
        <boxGeometry args={[0.7, 1.0, 0.45]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Emissive Arc Reactor Core */}
      <mesh position={[0, 1.5, 0.24]}>
        <cylinderGeometry args={[0.14, 0.14, 0.06, 16]} rotation={[Math.PI / 2, 0, 0]} />
        <meshBasicMaterial color={isSprinting ? "#ff0055" : "#00ff88"} />
      </mesh>

      {/* Shoulder Pads */}
      <mesh position={[-0.45, 1.7, 0]}>
        <boxGeometry args={[0.25, 0.25, 0.4]} />
        <meshStandardMaterial color="#0f172a" metalness={0.9} />
      </mesh>
      <mesh position={[0.45, 1.7, 0]}>
        <boxGeometry args={[0.25, 0.25, 0.4]} />
        <meshStandardMaterial color="#0f172a" metalness={0.9} />
      </mesh>

      {/* Left Arm */}
      <group ref={leftArmRef} position={[-0.45, 1.6, 0]}>
        <mesh position={[0, -0.4, 0]}>
          <boxGeometry args={[0.2, 0.75, 0.22]} />
          <meshStandardMaterial color="#475569" metalness={0.7} />
        </mesh>
      </group>

      {/* Right Arm */}
      <group ref={rightArmRef} position={[0.45, 1.6, 0]}>
        <mesh position={[0, -0.4, 0]}>
          <boxGeometry args={[0.2, 0.75, 0.22]} />
          <meshStandardMaterial color="#475569" metalness={0.7} />
        </mesh>
      </group>

      {/* Left Leg */}
      <group ref={leftLegRef} position={[-0.22, 0.85, 0]}>
        <mesh position={[0, -0.4, 0]}>
          <boxGeometry args={[0.24, 0.85, 0.26]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} />
        </mesh>
      </group>

      {/* Right Leg */}
      <group ref={rightLegRef} position={[0.22, 0.85, 0]}>
        <mesh position={[0, -0.4, 0]}>
          <boxGeometry args={[0.24, 0.85, 0.26]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} />
        </mesh>
      </group>

      {/* Thruster Trail Effect when Sprinting */}
      {isSprinting && (
        <mesh position={[0, 1.3, -0.4]}>
          <coneGeometry args={[0.3, 1.2, 8]} rotation={[-Math.PI / 2, 0, 0]} />
          <meshBasicMaterial color="#ff007f" transparent opacity={0.85} />
        </mesh>
      )}
    </group>
  );
}
