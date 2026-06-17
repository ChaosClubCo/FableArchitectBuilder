
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface WeatherSystemProps {
  weather: 'clear' | 'rain' | 'storm';
  activeEvents: CityStats['activeEvents'];
  bounds: number;
}

const RAIN_COUNT = 4000;
const MANA_COUNT = 1000;

export const WeatherSystem: React.FC<WeatherSystemProps> = ({ weather, activeEvents, bounds }) => {
  const rainGeo = useRef<THREE.BufferGeometry>(null);
  const manaGeo = useRef<THREE.BufferGeometry>(null);
  const fireworksGeo = useRef<THREE.BufferGeometry>(null);
  
  // Lightning State
  const [lightningIntensity, setLightningIntensity] = useState(0);

  const manaDroughtEvent = activeEvents.find(e => e.type === 'mana_drought');
  const manaWarningEvent = activeEvents.find(e => e.type === 'mana_drought_warning');
  const hasFireworks = activeEvents.some(e => e.visualEffect === 'fireworks');
  const hasShadows = activeEvents.some(e => e.visualEffect === 'shadows');
  const hasGoldenGlow = activeEvents.some(e => e.visualEffect === 'golden_glow');
  
  useFrame(() => {
    if (weather === 'storm') {
      if (Math.random() < 0.005) { // Flash trigger
        setLightningIntensity(2 + Math.random() * 5);
      } else {
        setLightningIntensity(prev => Math.max(0, prev * 0.8)); // Fade out
      }
    } else {
      setLightningIntensity(0);
    }
  });

  const rainConfig = useMemo(() => {
    const isActive = weather === 'rain' || weather === 'storm';
    const isStorm = weather === 'storm';
    return {
      isActive,
      color: isStorm ? new THREE.Color('#94a3b8') : new THREE.Color('#bfdbfe'),
      speedY: isStorm ? 0.8 : 0.4,
      speedX: isStorm ? 0.2 : 0,
    };
  }, [weather]);

  const rainPositions = useMemo(() => {
    if (!rainConfig.isActive) return new Float32Array(0);
    const pos = new Float32Array(RAIN_COUNT * 3);
    for (let i = 0; i < RAIN_COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * bounds * 1.5; 
      pos[i * 3 + 1] = Math.random() * 40;               
      pos[i * 3 + 2] = (Math.random() - 0.5) * bounds * 1.5; 
    }
    return pos;
  }, [rainConfig.isActive, bounds]);

  const manaConfig = useMemo(() => {
    const isActive = !!(manaDroughtEvent || manaWarningEvent);
    const isDrought = !!manaDroughtEvent;
    return {
      isActive,
      color: isDrought ? new THREE.Color('#4c0519') : new THREE.Color('#fbbf24'),
      speedY: isDrought ? -0.05 : 0.05,
      opacity: isDrought ? 0.4 : 0.6,
      size: isDrought ? 0.15 : 0.1,
    };
  }, [manaDroughtEvent, manaWarningEvent]);

  const manaPositions = useMemo(() => {
    if (!manaConfig.isActive) return new Float32Array(0);
    const pos = new Float32Array(MANA_COUNT * 3);
    for (let i = 0; i < MANA_COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * bounds * 1.2;
      pos[i * 3 + 1] = Math.random() * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * bounds * 1.2;
    }
    return pos;
  }, [manaConfig.isActive, bounds]);

  useFrame(() => {
    if (rainConfig.isActive && rainGeo.current) {
      const positions = rainGeo.current.attributes.position.array as Float32Array;
      for (let i = 0; i < RAIN_COUNT; i++) {
        positions[i * 3 + 1] -= rainConfig.speedY;
        positions[i * 3] -= rainConfig.speedX;
        if (positions[i * 3 + 1] < 0) {
          positions[i * 3 + 1] = 40;
          positions[i * 3] = (Math.random() - 0.5) * bounds * 1.5;
        }
      }
      rainGeo.current.attributes.position.needsUpdate = true;
    }

    if (manaConfig.isActive && manaGeo.current) {
      const positions = manaGeo.current.attributes.position.array as Float32Array;
      for (let i = 0; i < MANA_COUNT; i++) {
        positions[i * 3 + 1] += manaConfig.speedY;
        if (positions[i * 3 + 1] > 20 || positions[i * 3 + 1] < 0) {
           positions[i * 3 + 1] = manaConfig.speedY > 0 ? 0 : 20;
        }
      }
      manaGeo.current.attributes.position.needsUpdate = true;
    }
  });

  return (
    <>
      {/* Lightning Light */}
      <pointLight position={[0, 30, 0]} intensity={lightningIntensity} color="#c084fc" distance={100} decay={0.5} />
      <ambientLight intensity={lightningIntensity * 0.2} color="#ffffff" />

      {/* Event Lights */}
      {hasGoldenGlow && <ambientLight intensity={0.4} color="#fef3c7" />}
      {hasShadows && <ambientLight intensity={-0.3} color="#1e1b4b" />}

      {rainConfig.isActive && (
        <points>
          <bufferGeometry ref={rainGeo}>
            <bufferAttribute attach="attributes-position" count={rainPositions.length / 3} array={rainPositions} itemSize={3} />
          </bufferGeometry>
          <pointsMaterial color={rainConfig.color} size={0.15} transparent opacity={0.6} sizeAttenuation={true} />
        </points>
      )}

      {manaConfig.isActive && (
        <points>
          <bufferGeometry ref={manaGeo}>
            <bufferAttribute attach="attributes-position" count={manaPositions.length / 3} array={manaPositions} itemSize={3} />
          </bufferGeometry>
          <pointsMaterial color={manaConfig.color} size={manaConfig.size} transparent opacity={manaConfig.opacity} sizeAttenuation={true} blending={THREE.AdditiveBlending} />
        </points>
      )}
    </>
  );
};
