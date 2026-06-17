
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import { BuildingType } from '../types';

// --- Geometry Reuse ---
// Reusing global geometry instances significantly reduces draw calls and memory overhead.
const GEOMETRY = {
  box: new THREE.BoxGeometry(1, 1, 1),
  cone: new THREE.ConeGeometry(0.5, 1, 4),
  cylinder: new THREE.CylinderGeometry(0.4, 0.4, 1, 12),
  octa: new THREE.OctahedronGeometry(0.5),
  sphere: new THREE.SphereGeometry(0.5, 16, 16),
  torus: new THREE.TorusGeometry(0.3, 0.05, 12, 24)
};

const ROOF_COLOR = "#991b1b";

// --- Types ---
export interface BuildingPart {
  geometry?: keyof typeof GEOMETRY | [string, any[]];
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number] | number;
  color?: string;
  useConfigColor?: boolean;
  emissive?: string;
  emissiveIntensity?: number;
  opacity?: number;
  metalness?: number;
  transparent?: boolean;
  component?: React.ComponentType<any>;
  componentProps?: any;
  children?: BuildingPart[];
}

// --- Visual Effects Components ---

export const ForestWisps: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const count = 8;
  const particles = useMemo(() => 
    Array.from({ length: count }).map((_, i) => ({
      orbitRadius: 0.3 + Math.random() * 0.5,
      orbitSpeed: 0.5 + Math.random() * 1.0,
      yOffset: Math.random() * 0.8,
      phase: Math.random() * Math.PI * 2,
      color: ['#4ade80', '#22d3ee', '#f472b6', '#fbbf24'][i % 4]
    })), [count]);

  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    groupRef.current.children.forEach((child, i) => {
      if (i >= count || !child) return;
      const p = particles[i];
      const t = time * p.orbitSpeed + p.phase;
      
      child.position.x = Math.cos(t) * p.orbitRadius;
      child.position.z = Math.sin(t) * p.orbitRadius;
      child.position.y = p.yOffset + Math.sin(t * 1.5) * 0.15;
      
      if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
        child.material.opacity = (Math.sin(t * 2) * 0.3 + 0.7);
        child.scale.setScalar(0.04 + Math.sin(t * 3) * 0.01);
      }
    });
  });

  return (
    <group ref={groupRef} position={[0, 0.1, 0]}>
      {particles.map((p, i) => (
        <mesh key={i} geometry={GEOMETRY.sphere}>
          <meshStandardMaterial color={p.color} emissive={p.color} emissiveIntensity={2} transparent />
        </mesh>
      ))}
      {children}
    </group>
  );
};

export const SmokeEmitter: React.FC<{ position?: [number, number, number], children?: React.ReactNode }> = ({ position, children }) => {
  const count = 10;
  const particles = useMemo(() => 
    Array.from({ length: count }).map((_, i) => ({
      offset: Math.random() * Math.PI * 2,
      speed: 0.3 + Math.random() * 0.2,
      startTime: i * (1.0 / count)
    })), [count]);

  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    groupRef.current.children.forEach((child, i) => {
      if (i >= count || !child) return;
      const p = particles[i];
      const cycle = (p.startTime + time * 0.5) % 1.0;
      
      child.position.y = cycle * 2.0;
      child.position.x = Math.sin(time * 2 + p.offset) * 0.1 * cycle;
      child.position.z = Math.cos(time * 1.5 + p.offset) * 0.1 * cycle;
      
      const scale = 0.1 + cycle * 0.3;
      child.scale.setScalar(scale);
      
      if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
        child.material.opacity = Math.max(0, (1.0 - cycle) * 0.5);
      }
    });
  });

  return (
    <group position={position} ref={groupRef}>
      {particles.map((_, i) => (
        <mesh key={i} geometry={GEOMETRY.sphere}>
          <meshStandardMaterial color="#cbd5e1" transparent opacity={0.5} depthWrite={false} />
        </mesh>
      ))}
      {children}
    </group>
  );
};

export const WindmillSails = () => {
  const sailsRef = useRef<THREE.Group>(null);
  useFrame((state, delta) => {
    if (sailsRef.current) sailsRef.current.rotation.z += delta * 2;
  });

  return (
    <group ref={sailsRef}>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} rotation={[0, 0, (i * Math.PI) / 2]} position={[0, 0, 0.1]}>
          <boxGeometry args={[0.08, 0.8, 0.02]} />
          <meshStandardMaterial color="#fef3c7" />
          <mesh position={[0.1, 0, 0]}>
            <boxGeometry args={[0.2, 0.7, 0.01]} />
            <meshStandardMaterial color="#fffbeb" transparent opacity={0.8} />
          </mesh>
        </mesh>
      ))}
    </group>
  );
};

export const Flag = ({ color = "#ef4444", position = [0, 0, 0] }: { color?: string, position?: [number, number, number] }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (meshRef.current) {
        meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 3) * 0.2;
    }
  });
  
  return (
    <group position={position as [number, number, number]}>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 1, 4]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
      <mesh ref={meshRef} position={[0.2, 0.8, 0]}>
        <boxGeometry args={[0.4, 0.25, 0.02]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
};

export const FloatingCrystal = ({ color = "#d946ef", position = [0, 1.5, 0] }: { color?: string, position?: [number, number, number] }) => (
  <Float speed={3} floatIntensity={0.5} rotationIntensity={0.5}>
    <mesh position={position as [number, number, number]} geometry={GEOMETRY.octa} scale={0.4}>
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} transparent opacity={0.9} />
    </mesh>
  </Float>
);

export const MagicGlow: React.FC<{ children?: React.ReactNode, color?: string, intensity?: number }> = ({ children, color = "#22d3ee", intensity = 2 }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (meshRef.current && meshRef.current.material instanceof THREE.MeshStandardMaterial) {
      meshRef.current.material.emissiveIntensity = (Math.sin(state.clock.elapsedTime * 2) * 0.5 + 0.5) * intensity;
    }
  });
  
  return (
    <group>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === 'mesh') {
          return React.cloneElement(child as React.ReactElement<any>, { ref: meshRef });
        }
        return child;
      })}
    </group>
  );
};

