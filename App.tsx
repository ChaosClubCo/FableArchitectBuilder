
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Grid, TileData, BuildingType, CityStats, AIGoal } from './types';
import { GRID_SIZE, INITIAL_MONEY, CATEGORIES } from './constants';
import IsoMap from './components/IsoMap';
import UIOverlay from './components/UIOverlay';
import StartScreen from './components/StartScreen';
import WizardConsole from './components/WizardConsole';
import { generateCityGoal } from './services/geminiService';
import { soundService } from './services/soundService';
import { SaveService } from './services/saveService';
import { ActionService } from './services/actionService';
import { ResearchService } from './services/researchService';
import { useGameLoop } from './hooks/useGameLoop';
import { useKeyboardControls } from './hooks/useKeyboardControls';
import { ToastContainer, ToastMessage } from './components/Toast';

const createInitialGrid = (): Grid => {
  const grid: Grid = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    const row: TileData[] = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      row.push({ 
        x, y, 
        buildingType: BuildingType.None, 
        level: 1, 
        rotation: 0,
        hasMana: true, hasEssence: true, 
        hasGuards: false, hasMagicSafety: false, hasWisdom: false, 
        happiness: 100 
      });
    }
    grid.push(row);
  }
  return grid;
};

const INITIAL_STATS: CityStats = {
  money: INITIAL_MONEY, population: 0, day: 1, happiness: 100, 
  wisdom: 0, unlockedTechs: ['basic_infra'],
  manaSupply: 0, essenceSupply: 0, manaUsage: 0, essenceUsage: 0,
  maintenanceTotal: 0, incomeTotal: 0, weather: 'clear', time: 10,
  taxRate: 1.0,
  activeEvents: []
};

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [selectedTool, setSelectedTool] = useState<BuildingType>(BuildingType.Road);
  const [currentGoal, setCurrentGoal] = useState<AIGoal | null>(null);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [viewRotation, setViewRotation] = useState(0);
  const [buildRotation, setBuildRotation] = useState(0);
  const [activeTab, setActiveTab] = useState<string>('abodes');
  const [activeProfileId, setActiveProfileId] = useState<string>('default');
  const [isManualSaving, setIsManualSaving] = useState(false);
  
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const addToast = useCallback((message: string, type: 'success' | 'info' | 'warning' = 'info') => {
    setToasts(current => [
      ...current,
      { id: Date.now().toString() + Math.random().toString(36).substr(2, 5), message, type }
    ]);
  }, []);

  const initialGrid = useMemo(() => createInitialGrid(), []);
 
  // Custom Hook for Game Loop
  const { grid, setGrid, stats, setStats, newsFeed, setNewsFeed, autosaving } = useGameLoop(
    gameStarted, 
    aiEnabled, 
    initialGrid, 
    INITIAL_STATS, 
    activeProfileId, 
    isConsoleOpen
  );

  const prevAutosaving = useRef(autosaving);
  useEffect(() => {
    if (prevAutosaving.current && !autosaving) {
      addToast('Kingdom automatically saved', 'success');
    }
    prevAutosaving.current = autosaving;
  }, [autosaving, addToast]);

  const activeBuildings = useMemo(() => {
    const activeCategory = CATEGORIES.find(c => c.id === activeTab);
    return activeCategory
      ? activeCategory.types.filter(t => ResearchService.isBuildingUnlocked(t, stats.unlockedTechs))
      : [];
  }, [activeTab, stats.unlockedTechs]);

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const isFetchingGoal = useRef(false);

  useEffect(() => {
    // Check for last active profile on mount
    SaveService.getActiveProfileId();

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleStartGame = async (ai: boolean, profile?: any) => {
    setAiEnabled(ai);
    if (profile) {
      if (profile.isNew) {
        setGrid(createInitialGrid());
        setStats(INITIAL_STATS);
        setActiveProfileId(profile.id);
        await SaveService.save(createInitialGrid(), INITIAL_STATS, profile.id);
        soundService.playSaveChime();
      } else {
        setGrid(profile.grid);
        setStats(profile.stats);
        setActiveProfileId(profile.id);
      }
    } else {
      const lastId = SaveService.getActiveProfileId();
      const saved = await SaveService.load(lastId);
      if (saved) {
        setGrid(saved.grid);
        setStats(saved.stats);
        setActiveProfileId(lastId);
      }
    }
    setGameStarted(true);
  };

  const handleManualSave = async () => {
    if (!gameStarted || isManualSaving) return;
    setIsManualSaving(true);
    try {
      await SaveService.save(grid, stats, activeProfileId);
      soundService.playSaveChime();
      addToast('Chronicle successfully recorded!', 'success');
      setNewsFeed(p => [
        {
          id: Date.now().toString(),
          text: `Chronicle recorded: "${activeProfileId === 'default' ? 'Primary Realm' : activeProfileId}" saved successfully.`,
          type: 'positive',
          timestamp: Date.now()
        },
        ...p
      ]);
    } catch (err) {
      console.error("Manual save failed:", err);
      addToast('Failed to record chronicle', 'warning');
    } finally {
      setTimeout(() => setIsManualSaving(false), 800);
    }
  };

  const handleUnlockTech = (id: string) => {
    const result = ResearchService.unlock(id, stats);
    if (result.success) {
      setStats(result.newStats);
      soundService.playReward(); 
    } else {
      console.warn(result.message);
    }
  };

  const handleRotateView = (dir: number) => setViewRotation(p => p + dir);
  const handleRotateBuilding = () => setBuildRotation(p => (p + 1) % 4);

  useKeyboardControls({
    enabled: gameStarted && !isConsoleOpen && !isPanelOpen,
    onToolSelect: setSelectedTool,
    onRotateCamera: handleRotateView,
    onRotateBuilding: handleRotateBuilding,
    onToggleConsole: () => setIsConsoleOpen(p => !p),
    onManualSave: handleManualSave,
    activeBuildings
  });

  // Goal Logic
  useEffect(() => {
    if (!gameStarted || !aiEnabled) return;
    if (currentGoal && !currentGoal.completed) {
      const goal = currentGoal;
      let met = false;
       if (goal.targetType === 'population') met = stats.population >= goal.targetValue;
       else if (goal.targetType === 'money') met = stats.money >= goal.targetValue;
       else if (goal.targetType === 'happiness') met = stats.happiness >= goal.targetValue;
       else if (goal.targetType === 'building_count' && goal.buildingType) {
         let count = 0;
         for (const row of grid) for (const t of row) if (t.buildingType === goal.buildingType) count++;
         met = count >= goal.targetValue;
       }
       else if (goal.targetType === 'mana_surplus') met = (stats.manaSupply - stats.manaUsage) >= goal.targetValue;
       else if (goal.targetType === 'essence_surplus') met = (stats.essenceSupply - stats.essenceUsage) >= goal.targetValue;
       else if (goal.targetType === 'diversity') {
         const types = new Set();
         for (const row of grid) for (const t of row) if (t.buildingType !== BuildingType.None) types.add(t.buildingType);
         met = types.size >= goal.targetValue;
       }

      if (met) {
        soundService.playReward();
        setStats(prev => ({ ...prev, money: prev.money + goal.reward }));
        setCurrentGoal(prev => prev ? { ...prev, completed: true } : null);
        setNewsFeed(p => [{ id: Date.now().toString(), text: "Prophecy fulfilled! The treasury grows.", type: 'positive', timestamp: Date.now() }, ...p]);
      }
      return;
    }

    if (!currentGoal || currentGoal.completed) {
      if (isFetchingGoal.current) return;
      isFetchingGoal.current = true;
      setTimeout(async () => {
        try {
          const goal = await generateCityGoal(stats, grid);
          if (goal) {
            setCurrentGoal(goal);
            setNewsFeed(p => [{ id: Date.now().toString(), text: "The Wizard Council issues a new decree.", type: 'urgent', timestamp: Date.now() }, ...p]);
          }
        } finally { isFetchingGoal.current = false; }
      }, 5000);
    }
  }, [gameStarted, aiEnabled, stats, grid, currentGoal]);

  const handleTileClick = useCallback((x: number, y: number, variant: number = 0) => {
    if (!gameStarted || isConsoleOpen) return;
    
    const result = ActionService.execute(selectedTool, grid, stats, x, y, variant);
    if (result.success) {
      if (selectedTool !== BuildingType.None && selectedTool !== BuildingType.Upgrade) {
          result.newGrid[y][x].rotation = buildRotation;
      }
      setGrid(result.newGrid);
      setStats(result.newStats);
      if (result.message) {
        addToast(result.message, 'success');
      }
    } else {
      if (result.message) {
        addToast(result.message, 'warning');
      }
    }
  }, [grid, stats, selectedTool, gameStarted, isConsoleOpen, buildRotation, addToast]);

  const handleTileClickRef = useRef(handleTileClick);
  useEffect(() => { handleTileClickRef.current = handleTileClick; }, [handleTileClick]);
  const stableHandleTileClick = useCallback((x: number, y: number, variant: number) => {
    handleTileClickRef.current(x, y, variant);
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-indigo-950 flex flex-col">
      <div className="flex-1 relative overflow-hidden">
        <IsoMap 
          grid={grid} 
          onTileClick={stableHandleTileClick} 
          selectedTool={selectedTool} 
          onSelectTool={setSelectedTool} 
          time={stats.time} 
          weather={stats.weather}
          activeEvents={stats.activeEvents}
          isLocked={isPanelOpen || isConsoleOpen}
          rotationIndex={viewRotation}
          buildRotation={buildRotation}
        />
      </div>
      
      {!gameStarted && <StartScreen onStart={handleStartGame} />}
      
      {gameStarted && (
        <UIOverlay 
          stats={stats} 
          selectedTool={selectedTool} 
          onSelectTool={setSelectedTool} 
          currentGoal={currentGoal} 
          newsFeed={newsFeed} 
          grid={grid} 
          onPanelStateChange={setIsPanelOpen}
          onRotateView={handleRotateView}
          onRotateBuilding={handleRotateBuilding}
          onUnlockTech={handleUnlockTech}
          autosaving={autosaving || isManualSaving}
          activeTab={activeTab}
          onActiveTabChange={setActiveTab}
          onManualSave={handleManualSave}
        />
      )}

      <WizardConsole 
        stats={stats} 
        grid={grid} 
        isOpen={isConsoleOpen} 
        onClose={() => setIsConsoleOpen(false)} 
        onCommand={(cmd, args) => {
          if (cmd === 'weather') setStats(p => ({ ...p, weather: args[0] as any || 'rain' }));
        }} 
      />

      <ToastContainer toasts={toasts} onClose={(id) => setToasts(t => t.filter(x => x.id !== id))} />
    </div>
  );
}

export default App;
