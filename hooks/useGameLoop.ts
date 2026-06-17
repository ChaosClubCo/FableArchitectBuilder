
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useEffect, useRef, useState } from 'react';
import { CityStats, Grid, NewsItem } from '../types';
import { SimulationService } from '../services/simulationService';
import { generateNewsEvent } from '../services/geminiService';
import { SaveService } from '../services/saveService';
import { soundService } from '../services/soundService';
import { TICK_RATE_MS } from '../constants';

export const useGameLoop = (
  gameStarted: boolean,
  aiEnabled: boolean,
  initialGrid: Grid,
  initialStats: CityStats,
  activeProfileId: string,
  isPaused: boolean
) => {
  const [grid, setGrid] = useState<Grid>(initialGrid);
  const [stats, setStats] = useState<CityStats>(initialStats);
  const [newsFeed, setNewsFeed] = useState<NewsItem[]>([]);
  const [autosaving, setAutosaving] = useState(false);

  // Refs for loop access
  const gridRef = useRef(grid);
  const statsRef = useRef(stats);
  const activeProfileIdRef = useRef(activeProfileId);
  const tickCountRef = useRef(0);

  useEffect(() => {
    gridRef.current = grid;
    statsRef.current = stats;
    activeProfileIdRef.current = activeProfileId;
  }, [grid, stats, activeProfileId]);

  // Sync state when loaded externally
  useEffect(() => {
    setGrid(initialGrid);
    setStats(initialStats);
  }, [initialGrid, initialStats]);

  useEffect(() => {
    if (!gameStarted || isPaused) return;

    const interval = setInterval(() => {
      if (document.hidden) return;
      tickCountRef.current++;

      // 1. Calculate Sim
      const { newStats, newGrid } = SimulationService.calculateTick(gridRef.current, statsRef.current);
      setStats(newStats);
      setGrid(newGrid);

      // 2. Audio Ambience Update
      soundService.updateAmbience(newStats.weather, newStats.time);

      // 3. AI News
      if (Math.random() < 0.1 && aiEnabled && newStats.activeEvents.length === 0) {
        generateNewsEvent(statsRef.current, "Prosperity").then(news => {
          if (news) setNewsFeed(p => [news, ...p].slice(0, 10));
        });
      }

      // 4. Autosave
      if (tickCountRef.current % 10 === 0) {
        setAutosaving(true);
        SaveService.save(newGrid, newStats, activeProfileIdRef.current)
          .then(() => {
            soundService.playSaveChime();
            setTimeout(() => setAutosaving(false), 500);
          })
          .catch(err => console.error("Auto-save failed", err));
      }

    }, TICK_RATE_MS);

    return () => clearInterval(interval);
  }, [gameStarted, aiEnabled, isPaused]);

  return { grid, setGrid, stats, setStats, newsFeed, setNewsFeed, autosaving };
};
