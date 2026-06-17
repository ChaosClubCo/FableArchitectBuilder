
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MapControls, OrthographicCamera, Stars, Sky, ContactShadows, Html } from '@react-three/drei';
import * as THREE from 'three';
import { TileData, BuildingType, CityStats } from '../types';
import { GRID_SIZE, BUILDINGS, MAX_LEVEL } from '../constants';
import IsoTile from './IsoTile';
import { createProceduralTexture } from '../utils/graphics';
import { BuildingRenderer, BUILDING_SCHEMAS, BuildingPart, getBuildingSchema } from './BuildingSystem';
import { WeatherSystem } from './WeatherSystem';
import { ActionService } from '../services/actionService';

interface IsoMapProps {
  grid: TileData[][];
  onTileClick: (x: number, y: number, variant: number) => void;
  selectedTool: BuildingType;
  onSelectTool: (t: BuildingType) => void;
  time: number;
  weather: 'clear' | 'rain' | 'storm';
  isLocked: boolean;
  rotationIndex?: number;
  buildRotation?: number;
  activeEvents: CityStats['activeEvents'];
}

const AnimatedGroup = ({ rotationIndex, children }: React.PropsWithChildren<{ rotationIndex: number }>) => {
  const groupRef = useRef<THREE.Group>(null);
  const targetRotation = useRef(0);

  useEffect(() => {
    targetRotation.current = rotationIndex * (Math.PI / 2);
  }, [rotationIndex]);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetRotation.current,
        delta * 5
      );
    }
  });

  return <group ref={groupRef}>{children}</group>;
};

const WORLD_OFFSET = GRID_SIZE / 2 - 0.5;
const gridToWorld = (x: number, y: number) => [x - WORLD_OFFSET, 0, y - WORLD_OFFSET] as [number, number, number];

const GhostBuilding = ({ type, x, y, isValid, buildRotation = 0 }: { type: BuildingType, x: number, y: number, isValid: boolean, buildRotation?: number }) => {
  const schema = useMemo(() => {
    // Generate a deterministic random seed based on x and y coordinates 
    // This provides visual diversity for ghost buildings as you move around
    const seed = (x * 73856093) ^ (y * 19349663);
    return getBuildingSchema(type, Math.abs(seed));
  }, [type, x, y]);

  const config = BUILDINGS[type];
  if (!schema || !config) return null;

  const worldPos = gridToWorld(x, y);

  return (
    <group position={worldPos}>
      <group rotation={[0, buildRotation * (Math.PI / 2), 0]}>
        {schema.map((part, i) => (
          <BuildingRenderer 
            key={i} 
            part={{
              ...part,
              transparent: true,
              opacity: 0.6,
              emissive: isValid ? "#4ade80" : "#f43f5e",
              emissiveIntensity: 0.5
            }} 
            color={isValid ? "#4ade80" : "#f43f5e"} 
          />
        ))}
      </group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.48, 0]}>
        <planeGeometry args={[0.9, 0.9]} />
        <meshBasicMaterial color={isValid ? "#4ade80" : "#f43f5e"} opacity={0.4} transparent />
      </mesh>
    </group>
  );
};

