
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import * as THREE from 'three';
import { GRID_SIZE } from '../constants';

/**
 * Generates a seamless noise-based grass texture using the Canvas API.
 * Uses memoization implicitly via component lifecycle or global instances in usage.
 */
export const createProceduralTexture = (): THREE.Texture | null => {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  
  // 1. Background (Rich Emerald)
  ctx.fillStyle = '#065f46'; // emerald-800
  ctx.fillRect(0, 0, size, size);
  
  // 2. Base Noise (Lighter Emerald patches for variation)
  for (let i = 0; i < 2000; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const w = Math.random() * 100 + 20;
    const h = Math.random() * 100 + 20;
    
    ctx.fillStyle = `rgba(16, 185, 129, ${Math.random() * 0.04})`; // Very subtle emerald-500
    ctx.fillRect(x - w/2, y - h/2, w, h);
    
    // Simple wrap-around logic for seamless tiling
    if (x < w) ctx.fillRect(x - w/2 + size, y - h/2, w, h);
    if (y < h) ctx.fillRect(x - w/2, y - h/2 + size, w, h);
  }

  // 3. Detail Texture (Grass blades/specks)
  for (let i = 0; i < 12000; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    // Mix of lighter and darker specs for depth
    ctx.fillStyle = Math.random() > 0.5 ? '#34d399' : '#064e3b'; 
    ctx.globalAlpha = Math.random() * 0.15;
    ctx.fillRect(x, y, 2, 2);
  }

  // 4. Subtle Organic Highlights (Flowers/Magical residue)
  ctx.globalAlpha = 0.5;
  for (let i = 0; i < 250; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = Math.random() * 2.5 + 0.5;
    // Occasional amber or bright teal specks
    ctx.fillStyle = Math.random() > 0.7 ? '#fcd34d' : '#5eead4'; 
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Reset alpha
  ctx.globalAlpha = 1.0;
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  
  // Set repeat to cover the grid. 
  // Reducing repeat count makes the texture pattern appear larger and less repetitive.
  // GRID_SIZE is typically 20-30. Repeating 4 times implies the texture spans ~6-7 tiles.
  texture.repeat.set(4, 4);
  texture.anisotropy = 16;
  
  return texture;
};
