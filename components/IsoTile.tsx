
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Float } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TileData, BuildingType } from '../types';
import { BUILDINGS, GRID_SIZE } from '../constants';
import { BuildingRenderer, BuildingPart, BUILDING_SCHEMAS, getBuildingSchema } from './BuildingSystem';
import { soundService } from '../services/soundService';

const WORLD_OFFSET = GRID_SIZE / 2 - 0.5;
const gridToWorld = (x: number, y: number) => [x - WORLD_OFFSET, 0, y - WORLD_OFFSET] as [number, number, number];
const OCTA_GEO = new THREE.OctahedronGeometry(0.5);

interface IsoTileProps {
  tile: TileData;
  onClick: (x: number, y: number, variant: number) => void;
  isSelected: boolean;
  onHover?: (x: number, y: number) => void;
  previewRotation?: number; // New prop for ghost rotation
}

const UpgradeEffect = () => {
  const group = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
    if (ringRef.current) {
      ringRef.current.scale.x += delta * 8;
      ringRef.current.scale.y += delta * 8;
      const material = ringRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = Math.max(0, material.opacity - delta * 2);
    }
    
    if (group.current) {
      group.current.children.forEach((child) => {
        const mesh = child as THREE.Mesh;
        const vel = mesh.userData.velocity as THREE.Vector3;
        mesh.position.addScaledVector(vel, delta);
        mesh.rotation.x += delta * 2;
        mesh.rotation.y += delta * 2;
        const mat = mesh.material as THREE.MeshBasicMaterial;
        mat.opacity = Math.max(0, mat.opacity - delta * 1.5);
      });
    }
  });

  const particles = useMemo(() => Array.from({ length: 15 }).map(() => ({
    vel: new THREE.Vector3((Math.random() - 0.5) * 4, Math.random() * 4 + 2, (Math.random() - 0.5) * 4)
  })), []);

  return (
    <group>
      <mesh ref={ringRef} position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.5, 0.7, 32]} />
        <meshBasicMaterial color="#d946ef" transparent opacity={1} side={THREE.DoubleSide} />
      </mesh>
      <group ref={group}>
        {particles.map((p, i) => (
          <mesh key={i} position={[0, 0.5, 0]} geometry={OCTA_GEO} userData={{ velocity: p.vel }} scale={0.2}>
            <meshBasicMaterial color="#d946ef" transparent opacity={1} />
          </mesh>
        ))}
      </group>
    </group>
  );
};

const PlacementEffect = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.scale.x += delta * 6;
      meshRef.current.scale.y += delta * 6;
      const material = meshRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = Math.max(0, material.opacity - delta * 2.5);
    }
  });

  return (
    <mesh ref={meshRef} position={[0, -0.48, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.4, 0.5, 32]} />
      <meshBasicMaterial color="#4ade80" transparent opacity={0.8} side={THREE.DoubleSide} />
    </mesh>
  );
};