export const EtherealDust: React.FC<{ children?: React.ReactNode, color?: string }> = ({ children, color = "#fbbf24" }) => {
  const count = 15;
  const particles = useMemo(() => 
    Array.from({ length: count }).map((_, i) => ({
      pos: [(Math.random() - 0.5) * 1.5, Math.random() * 2.0, (Math.random() - 0.5) * 1.5] as [number, number, number],
      speed: 0.2 + Math.random() * 0.3,
      phase: Math.random() * Math.PI * 2
    })), [count]);

  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    groupRef.current.children.forEach((child, i) => {
      if (i >= count || !child) return;
      const p = particles[i];
      child.position.y = ((p.pos[1] + time * p.speed) % 2.0);
      child.position.x = p.pos[0] + Math.sin(time + p.phase) * 0.1;
      child.position.z = p.pos[2] + Math.cos(time * 0.8 + p.phase) * 0.1;
      
      if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
        const life = child.position.y / 2.0;
        child.material.opacity = Math.sin(life * Math.PI) * 0.6;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {particles.map((p, i) => (
        <mesh key={i} geometry={GEOMETRY.sphere} scale={0.015}>
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={3} transparent />
        </mesh>
      ))}
      {children}
    </group>
  );
};

export const SteamVent: React.FC<{ position?: [number, number, number], children?: React.ReactNode }> = ({ position, children }) => {
  const count = 5;
  const particles = useMemo(() => 
    Array.from({ length: count }).map((_, i) => ({
      offset: i * (2.0 / count),
      drift: (Math.random() - 0.5) * 0.2
    })), [count]);

  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    groupRef.current.children.forEach((child, i) => {
      if (i >= count || !child) return;
      const p = particles[i];
      const cycle = (time * 0.8 + p.offset) % 2.0;
      
      child.position.y = cycle * 1.2;
      child.position.x = Math.sin(cycle * 3) * 0.1 + cycle * p.drift;
      
      const scale = 0.05 + cycle * 0.2;
      child.scale.setScalar(scale);
      
      if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
        child.material.opacity = Math.max(0, (1.0 - (cycle / 2.0)) * 0.4);
      }
    });
  });

  return (
    <group position={position} ref={groupRef}>
      {particles.map((_, i) => (
        <mesh key={i} geometry={GEOMETRY.sphere}>
          <meshStandardMaterial color="#ffffff" transparent opacity={0.3} depthWrite={false} />
        </mesh>
      ))}
      {children}
    </group>
  );
};

export const getBuildingSchema = (type: string, variantSeed?: number): BuildingPart[] | null => {
  const schema = BUILDING_SCHEMAS[type];
  if (!schema) return null;

  if (Array.isArray(schema[0])) {
    const variants = schema as BuildingPart[][];
    const index = variantSeed !== undefined ? variantSeed : Math.floor(Math.random() * variants.length);
    return variants[index % variants.length];
  }

  return schema as BuildingPart[];
};