const IsoMap: React.FC<IsoMapProps> = ({ grid, onTileClick, time, weather, isLocked, selectedTool, rotationIndex = 0, buildRotation = 0, activeEvents }) => {
  const groundTexture = useMemo(() => createProceduralTexture(), []);
  const [hovered, setHovered] = useState<{x: number, y: number} | null>(null);
  
  const handleTileHover = useCallback((x: number, y: number) => {
    setHovered(prev => (prev?.x === x && prev?.y === y) ? prev : {x, y});
  }, []);

  const isPlacementValid = useMemo(() => {
    if (!hovered) return false;
    const tile = grid[hovered.y]?.[hovered.x];
    if (!tile) return false;
    if (selectedTool === BuildingType.None) return true;
    if (selectedTool === BuildingType.Upgrade) return tile.buildingType !== BuildingType.None;
    return tile.buildingType === BuildingType.None;
  }, [hovered, grid, selectedTool]);

  return (
    <div className={`absolute inset-0 w-full h-full ${isLocked ? 'pointer-events-none' : ''}`}>
      <Canvas shadows dpr={[1, 2]}>
        <OrthographicCamera makeDefault position={[50, 50, 50]} zoom={35} near={0.1} far={1000} />
        <MapControls enableRotate={false} minZoom={15} maxZoom={100} />
        
        <Sky 
          sunPosition={[Math.cos(time * Math.PI / 12) * 100, Math.sin(time * Math.PI / 12) * 100, 20]} 
          turbidity={0.5}
          rayleigh={0.5}
          mieCoefficient={0.005}
          mieDirectionalG={0.8}
        />
        
        <ambientLight intensity={weather === 'storm' ? 0.3 : 0.8} />
        
        <directionalLight 
          position={[20, 40, 20]} 
          intensity={weather === 'clear' ? 1.4 : 0.7} 
          castShadow 
          shadow-mapSize={[1024, 1024]}
        >
          <orthographicCamera attach="shadow-camera" args={[-40, 40, 40, -40]} />
        </directionalLight>

        {(time > 18 || time < 6) && (
          <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
        )}

        <WeatherSystem weather={weather} activeEvents={activeEvents} bounds={GRID_SIZE + 5} />

        <AnimatedGroup rotationIndex={rotationIndex}>
          <mesh 
            rotation={[-Math.PI / 2, 0, 0]} 
            position={[0, -0.51, 0]} 
            receiveShadow
            onPointerOut={() => setHovered(null)}
          >
            <planeGeometry args={[GRID_SIZE + 30, GRID_SIZE + 30]} />
            {groundTexture ? (
              <meshStandardMaterial 
                map={groundTexture} 
                roughness={0.8}
                metalness={0.1}
              />
            ) : (
              <meshStandardMaterial color="#2d5a27" roughness={1} />
            )}
          </mesh>

          {grid.map((row) => row.map((tile) => (
            <IsoTile 
              key={`${tile.x}-${tile.y}`} 
              tile={tile} 
              onClick={onTileClick} 
              isSelected={hovered?.x === tile.x && hovered?.y === tile.y}
              onHover={handleTileHover}
              previewRotation={hovered?.x === tile.x && hovered?.y === tile.y ? buildRotation : undefined}
            />
          )))}

          {hovered && selectedTool !== BuildingType.None && selectedTool !== BuildingType.Upgrade && (
            <GhostBuilding type={selectedTool} x={hovered.x} y={hovered.y} isValid={isPlacementValid} buildRotation={buildRotation} />
          )}

          {hovered && (selectedTool === BuildingType.None || selectedTool === BuildingType.Upgrade) && (
            <mesh position={gridToWorld(hovered.x, hovered.y).map((v, i) => i === 1 ? 0.05 : v) as [number, number, number]} rotation={[-Math.PI/2, 0, 0]}>
              <planeGeometry args={[0.9, 0.9]} />
              <meshBasicMaterial 
                color={selectedTool === BuildingType.None ? "#ef4444" : "#d946ef"} 
                transparent 
                opacity={0.5} 
              />
            </mesh>
          )}

          {hovered && grid[hovered.y]?.[hovered.x]?.buildingType !== BuildingType.None && grid[hovered.y]?.[hovered.x]?.buildingType !== BuildingType.Road && (
            <Html position={gridToWorld(hovered.x, hovered.y).map((v, i) => i === 1 ? 1.5 : v) as [number, number, number]} center style={{ pointerEvents: 'none' }}>
              <div className="bg-slate-900/95 border border-amber-500/50 rounded-lg p-2 shadow-xl backdrop-blur-md text-center min-w-[120px] animate-in fade-in zoom-in duration-200">
                <div className="text-white font-black text-xs uppercase tracking-wider mb-1">
                  {BUILDINGS[grid[hovered.y][hovered.x].buildingType].name}
                </div>
                <div className="text-amber-400 font-bold text-[10px] mb-1">
                  Level {grid[hovered.y][hovered.x].level}
                </div>
                {grid[hovered.y][hovered.x].level < MAX_LEVEL ? (
                  <div className="text-emerald-400 text-[9px] font-mono bg-emerald-950/50 rounded px-1 py-0.5">
                    Upgrade: {ActionService.getUpgradeCost(grid[hovered.y][hovered.x].buildingType, grid[hovered.y][hovered.x].level)}g
                  </div>
                ) : (
                  <div className="text-fuchsia-400 text-[9px] font-mono bg-fuchsia-950/50 rounded px-1 py-0.5">
                    Max Resonance
                  </div>
                )}
              </div>
            </Html>
          )}

          <ContactShadows position={[0, -0.48, 0]} opacity={0.3} scale={50} blur={2.5} far={1} />
        </AnimatedGroup>
      </Canvas>
    </div>
  );
};

export default IsoMap;
