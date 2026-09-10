import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { DISTRICTS } from '../utils/gameData';

export function CityScene({ timeRemaining }) {
  // Rotating test cube ref
  const cubeRef = useRef();

  // Flying Skyway Traffic Cars
  const hoverCars = useRef([]);

  // Generate procedural city buildings around the districts
  const surroundingBuildings = useMemo(() => {
    const buildings = [];
    const count = 40;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (Math.sin(i * 3) * 0.15);
      const radius = 50 + (i % 3) * 20;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      const width = 12 + (i % 4) * 4;
      const height = 30 + (i % 5) * 12;
      const depth = 12 + (i % 3) * 4;

      const colors = ['#1e2942', '#283556', '#162035', '#1f2d4d', '#25375c'];
      const color = colors[i % colors.length];
      const neonColor = (i % 4 === 0) ? '#00f3ff' : (i % 4 === 1) ? '#ff007f' : (i % 4 === 2) ? '#ffaa00' : '#00ff88';

      buildings.push({ id: i, x, z, width, height, depth, color, neonColor });
    }
    return buildings;
  }, []);

  useFrame((state, delta) => {
    if (cubeRef.current) {
      cubeRef.current.rotation.y += delta * 1.0;
      cubeRef.current.rotation.x += delta * 0.5;
    }
    hoverCars.current.forEach((car, idx) => {
      if (car) {
        car.position.z += (20 + idx * 4) * delta;
        if (car.position.z > 130) car.position.z = -130;
      }
    });
  });

  return (
    <group>
      {/* Deep Sci-Fi Background Color */}
      <color attach="background" args={['#0b1329']} />

      {/* Distant Stars */}
      <Stars radius={120} depth={40} count={2000} factor={4} saturation={0.5} fade speed={1} />

      {/* Fog - Far enough to never obscure objects */}
      <fog attach="fog" args={['#0b1329', 50, 300]} />

      {/* BRIGHT LIGHTS */}
      <ambientLight intensity={1.5} color="#80a0ff" />
      <hemisphereLight skyColor="#00f3ff" groundColor="#ff007f" intensity={1.0} />
      <directionalLight position={[40, 80, 40]} intensity={2.5} color="#ffffff" castShadow />
      <directionalLight position={[-40, 50, -40]} intensity={1.5} color="#00f3ff" />

      {/* Guaranteed Visible Bright Test Cube at Center (0, 3, 0) */}
      <mesh ref={cubeRef} position={[0, 3, 0]} castShadow>
        <boxGeometry args={[4, 4, 4]} />
        <meshStandardMaterial color="#00f3ff" emissive="#00f3ff" emissiveIntensity={0.6} roughness={0.2} metalness={0.8} />
      </mesh>

      {/* Bright Large Ground Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[300, 300]} />
        <meshStandardMaterial color="#1a2647" roughness={0.4} metalness={0.6} />
      </mesh>

      {/* Grid Lines - Using valid hex strings only */}
      <gridHelper args={[300, 30, '#00f3ff', '#1e2d54']} position={[0, 0.01, 0]} />

      {/* Main East-West & North-South Highways */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <planeGeometry args={[300, 20]} />
        <meshStandardMaterial color="#0d162d" roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, Math.PI / 2]} position={[0, 0.02, 0]}>
        <planeGeometry args={[300, 20]} />
        <meshStandardMaterial color="#0d162d" roughness={0.3} metalness={0.7} />
      </mesh>

      {/* NEXUS Central HQ Tower */}
      <group position={[0, 0, -25]}>
        <mesh position={[0, 25, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[14, 18, 50, 12]} />
          <meshStandardMaterial color="#1e2d54" metalness={0.8} roughness={0.2} emissive="#00f3ff" emissiveIntensity={0.3} />
        </mesh>
        {/* Holographic Text using default system font (no external font fetch!) */}
        <Text
          position={[0, 54, 0]}
          fontSize={3.5}
          color="#00f3ff"
          anchorX="center"
          anchorY="middle"
        >
          NEXUS HQ - LAUNCH IN 60M
        </Text>
      </group>

      {/* District Landmark Buildings */}
      {Object.values(DISTRICTS).map((district) => {
        const [x, y, z] = district.position;
        const [w, h, d] = district.buildingSize;
        return (
          <group key={district.id} position={[x, 0, z]}>
            <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
              <boxGeometry args={[w, h, d]} />
              <meshStandardMaterial 
                color="#1b2a4a" 
                metalness={0.7} 
                roughness={0.3} 
                emissive={district.color}
                emissiveIntensity={0.3}
              />
            </mesh>
            <mesh position={[0, h + 1, 0]}>
              <boxGeometry args={[w + 1, 2, d + 1]} />
              <meshBasicMaterial color={district.color} />
            </mesh>
            <pointLight position={[0, h + 4, 0]} intensity={5} color={district.color} distance={40} />
          </group>
        );
      })}

      {/* Surrounding City Skyscrapers */}
      {surroundingBuildings.map((b) => (
        <group key={b.id} position={[b.x, 0, b.z]}>
          <mesh position={[0, b.height / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[b.width, b.height, b.depth]} />
            <meshStandardMaterial 
              color={b.color} 
              metalness={0.8} 
              roughness={0.2} 
              emissive={b.neonColor} 
              emissiveIntensity={0.2} 
            />
          </mesh>
          <mesh position={[0, b.height + 0.4, 0]}>
            <boxGeometry args={[b.width + 0.4, 0.8, b.depth + 0.4]} />
            <meshBasicMaterial color={b.neonColor} />
          </mesh>
        </group>
      ))}

      {/* Skyway Hover Traffic */}
      {[-40, -15, 15, 40].map((xPos, idx) => (
        <group 
          key={idx} 
          ref={(el) => (hoverCars.current[idx] = el)} 
          position={[xPos, 35 + idx * 5, -120 + idx * 30]}
        >
          <mesh>
            <boxGeometry args={[3, 1.2, 5]} />
            <meshStandardMaterial color="#0f172a" metalness={0.9} />
          </mesh>
          <mesh position={[0, 0, 2.6]}>
            <boxGeometry args={[2.5, 0.4, 0.2]} />
            <meshBasicMaterial color="#00f3ff" />
          </mesh>
          <mesh position={[0, 0, -2.6]}>
            <boxGeometry args={[2.5, 0.4, 0.2]} />
            <meshBasicMaterial color="#ff007f" />
          </mesh>
        </group>
      ))}
    </group>
  );
}