export const BUILDING_SCHEMAS: Record<string, BuildingPart[] | BuildingPart[][]> = {
  [BuildingType.Residential]: [
    // 1. Classic Cottage
    [
      { geometry: ['boxGeometry', [1, 1, 1]] as [string, any[]], scale: [0.85, 0.7, 0.85], position: [0, 0.15, 0], useConfigColor: true },
      { geometry: ['coneGeometry', [0.7, 0.6, 4]] as [string, any[]], position: [0, 0.6, 0], rotation: [0, Math.PI / 4, 0], color: ROOF_COLOR },
      { geometry: 'box' as const, scale: [0.1, 0.4, 0.1], position: [0.2, 0.6, 0.2], color: "#7f1d1d" }, // Chimney
      { component: SmokeEmitter, position: [0.2, 0.9, 0.2] }
    ],
    // 2. Twin Peaks Cottage
    [
      { geometry: 'box' as const, scale: [0.4, 0.6, 0.7], position: [-0.2, 0.1, 0], useConfigColor: true },
      { geometry: 'box' as const, scale: [0.4, 0.6, 0.7], position: [0.2, 0.1, 0], useConfigColor: true },
      { geometry: ['coneGeometry', [0.4, 0.4, 4]] as [string, any[]], position: [-0.2, 0.5, 0], rotation: [0, Math.PI / 4, 0], color: ROOF_COLOR },
      { geometry: ['coneGeometry', [0.4, 0.4, 4]] as [string, any[]], position: [0.2, 0.5, 0], rotation: [0, Math.PI / 4, 0], color: ROOF_COLOR }
    ],
    // 3. Tall House
    [
      { geometry: 'box' as const, scale: [0.6, 1.0, 0.6], position: [0, 0.3, 0], useConfigColor: true },
      { geometry: ['coneGeometry', [0.6, 0.8, 4]] as [string, any[]], position: [0, 1.0, 0], rotation: [0, Math.PI / 4, 0], color: ROOF_COLOR },
      { geometry: 'box' as const, scale: [0.15, 0.5, 0.15], position: [0.2, 0.8, 0.2], color: "#451a03" }
    ],
    // 4. Round Hut
    [
      { geometry: ['cylinderGeometry', [0.4, 0.4, 1, 12]] as [string, any[]], scale: [0.8, 0.7, 0.8], position: [0, 0.15, 0], useConfigColor: true },
      { geometry: ['coneGeometry', [0.9, 0.7, 16]] as [string, any[]], position: [0, 0.6, 0], color: "#422006" }
    ],
    // 5. Estate with Side Building
    [
      { geometry: 'box' as const, scale: [0.8, 0.6, 0.4], position: [0, 0.1, -0.1], useConfigColor: true },
      { geometry: 'box' as const, scale: [0.4, 0.6, 0.6], position: [-0.2, 0.1, 0.2], useConfigColor: true },
      { geometry: ['coneGeometry', [0.6, 0.4, 4]] as [string, any[]], position: [0, 0.5, -0.1], rotation: [0, Math.PI / 4, 0], color: ROOF_COLOR },
      { geometry: ['coneGeometry', [0.4, 0.4, 4]] as [string, any[]], position: [-0.2, 0.5, 0.2], rotation: [0, Math.PI / 4, 0], color: ROOF_COLOR },
      { geometry: 'box' as const, scale: [0.2, 0.4, 0.2], position: [0.3, 0.2, 0.2], color: "#78350f" } // Shed
    ]
  ],
  [BuildingType.Commercial]: [
    // 1. Standard Tavern
    [
      { geometry: 'box' as const, scale: [1.2, 0.7, 0.9], position: [0, 0.15, 0], useConfigColor: true },
      { geometry: 'box' as const, scale: [1.3, 0.1, 1.0], position: [0, 0.5, 0], color: "#573010" },
      { geometry: 'box' as const, scale: [1.1, 0.6, 0.8], position: [0, 0.8, 0], useConfigColor: true },
      { geometry: ['coneGeometry', [0.9, 0.6, 4]] as [string, any[]], position: [0, 1.1, 0], rotation: [0, Math.PI/4, 0], color: "#451a03" },
      { geometry: 'box' as const, scale: [0.2, 0.6, 0.2], position: [0.4, 1.0, 0.2], color: "#78350f" },
    ],
    // 2. Round Inn
    [
      { geometry: ['cylinderGeometry', [0.6, 0.6, 0.8, 8]] as [string, any[]], position: [0, 0.4, 0], useConfigColor: true },
      { geometry: ['coneGeometry', [0.7, 0.5, 8]] as [string, any[]], position: [0, 1.0, 0], color: "#573010" },
      { geometry: 'box' as const, scale: [0.4, 0.1, 0.3], position: [0, 0.2, 0.6], color: "#451a03" }, // Sign board
    ],
    // 3. Market Hall (Open sides)
    [
      { geometry: 'box' as const, scale: [0.6, 0.7, 0.6], position: [-0.2, 0.35, -0.2], useConfigColor: true },
      { geometry: ['coneGeometry', [0.5, 0.5, 4]] as [string, any[]], position: [-0.2, 0.8, -0.2], rotation: [0, Math.PI/4, 0], color: "#573010" },
      { geometry: 'box' as const, scale: [1.2, 0.05, 1.2], position: [0, 0.02, 0], color: "#78350f" },
      ...[ [0.3, 0.3], [0.3, -0.3], [-0.3, 0.3] ].map(p => ({
        geometry: 'cylinder' as const, scale: [0.1, 0.4, 0.1] as [number, number, number], position: [p[0], 0.2, p[1]] as [number, number, number], color: "#92400e"
      } as BuildingPart))
    ],
    // 4. Corner Shop
    [
      { geometry: 'box' as const, scale: [0.9, 0.8, 0.9], position: [0, 0.4, 0], useConfigColor: true },
      { geometry: ['coneGeometry', [0.8, 0.6, 4]] as [string, any[]], position: [0, 1.0, 0], rotation: [0, Math.PI/4, 0], color: "#3f1d06" },
      { geometry: 'box' as const, scale: [0.4, 0.4, 0.1], position: [0, 0.6, 0.46], color: "#fbbf24", emissive: "#fbbf24", emissiveIntensity: 0.5 } // Lighted window
    ],
    // 5. Trading Post
    [
      { geometry: 'box' as const, scale: [1.2, 0.5, 0.8], position: [0, 0.25, 0], useConfigColor: true },
      { geometry: 'box' as const, scale: [0.3, 0.3, 0.3], position: [-0.3, 0.2, 0.5], color: "#78350f" }, // Crate
      { geometry: 'box' as const, scale: [0.3, 0.3, 0.3], position: [0.3, 0.2, 0.5], color: "#92400e" }, // Crate
      { geometry: ['coneGeometry', [0.8, 0.4, 4]] as [string, any[]], position: [0, 0.6, 0], rotation: [0, Math.PI/4, 0], color: "#573010" }
    ]
  ],
  [BuildingType.Industrial]: [
    // 1. Factory with thin stack
    [
      { geometry: 'box' as const, scale: [1.2, 0.2, 1.2], position: [0, 0.1, 0], color: "#334155" },
      { geometry: 'box' as const, scale: [0.6, 0.6, 0.6], position: [-0.2, 0.4, -0.2], useConfigColor: true },
      { geometry: 'box' as const, scale: [0.1, 0.8, 0.1], position: [0.3, 0.5, 0.3], color: "#94a3b8" },
      { component: SteamVent, position: [0.3, 1.0, 0.3] },
      { geometry: 'box' as const, scale: [0.6, 0.05, 0.05], position: [0.1, 0.9, 0.3], rotation: [0, 0, -0.2], color: "#94a3b8" },
    ],
    // 2. Crystal Processing Plant
    [
      { geometry: 'box' as const, scale: [1.1, 0.3, 1.1], position: [0, 0.15, 0], color: "#475569" },
      ...[ [-0.2, 0.3, 0.2], [0.3, 0.2, -0.3], [0, 0.4, 0] ].map((p, i) => ({
        geometry: 'octa' as const, scale: 0.3 - (i*0.05), position: p as [number, number, number], color: "#22d3ee", emissive: "#22d3ee", emissiveIntensity: 1.5
      } as BuildingPart)),
      { geometry: 'box' as const, scale: [0.4, 0.4, 0.4], position: [-0.3, 0.3, -0.3], useConfigColor: true }
    ],
    // 3. Smelter with Smoke
    [
      { geometry: 'box' as const, scale: [1, 0.6, 0.8], position: [0, 0.3, 0], useConfigColor: true },
      { geometry: ['cylinderGeometry', [0.2, 0.3, 1, 8]] as [string, any[]], position: [0.3, 0.6, 0.2], color: "#1e293b" },
      { component: SmokeEmitter, position: [0.3, 1.1, 0.2] },
      { geometry: 'sphere' as const, scale: 0.2, position: [-0.3, 0.2, 0.4], color: "#ea580c", emissive: "#c2410c", emissiveIntensity: 2 } // Molten core
    ],
    // 4. Heavy Machinery
    [
      { geometry: 'torus' as const, scale: [1.2, 0.3, 0.5], position: [0, 0.1, 0], rotation: [Math.PI/2, 0, 0], color: "#334155" },
      { geometry: 'box' as const, scale: [0.1, 0.8, 0.1], position: [0, 0.4, 0], color: "#94a3b8" },
      { geometry: 'box' as const, scale: [0.5, 0.1, 0.1], position: [0, 0.8, 0], color: "#94a3b8" },
      { geometry: 'box' as const, scale: [0.3, 0.3, 0.3], position: [0.4, 0.2, 0], useConfigColor: true }
    ],
    // 5. Open Pit Mine
    [
      { geometry: 'box' as const, scale: [1.2, 0.1, 1.2], position: [0, 0.05, 0], color: "#475569" },
      { geometry: 'box' as const, scale: [0.8, 0.1, 0.8], position: [0, 0.06, 0], color: "#0f172a" }, // The Pit
      { geometry: 'box' as const, scale: [0.1, 0.8, 0.1], position: [-0.4, 0.4, 0], color: "#94a3b8" }, // Crane Post
      { geometry: 'box' as const, scale: [0.6, 0.05, 0.05], position: [-0.1, 0.8, 0], color: "#cbd5e1" }, // Crane Arm
      { geometry: 'box' as const, scale: [0.2, 0.15, 0.1], position: [0.2, 0.5, 0], color: "#78350f" }, // Hanging crate
    ]
  ],
  [BuildingType.Park]: [
    // 1. Wisps Grove
    [
      { component: ForestWisps },
      { component: EtherealDust },
      ...[[-0.2, 0.2], [0.3, -0.1], [-0.2, -0.3]].map(p => ({
        position: [p[0], 0, p[1]] as [number, number, number],
        children: [
          { geometry: ['cylinderGeometry', [0.05, 0.08, 0.3, 6]] as [string, any[]], position: [0, 0.1, 0], color: "#3f2305" },
          { geometry: ['coneGeometry', [0.25, 0.5, 5]] as [string, any[]], position: [0, 0.4, 0], color: "#166534" }
        ] as BuildingPart[]
      } as BuildingPart))
    ],
    // 2. Pond
    [
      { geometry: ['cylinderGeometry', [0.5, 0.5, 0.1, 16]] as [string, any[]], position: [0, 0.05, 0], color: "#22d3ee", emissive: "#0891b2", emissiveIntensity: 0.5 },
      ...[0, 1, 2, 3].map(i => ({
        geometry: 'sphere' as const, scale: 0.1, position: [Math.cos(i*1.5)*0.55, 0.1, Math.sin(i*1.5)*0.55] as [number, number, number], color: "#57534e"
      } as BuildingPart)),
      { geometry: ['coneGeometry', [0.2, 0.4, 4]] as [string, any[]], position: [-0.3, 0.2, -0.3], color: "#166534" },
      { component: ForestWisps }
    ],
    // 3. Flower Garden
    [
      { geometry: 'box' as const, scale: [1, 0.05, 1], position: [0, 0.02, 0], color: "#14532d" },
      { component: EtherealDust, componentProps: { color: "#f472b6" } },
      ...Array.from({length: 8}).map((_, i) => ({
        geometry: 'sphere' as const, scale: 0.08, position: [(Math.random()-0.5)*0.8, 0.1, (Math.random()-0.5)*0.8] as [number, number, number], 
        color: ['#f472b6', '#d946ef', '#fbbf24'][i%3], emissiveIntensity: 0.5
      } as BuildingPart)),
      { component: ForestWisps }
    ],
    // 4. Ancient Tree
    [
      { geometry: ['cylinderGeometry', [0.2, 0.3, 0.6, 8]] as [string, any[]], position: [0, 0.3, 0], color: "#3f2305" },
      { geometry: 'sphere' as const, scale: 0.5, position: [0, 0.8, 0], color: "#15803d" },
      { geometry: 'sphere' as const, scale: 0.3, position: [0.3, 0.6, 0.2], color: "#166534" },
      { geometry: 'sphere' as const, scale: 0.3, position: [-0.2, 0.7, -0.2], color: "#166534" },
      { component: ForestWisps }
    ],
    // 5. Standing Stones
    [
      { geometry: 'box' as const, scale: [1, 0.05, 1], position: [0, 0.02, 0], color: "#3f6212" },
      ...[0, 1, 2].map(i => ({
        geometry: 'box' as const, scale: [0.15, 0.6, 0.15], position: [Math.cos(i*2)*0.3, 0.3, Math.sin(i*2)*0.3], rotation: [0, Math.random(), 0], color: "#78716c"
      } as BuildingPart)),
      { component: ForestWisps }
    ]
  ],
  [BuildingType.Windmill]: [
    // 1. Classic Wood
    [
      { geometry: ['cylinderGeometry', [0.4, 0.5, 0.8, 8]] as [string, any[]], position: [0, 0.4, 0], color: "#78350f" },
      { geometry: ['coneGeometry', [0.55, 0.4, 8]] as [string, any[]], position: [0, 0.9, 0], color: "#b45309" },
      { component: WindmillSails, position: [0, 0.7, 0.4] }
    ],
    // 2. Stone Base
    [
      { geometry: ['cylinderGeometry', [0.35, 0.45, 1.0, 8]] as [string, any[]], position: [0, 0.5, 0], color: "#57534e" },
      { geometry: ['coneGeometry', [0.5, 0.3, 8]] as [string, any[]], position: [0, 1.15, 0], color: "#451a03" },
      { component: WindmillSails, position: [0, 0.9, 0.4] }
    ],
    // 3. Farmhouse Mill
    [
      { geometry: 'box' as const, scale: [0.2, 0.4, 0.2], position: [0, 0.2, 0], color: "#451a03" },
      { geometry: 'box' as const, scale: [0.5, 0.6, 0.5], position: [0, 0.6, 0], color: "#fef3c7" },
      { geometry: ['coneGeometry', [0.4, 0.4, 4]] as [string, any[]], position: [0, 1.0, 0], rotation: [0, Math.PI/4, 0], color: "#78350f" },
      { component: WindmillSails, position: [0, 0.7, 0.3] }
    ],
    // 4. Tall Spire Mill
    [
      { geometry: ['cylinderGeometry', [0.2, 0.3, 1.2, 8]] as [string, any[]], position: [0, 0.6, 0], color: "#fff7ed" },
      { geometry: ['coneGeometry', [0.3, 0.4, 8]] as [string, any[]], position: [0, 1.3, 0], color: "#431407" },
      { component: WindmillSails, position: [0, 1.0, 0.25] }
    ]
  ],
  [BuildingType.MagicAcademy]: [
    // 1. Floating Crystal Top
    [
      { geometry: 'cylinder' as const, scale: [0.7, 1.2, 0.7], position: [0, 0.2, 0], color: "#4c1d95" },
      { 
        component: Float, 
        componentProps: { speed: 3, floatIntensity: 1 }, 
        children: [
          { 
            component: MagicGlow,
            componentProps: { color: "#22d3ee", intensity: 3 },
            children: [
              { geometry: 'octa' as const, scale: 0.6, position: [0, 1.5, 0], color: "#22d3ee", emissive: "#22d3ee", emissiveIntensity: 3 }
            ]
          }
        ]
      }
    ],
    // 2. Twin Towers
    [
      { geometry: 'box' as const, scale: [0.8, 0.4, 0.6], position: [0, 0.2, 0], color: "#312e81" },
      { geometry: ['cylinderGeometry', [0.15, 0.2, 1.2, 6]] as [string, any[]], position: [-0.25, 0.6, 0], color: "#4c1d95" },
      { geometry: ['cylinderGeometry', [0.15, 0.2, 1.2, 6]] as [string, any[]], position: [0.25, 0.6, 0], color: "#4c1d95" },
      { geometry: ['coneGeometry', [0.25, 0.4, 6]] as [string, any[]], position: [-0.25, 1.3, 0], color: "#d946ef" },
      { geometry: ['coneGeometry', [0.25, 0.4, 6]] as [string, any[]], position: [0.25, 1.3, 0], color: "#d946ef" },
    ],
    // 3. Orerry Style
    [
      { geometry: 'cylinder' as const, scale: [0.6, 0.6, 0.6], position: [0, 0.3, 0], color: "#1e1b4b" },
      { 
        component: Float, 
        componentProps: { speed: 1, floatIntensity: 0.2 },
        children: [
          { geometry: 'torus' as const, scale: 0.5, position: [0, 0.8, 0], rotation: [Math.PI/3, 0, 0], color: "#fbbf24", metalness: 1 },
          { geometry: 'sphere' as const, scale: 0.15, position: [0, 0.8, 0], color: "#22d3ee", emissive: "#22d3ee", emissiveIntensity: 2 }
        ]
      }
    ],
    // 4. Library Spire
    [
      { geometry: 'box' as const, scale: [0.6, 1.0, 0.6], position: [0, 0.5, 0], color: "#312e81" },
      { geometry: 'box' as const, scale: [0.7, 0.1, 0.7], position: [0, 1.0, 0], color: "#22d3ee" },
      { component: FloatingCrystal, position: [0, 1.4, 0], componentProps: { color: "#d946ef" } }
    ]
  ],
  [BuildingType.PowerPlant]: [ // Wizard Tower
    // 1. Classic Spire with Smoke
    [
      { geometry: 'cylinder' as const, scale: [0.5, 1.8, 0.5], position: [0, 0.4, 0], color: "#7c3aed" },
      { geometry: ['cylinderGeometry', [0.1, 0.1, 0.8, 8]] as [string, any[]], position: [0.2, 0.8, 0.2], color: "#1e1b4b" },
      { component: SmokeEmitter, position: [0.2, 1.3, 0.2] },
      { 
        component: Float, 
        componentProps: { speed: 5, floatIntensity: 1.5 },
        children: [
          {
            component: MagicGlow,
            componentProps: { color: "#d946ef", intensity: 4 },
            children: [
              { geometry: 'sphere' as const, scale: 0.15, position: [0, 2.2, 0], color: "#d946ef", emissive: "#d946ef", emissiveIntensity: 4 }
            ]
          }
        ]
      }
    ],
    // 2. Crystal Base
    [
      { geometry: 'box' as const, scale: [1, 0.2, 1], position: [0, 0.1, 0], color: "#2e1065" },
      { geometry: 'octa' as const, scale: [0.3, 1.2, 0.3], position: [-0.3, 0.7, -0.3], color: "#d946ef", emissive: "#d946ef", emissiveIntensity: 1 },
      { geometry: 'octa' as const, scale: [0.3, 1.2, 0.3], position: [0.3, 0.7, 0.3], color: "#d946ef", emissive: "#d946ef", emissiveIntensity: 1 },
      { component: ForestWisps }
    ],
    // 3. Floating Obelisk
    [
      { geometry: 'cone' as const, scale: [0.8, 0.5, 4], position: [0, 0.25, 0], rotation: [0, 0, Math.PI], color: "#1e1b4b" },
      { 
        component: Float, 
        componentProps: { speed: 2, floatIntensity: 0.5 }, 
        children: [
          { geometry: 'octa' as const, scale: 0.7, position: [0, 1.2, 0], color: "#d946ef", emissive: "#d946ef", emissiveIntensity: 2, transparent: true, opacity: 0.8 }
        ]
      }
    ],
    // 4. Arcane Ring
    [
      { geometry: 'cylinder' as const, scale: [0.8, 0.2, 0.8], position: [0, 0.1, 0], color: "#4c1d95" },
      { geometry: 'torus' as const, scale: 0.6, position: [0, 0.8, 0], rotation: [Math.PI/2, 0, 0], color: "#d946ef", emissive: "#d946ef", emissiveIntensity: 2 },
      { geometry: 'sphere' as const, scale: 0.2, position: [0, 0.8, 0], color: "#ffffff", emissive: "#ffffff", emissiveIntensity: 4 }
    ]
  ],
  [BuildingType.Landmark]: [
    // 1. Fortress
    [
      { 
        position: [0, 0, 0], scale: 1.4, children: [
          { geometry: 'box' as const, scale: [1.4, 0.8, 1.4], position: [0, 0.2, 0], useConfigColor: true },
          { geometry: 'cone' as const, scale: [1, 0.8, 1], position: [0, 1, 0], rotation: [0, Math.PI/4, 0], color: "#991b1b" },
          { geometry: 'cylinder' as const, scale: [0.2, 1.2, 0.2], position: [0.5, 0.8, 0.5], color: "#b91c1c" },
          { geometry: 'cone' as const, scale: [0.3, 0.4, 8], position: [0.5, 1.5, 0.5], color: "#7f1d1d" },
          { component: Flag, position: [0.5, 1.7, 0.5], componentProps: { color: "#fbbf24" } }
        ] as BuildingPart[]
      } as BuildingPart
    ],
    // 2. Palace
    [
      { geometry: 'box' as const, scale: [1.2, 0.6, 1.2], position: [0, 0.3, 0], useConfigColor: true },
      { geometry: ['cylinderGeometry', [0.2, 0.25, 1.2, 8]] as [string, any[]], position: [-0.5, 0.6, -0.5], color: "#78350f" },
      { geometry: ['cylinderGeometry', [0.2, 0.25, 1.2, 8]] as [string, any[]], position: [0.5, 0.6, -0.5], color: "#78350f" },
      { geometry: ['cylinderGeometry', [0.2, 0.25, 1.2, 8]] as [string, any[]], position: [-0.5, 0.6, 0.5], color: "#78350f" },
      { geometry: ['cylinderGeometry', [0.2, 0.25, 1.2, 8]] as [string, any[]], position: [0.5, 0.6, 0.5], color: "#78350f" },
      { geometry: ['coneGeometry', [0.6, 0.8, 4]] as [string, any[]], position: [0, 0.8, 0], rotation: [0, Math.PI/4, 0], color: "#991b1b" },
      { component: Flag, position: [0, 1.2, 0], componentProps: { color: "#fbbf24" } }
    ],
    // 3. Golden Spire
    [
       { 
        component: Float, 
        componentProps: { speed: 1, floatIntensity: 0.2 }, 
        children: [
          { geometry: 'octa' as const, scale: 0.6, position: [0, 0.6, 0], color: "#fbbf24" },
          { geometry: 'box' as const, scale: [1.2, 0.2, 1.2], position: [0, 0.6, 0], color: "#fbbf24" },
          { geometry: 'cone' as const, scale: [0.5, 1, 8], position: [0, 1.2, 0], color: "#92400e" },
          { component: Flag, position: [0, 1.7, 0], componentProps: { color: "#991b1b" } }
        ]
       }
    ],
    // 4. Grand Hall
    [
      { geometry: 'box' as const, scale: [1.2, 0.8, 0.6], position: [0, 0.4, 0], useConfigColor: true },
      { geometry: ['cylinderGeometry', [0.7, 0.4, 0.7, 12]] as [string, any[]], position: [0, 1.0, 0], rotation: [0, 0, Math.PI/2], color: "#7f1d1d" }, // Vaulted roof
      { geometry: 'box' as const, scale: [0.2, 0.8, 0.2], position: [-0.6, 0.4, 0.3], color: "#b91c1c" }, // Flying buttress style
      { geometry: 'box' as const, scale: [0.2, 0.8, 0.2], position: [0.6, 0.4, 0.3], color: "#b91c1c" },
      { component: Flag, position: [0, 1.35, 0], componentProps: { color: "#fbbf24" } }
    ]
  ],
  [BuildingType.WaterTower]: [
    // 1. Classic Stone Well
    [
      { geometry: ['cylinderGeometry', [0.4, 0.4, 0.3, 12]] as [string, any[]], position: [0, 0.15, 0], color: "#64748b" },
      { geometry: ['cylinderGeometry', [0.3, 0.3, 0.2, 12]] as [string, any[]], position: [0, 0.25, 0], color: "#22d3ee", emissive: "#0891b2", emissiveIntensity: 0.5 },
      { geometry: 'box' as const, scale: [0.1, 0.6, 0.1], position: [-0.4, 0.3, 0], color: "#78350f" },
      { geometry: 'box' as const, scale: [0.1, 0.6, 0.1], position: [0.4, 0.3, 0], color: "#78350f" },
      { geometry: 'box' as const, scale: [1.0, 0.1, 0.2], position: [0, 0.6, 0], color: "#78350f" },
      { geometry: ['coneGeometry', [0.5, 0.3, 4]] as [string, any[]], position: [0, 0.8, 0], rotation: [0, Math.PI/4, 0], color: "#451a03" }
    ],
    // 2. Magic Spring
    [
      { geometry: 'torus' as const, scale: [0.6, 0.2, 8], position: [0, 0.1, 0], rotation: [Math.PI/2, 0, 0], color: "#94a3b8" },
      { geometry: 'sphere' as const, scale: 0.4, position: [0, 0.2, 0], color: "#22d3ee", emissive: "#22d3ee", emissiveIntensity: 1.2, transparent: true, opacity: 0.8 },
      { component: FloatingCrystal, position: [0, 0.8, 0], componentProps: { color: "#22d3ee" } }
    ]
  ],
  [BuildingType.PoliceStation]: [
    // 1. Watchtower
    [
      { geometry: 'box' as const, scale: [0.6, 1.2, 0.6], position: [0, 0.6, 0], color: "#475569" },
      { geometry: 'box' as const, scale: [0.8, 0.2, 0.8], position: [0, 1.3, 0], color: "#334155" },
      { geometry: ['coneGeometry', [0.6, 0.5, 4]] as [string, any[]], position: [0, 1.6, 0], rotation: [0, Math.PI/4, 0], color: "#1e293b" },
      { component: Flag, position: [0, 1.9, 0], componentProps: { color: "#3b82f6" } }
    ],
    // 2. Barracks
    [
      { geometry: 'box' as const, scale: [1.2, 0.5, 0.8], position: [0, 0.25, 0], color: "#64748b" },
      { geometry: ['coneGeometry', [0.8, 0.4, 4]] as [string, any[]], position: [0, 0.7, 0], rotation: [0, Math.PI/4, 0], color: "#334155" },
      { geometry: 'box' as const, scale: [0.2, 0.4, 0.2], position: [0.4, 0.2, 0.4], color: "#94a3b8" }, // Guard
      { geometry: 'box' as const, scale: [0.2, 0.4, 0.2], position: [-0.4, 0.2, 0.4], color: "#94a3b8" } // Guard
    ]
  ],
  [BuildingType.FireStation]: [
    // 1. Red Tower
    [
      { geometry: ['cylinderGeometry', [0.4, 0.5, 1.0, 8]] as [string, any[]], position: [0, 0.5, 0], color: "#7f1d1d" },
      { geometry: ['coneGeometry', [0.5, 0.6, 8]] as [string, any[]], position: [0, 1.3, 0], color: "#450a0a" },
      { component: FloatingCrystal, position: [0, 1.8, 0], componentProps: { color: "#f43f5e" } }
    ],
    // 2. Flame Shrine
    [
      { geometry: 'box' as const, scale: [0.8, 0.2, 0.8], position: [0, 0.1, 0], color: "#450a0a" },
      { geometry: 'box' as const, scale: [0.6, 0.6, 0.6], position: [0, 0.5, 0], color: "#7f1d1d" },
      { geometry: 'sphere' as const, scale: 0.3, position: [0, 0.9, 0], color: "#fb923c", emissive: "#ea580c", emissiveIntensity: 2 },
      { component: SmokeEmitter, position: [0, 1.0, 0] }
    ]
  ],
  [BuildingType.School]: [
    // 1. Lecture Hall
    [
      { geometry: 'box' as const, scale: [1.0, 0.6, 1.0], position: [0, 0.3, 0], color: "#064e3b" },
      { geometry: ['coneGeometry', [0.8, 0.5, 4]] as [string, any[]], position: [0, 0.85, 0], rotation: [0, Math.PI/4, 0], color: "#022c22" },
      { geometry: ['cylinderGeometry', [0.1, 0.1, 0.4, 8]] as [string, any[]], position: [0.3, 0.8, 0.3], color: "#22d3ee" } // Chimney
    ],
    // 2. Observatory Dome
    [
      { geometry: ['cylinderGeometry', [0.5, 0.5, 0.5, 12]] as [string, any[]], position: [0, 0.25, 0], color: "#064e3b" },
      { geometry: 'sphere' as const, scale: 0.5, position: [0, 0.5, 0], color: "#22d3ee", emissive: "#22d3ee", emissiveIntensity: 0.5 },
      { geometry: 'box' as const, scale: [0.1, 0.6, 0.1], position: [0.2, 0.6, 0.2], rotation: [Math.PI/4, 0, 0], color: "#022c22" } // Telescope
    ]
  ],
  [BuildingType.LumberMill]: [
    // 1. Sawmill
    [
      { geometry: 'box' as const, scale: [1.2, 0.4, 0.6], position: [0, 0.2, -0.2], color: "#78350f" },
      { geometry: ['coneGeometry', [0.7, 0.4, 4]] as [string, any[]], position: [0, 0.6, -0.2], rotation: [0, Math.PI/4, 0], color: "#451a03" },
      { geometry: ['cylinderGeometry', [0.3, 0.3, 0.1, 12]] as [string, any[]], position: [0.4, 0.2, 0.2], rotation: [Math.PI/2, 0, 0], color: "#94a3b8" }, // Saw blade
      { geometry: ['cylinderGeometry', [0.1, 0.1, 0.8, 8]] as [string, any[]], position: [-0.2, 0.1, 0.3], rotation: [0, 0, Math.PI/2], color: "#b45309" } // Log
    ],
    // 2. Logging Camp
    [
      { geometry: 'box' as const, scale: [0.6, 0.4, 0.6], position: [-0.3, 0.2, -0.3], color: "#78350f" },
      ...[0, 1, 2].map(i => ({
        geometry: ['cylinderGeometry', [0.1, 0.1, 0.6, 8]] as [string, any[]], position: [0.3, 0.1 + i*0.08, 0.2], rotation: [0, 0, Math.PI/2], color: "#b45309"
      } as BuildingPart))
    ]
  ],
  [BuildingType.Bakery]: [
    // 1. Oven House
    [
      { geometry: 'box' as const, scale: [0.8, 0.5, 0.8], position: [0, 0.25, 0], color: "#fbbf24" },
      { geometry: ['coneGeometry', [0.6, 0.4, 4]] as [string, any[]], position: [0, 0.7, 0], rotation: [0, Math.PI/4, 0], color: "#b45309" },
      { geometry: ['cylinderGeometry', [0.2, 0.2, 0.4, 8]] as [string, any[]], position: [0.4, 0.2, 0], color: "#78350f" }, // Oven
      { component: SmokeEmitter, position: [0.4, 0.5, 0] }
    ],
    // 2. Pastry Shop
    [
      { geometry: 'box' as const, scale: [1.0, 0.6, 0.7], position: [0, 0.3, 0], color: "#fef3c7" },
      { geometry: 'box' as const, scale: [1.1, 0.1, 0.8], position: [0, 0.65, 0], color: "#d97706" }, // Flat roof
      { geometry: 'box' as const, scale: [0.8, 0.3, 0.1], position: [0, 0.2, 0.36], color: "#fef3c7", emissive: "#fef3c7", emissiveIntensity: 0.5 } // Display window
    ]
  ],
  [BuildingType.Library]: [
    // 1. Grand Archives
    [
      { geometry: 'box' as const, scale: [1.2, 0.8, 1.2], position: [0, 0.4, 0], color: "#1e3a8a" },
      { geometry: 'box' as const, scale: [1.0, 0.4, 1.0], position: [0, 1.0, 0], color: "#1d4ed8" },
      { geometry: ['coneGeometry', [0.8, 0.5, 4]] as [string, any[]], position: [0, 1.45, 0], rotation: [0, Math.PI/4, 0], color: "#1e40af" },
      { geometry: 'box' as const, scale: [0.2, 0.6, 0.1], position: [0, 0.3, 0.6], color: "#22d3ee", emissive: "#22d3ee", emissiveIntensity: 0.5 } // Tall window
    ],
    // 2. Scroll Tower
    [
      { geometry: ['cylinderGeometry', [0.5, 0.6, 1.5, 12]] as [string, any[]], position: [0, 0.75, 0], color: "#1e3a8a" },
      { geometry: ['coneGeometry', [0.6, 0.6, 12]] as [string, any[]], position: [0, 1.8, 0], color: "#1e40af" },
      { component: FloatingCrystal, position: [0, 2.3, 0], componentProps: { color: "#22d3ee" } }
    ]
  ],
  [BuildingType.LuminaBloom]: [
    // 1. Giant Flower
    [
      { geometry: ['cylinderGeometry', [0.05, 0.1, 0.6, 8]] as [string, any[]], position: [0, 0.3, 0], color: "#14532d" }, // Stem
      { geometry: 'sphere' as const, scale: 0.4, position: [0, 0.7, 0], color: "#d946ef", emissive: "#c026d3", emissiveIntensity: 1.5, transparent: true, opacity: 0.9 }, // Bulb
      ...[0, 1, 2, 3, 4].map(i => ({
        geometry: 'box' as const, scale: [0.3, 0.05, 0.1], position: [Math.cos(i*Math.PI*2/5)*0.3, 0.6, Math.sin(i*Math.PI*2/5)*0.3], rotation: [0, -i*Math.PI*2/5, Math.PI/6], color: "#fdf4ff"
      } as BuildingPart)), // Petals
      { component: ForestWisps }
    ],
    // 2. Crystal Garden
    [
      { geometry: 'box' as const, scale: [0.8, 0.1, 0.8], position: [0, 0.05, 0], color: "#4a044e" },
      ...[0, 1, 2].map(i => ({
        geometry: 'octa' as const, scale: 0.2 + Math.random()*0.2, position: [(Math.random()-0.5)*0.5, 0.2, (Math.random()-0.5)*0.5], color: "#e879f9", emissive: "#d946ef", emissiveIntensity: 1.2
      } as BuildingPart)),
      { component: ForestWisps }
    ]
  ],
  [BuildingType.MarketSquare]: [
    // 1. Tent City
    [
      { geometry: 'box' as const, scale: [1.4, 0.05, 1.4], position: [0, 0.02, 0], color: "#d4d4d8" },
      ...[[-0.4, -0.4], [0.4, -0.4], [-0.4, 0.4], [0.4, 0.4]].map((p, i) => ({
        position: [p[0], 0, p[1]] as [number, number, number],
        children: [
          { geometry: 'box' as const, scale: [0.3, 0.2, 0.3], position: [0, 0.1, 0], color: "#78350f" },
          { geometry: ['coneGeometry', [0.25, 0.3, 4]] as [string, any[]], position: [0, 0.35, 0], rotation: [0, Math.PI/4, 0], color: ['#ef4444', '#3b82f6', '#10b981', '#f59e0b'][i] }
        ] as BuildingPart[]
      } as BuildingPart)),
      { geometry: ['cylinderGeometry', [0.1, 0.1, 0.6, 8]] as [string, any[]], position: [0, 0.3, 0], color: "#fbbf24" } // Center statue/fountain
    ],
    // 2. Open Bazaar
    [
      { geometry: 'box' as const, scale: [1.4, 0.05, 1.4], position: [0, 0.02, 0], color: "#e5e7eb" },
      { geometry: 'box' as const, scale: [1.2, 0.1, 1.2], position: [0, 0.5, 0], color: "#b45309" }, // Canopy
      ...[[-0.5, -0.5], [0.5, -0.5], [-0.5, 0.5], [0.5, 0.5]].map(p => ({
        geometry: ['cylinderGeometry', [0.05, 0.05, 0.5, 8]] as [string, any[]], position: [p[0], 0.25, p[1]] as [number, number, number], color: "#78350f"
      } as BuildingPart)),
      { geometry: 'box' as const, scale: [0.4, 0.2, 0.2], position: [0, 0.1, 0], color: "#92400e" } // Central stall
    ]
  ],
  [BuildingType.GrandObservatory]: [
    // 1. Star Dome
    [
      { geometry: ['cylinderGeometry', [0.8, 0.9, 1.0, 16]] as [string, any[]], position: [0, 0.5, 0], color: "#312e81" },
      { geometry: 'sphere' as const, scale: 0.8, position: [0, 1.0, 0], color: "#4338ca" },
      { geometry: ['cylinderGeometry', [0.15, 0.15, 0.8, 8]] as [string, any[]], position: [0.4, 1.4, 0], rotation: [0, 0, Math.PI/4], color: "#94a3b8" }, // Telescope
      { component: FloatingCrystal, position: [0, 2.0, 0], componentProps: { color: "#22d3ee" } }
    ],
    // 2. Astrolabe Tower
    [
      { geometry: 'box' as const, scale: [0.8, 1.2, 0.8], position: [0, 0.6, 0], color: "#312e81" },
      { geometry: 'torus' as const, scale: [0.6, 0.05, 16], position: [0, 1.5, 0], rotation: [Math.PI/4, Math.PI/4, 0], color: "#fbbf24" },
      { geometry: 'torus' as const, scale: [0.5, 0.05, 16], position: [0, 1.5, 0], rotation: [-Math.PI/4, Math.PI/4, 0], color: "#fbbf24" },
      { geometry: 'sphere' as const, scale: 0.2, position: [0, 1.5, 0], color: "#22d3ee", emissive: "#22d3ee", emissiveIntensity: 1.5 }
    ]
  ],
  [BuildingType.Clocktower]: [
    // 1. Tall Clock
    [
      { geometry: 'box' as const, scale: [0.6, 1.5, 0.6], position: [0, 0.75, 0], color: "#78350f" },
      { geometry: 'box' as const, scale: [0.7, 0.4, 0.7], position: [0, 1.7, 0], color: "#92400e" },
      { geometry: ['cylinderGeometry', [0.25, 0.25, 0.05, 16]] as [string, any[]], position: [0, 1.7, 0.36], rotation: [Math.PI/2, 0, 0], color: "#fef3c7" }, // Clock face
      { geometry: ['coneGeometry', [0.5, 0.6, 4]] as [string, any[]], position: [0, 2.2, 0], rotation: [0, Math.PI/4, 0], color: "#451a03" }
    ],
    // 2. Steampunk Clock
    [
      { geometry: ['cylinderGeometry', [0.4, 0.5, 1.2, 12]] as [string, any[]], position: [0, 0.6, 0], color: "#b45309" },
      { geometry: 'torus' as const, scale: [0.5, 0.1, 12], position: [0, 1.4, 0], color: "#fbbf24" },
      { geometry: 'sphere' as const, scale: 0.4, position: [0, 1.4, 0], color: "#fef3c7", emissive: "#fcd34d", emissiveIntensity: 0.5 }, // Glowing face
      { geometry: 'box' as const, scale: [0.1, 0.8, 0.1], position: [0.3, 0.6, 0.3], color: "#94a3b8" } // Pipe
    ]
  ],
  [BuildingType.DruidCircle]: [
    // 1. Stonehenge
    [
      { geometry: 'box' as const, scale: [1.2, 0.05, 1.2], position: [0, 0.02, 0], color: "#14532d" },
      { component: EtherealDust, componentProps: { color: "#d946ef" } },
      ...[0, 1, 2, 3, 4, 5].map(i => ({
        geometry: 'box' as const, scale: [0.15, 0.5, 0.1], position: [Math.cos(i*Math.PI/3)*0.4, 0.25, Math.sin(i*Math.PI/3)*0.4], rotation: [0, -i*Math.PI/3, 0], color: "#78716c"
      } as BuildingPart)),
      { component: FloatingCrystal, position: [0, 0.8, 0], componentProps: { color: "#d946ef" } },
      { component: ForestWisps }
    ],
    // 2. Nature Altar
    [
      { geometry: ['cylinderGeometry', [0.6, 0.6, 0.1, 16]] as [string, any[]], position: [0, 0.05, 0], color: "#3f6212" },
      { geometry: ['cylinderGeometry', [0.3, 0.4, 0.2, 8]] as [string, any[]], position: [0, 0.2, 0], color: "#57534e" }, // Altar
      { geometry: 'sphere' as const, scale: 0.2, position: [0, 0.4, 0], color: "#22d3ee", emissive: "#22d3ee", emissiveIntensity: 2 }, // Glowing orb
      ...[[-0.4, -0.4], [0.4, -0.4], [-0.4, 0.4], [0.4, 0.4]].map(p => ({
        geometry: ['coneGeometry', [0.1, 0.3, 4]] as [string, any[]], position: [p[0], 0.15, p[1]] as [number, number, number], color: "#15803d"
      } as BuildingPart)),
      { component: ForestWisps }
    ]
  ]
};