const PlacementDome = () => {
  const domeRef = useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
    if (domeRef.current) {
      const d = Math.min(delta, 0.1);
      domeRef.current.scale.x += d * 5;
      domeRef.current.scale.y += d * 5;
      domeRef.current.scale.z += d * 5;
      
      const mat = domeRef.current.material as THREE.MeshStandardMaterial;
      mat.opacity = Math.max(0, mat.opacity - d * 2.2);
    }
  });

  return (
    <mesh ref={domeRef} position={[0, -0.48, 0]}>
      <sphereGeometry args={[0.5, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshStandardMaterial 
        color="#c6f6d5" 
        emissive="#10b981" 
        emissiveIntensity={3} 
        transparent 
        opacity={0.7} 
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
};

const DemolishEffect = () => {
  const group = useRef<THREE.Group>(null);
  
  useFrame((state, delta) => {
    if (group.current) {
      const d = Math.min(delta, 0.1);
      group.current.children.forEach((child) => {
        const mesh = child as THREE.Mesh;
        const vel = mesh.userData.velocity as THREE.Vector3;
        mesh.position.addScaledVector(vel, d);
        mesh.rotation.x += d * 3;
        mesh.rotation.y += d * 3;
        const mat = mesh.material as THREE.MeshBasicMaterial;
        mat.opacity = Math.max(0, mat.opacity - d * 2.0);
        mesh.scale.setScalar(Math.max(0, mesh.scale.x - d * 0.4));
      });
    }
  });

  const particles = useMemo(() => Array.from({ length: 12 }).map(() => ({
    vel: new THREE.Vector3(
      (Math.random() - 0.5) * 3, 
      Math.random() * 2 + 1, 
      (Math.random() - 0.5) * 3
    )
  })), []);

  return (
    <group ref={group} position={[0, -0.3, 0]}>
      {particles.map((p, i) => (
        <mesh key={i} geometry={OCTA_GEO} userData={{ velocity: p.vel }} scale={0.25}>
          <meshBasicMaterial color="#a8a29e" transparent opacity={0.8} />
        </mesh>
      ))}
    </group>
  );
};

const LevelCrystals = ({ level }: { level: number }) => {
  return (
    <group position={[0, 1.2, 0]}>
      {Array.from({ length: level }).map((_, i) => {
        const offset = (i - (level - 1) / 2) * 0.25; // Center the crystals horizontally
        return (
          <Float key={i} speed={3} rotationIntensity={2} floatIntensity={1} floatingRange={[-0.05, 0.05]}>
            <mesh position={[offset, 0, 0]} geometry={OCTA_GEO} scale={0.06}>
              <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={1.5} />
            </mesh>
          </Float>
        );
      })}
    </group>
  );
};

const IsoTile: React.FC<IsoTileProps> = React.memo(({ tile, onClick, isSelected, onHover, previewRotation }) => {
  const config = BUILDINGS[tile.buildingType];
  const worldPos = gridToWorld(tile.x, tile.y);
  
  const variant = useMemo(() => {
    if (tile.variant !== undefined) return tile.variant;
    return Math.floor(Math.random() * 100);
  }, [tile.variant]);

  const schema = useMemo(() => {
    return getBuildingSchema(tile.buildingType, variant);
  }, [tile.buildingType, variant]);

  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showPlacement, setShowPlacement] = useState(false);
  const [showDemolish, setShowDemolish] = useState(false);
  const prevLevel = useRef(tile.level);
  const prevBuildingType = useRef(tile.buildingType);
  const buildingGroupRef = useRef<THREE.Group>(null);

  // Elastic pop-in physical spring state
  const springVel = useRef(0);
  const currentScale = useRef(1.0); // If structure already exists, start at 1.0

  useEffect(() => {
    if (tile.level > prevLevel.current) {
        setShowUpgrade(true);
        soundService.playUpgrade(tile.buildingType, tile.level);
        const t = setTimeout(() => setShowUpgrade(false), 1000);
        return () => clearTimeout(t);
    }
    prevLevel.current = tile.level;
  }, [tile.level, tile.buildingType]);

  useEffect(() => {
    if (prevBuildingType.current === BuildingType.None && tile.buildingType !== BuildingType.None) {
      setShowPlacement(true);
      soundService.playBuild(tile.buildingType);
      
      // Reset spring scale values to trigger bouncy construction animation
      currentScale.current = 0.01;
      springVel.current = 24; // Kick off pop-in velocity
      
      if (buildingGroupRef.current) {
        buildingGroupRef.current.scale.set(0.01, 0.01, 0.01);
      }
      const t = setTimeout(() => setShowPlacement(false), 600);
      return () => clearTimeout(t);
    } else if (prevBuildingType.current !== BuildingType.None && tile.buildingType === BuildingType.None) {
      soundService.playDemolish();
      setShowDemolish(true);
      const t = setTimeout(() => setShowDemolish(false), 600);
      return () => clearTimeout(t);
    }
    prevBuildingType.current = tile.buildingType;
  }, [tile.buildingType]);

  useFrame((_, delta) => {
    if (buildingGroupRef.current) {
      const d = Math.min(delta, 0.1);
      const target = 1.0;
      
      // Hooke's split spring equation: F = -k*x - c*v
      const stiffness = 160;
      const damping = 12;
      
      const displacement = currentScale.current - target;
      const force = -stiffness * displacement - damping * springVel.current;
      
      springVel.current += force * d;
      currentScale.current += springVel.current * d;
      
      // Prevent negative scales
      if (currentScale.current < 0.001) {
        currentScale.current = 0.001;
        springVel.current = 0;
      }

      // Proportional Squash & Stretch based on spring mechanics
      const stretchY = 1.0 + springVel.current * 0.012;
      const squashXZ = 1.0 / Math.sqrt(Math.max(0.1, stretchY));
      
      buildingGroupRef.current.scale.set(
        currentScale.current * squashXZ,
        currentScale.current * stretchY,
        currentScale.current * squashXZ
      );
    }
  });

  const isEmpty = tile.buildingType === BuildingType.None;
  const isRoad = tile.buildingType === BuildingType.Road;
  const baseColor = isSelected ? "#fbbf24" : (isRoad ? "#cbd5e1" : (isEmpty ? "#10b981" : "#1e293b"));
  const baseOpacity = isSelected ? 0.8 : (isEmpty ? 0.0 : 1.0); 

  // Calculate actual rotation (tile state OR preview state if selected/ghost)
  const rotationY = (previewRotation !== undefined ? previewRotation : (tile.rotation || 0)) * (Math.PI / 2);

  return (
    <group 
      position={worldPos} 
      onClick={(e) => { e.stopPropagation(); onClick(tile.x, tile.y, variant); }}
      onPointerOver={(e) => { e.stopPropagation(); onHover && onHover(tile.x, tile.y); }}
    >
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.49, 0]} receiveShadow>
        <planeGeometry args={[0.95, 0.95]} />
        <meshStandardMaterial color={baseColor} transparent={isEmpty || isSelected} opacity={baseOpacity} />
      </mesh>

      <group ref={buildingGroupRef} rotation={[0, rotationY, 0]}>
        {schema?.map((part, i) => (
            <BuildingRenderer key={i} part={part} color={config.color} />
        ))}
      </group>

      {tile.buildingType !== BuildingType.None && !isRoad && (
        <LevelCrystals level={tile.level} />
      )}

      {showUpgrade && <UpgradeEffect />}
      {showPlacement && <PlacementEffect />}
      {showPlacement && <PlacementDome />}
      {showDemolish && <DemolishEffect />}
      {!tile.hasMana && !isEmpty && !isRoad && (
        <Float speed={5} rotationIntensity={2} floatIntensity={1}>
          <mesh position={[0, 1.5, 0]} geometry={OCTA_GEO} scale={0.1}>
            <meshStandardMaterial color="#f43f5e" emissive="#f43f5e" />
          </mesh>
        </Float>
      )}
    </group>
  );
});

export default IsoTile;