// --- Recursive Building Renderer ---

export const BuildingRenderer: React.FC<{ part: BuildingPart, color: string }> = ({ part, color }) => {
  if (!part) return null; // Guard against undefined parts from schema holes or map errors
  const { geometry, position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, useConfigColor, emissive, emissiveIntensity, opacity, transparent, metalness, component: Component, componentProps, children } = part;

  const meshGeometry = useMemo(() => {
    if (!geometry) return null;
    if (Array.isArray(geometry)) {
      const [type, args] = geometry;
      // Dynamic geometry instantiation
      const Cls = (THREE as any)[type.charAt(0).toUpperCase() + type.slice(1)];
      return new Cls(...args);
    }
    return GEOMETRY[geometry as keyof typeof GEOMETRY];
  }, [geometry]);

  const content = (
    <>
      {meshGeometry && (
        <mesh 
          geometry={meshGeometry}
          position={position as [number, number, number]} 
          rotation={rotation as [number, number, number]} 
          scale={typeof scale === 'number' ? [scale, scale, scale] : (scale as [number, number, number])}
        >
          <meshStandardMaterial 
            color={part.color || (useConfigColor ? color : undefined)} 
            emissive={emissive}
            emissiveIntensity={emissiveIntensity}
            opacity={opacity}
            transparent={transparent}
            metalness={metalness}
          />
        </mesh>
      )}
      {children?.map((child, i) => (
        <BuildingRenderer key={i} part={child} color={color} />
      ))}
    </>
  );

  if (Component) {
    return (
      <group position={position as [number, number, number]} rotation={rotation as [number, number, number]}>
        <Component {...componentProps}>
          {content}
        </Component>
      </group>
    );
  }

  return content;
};
