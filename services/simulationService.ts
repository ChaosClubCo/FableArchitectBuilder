
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { Grid, CityStats, BuildingType, TileData } from '../types';
import { BUILDINGS, GRID_SIZE } from '../constants';
import { EventService } from './eventService';

export class SimulationService {
  /**
   * Processes one logical time step of the kingdom simulation.
   */
  static calculateTick(grid: Grid, stats: CityStats): { newStats: CityStats, newGrid: Grid } {
    let incomeTotal = 0;
    let maintenanceTotal = 0;
    let popGrowth = 0;
    let manaSupply = 0;
    let essenceSupply = 0;
    let manaUsed = 0;
    let essenceUsed = 0;
    let totalHappiness = 0;
    let residentialCount = 0;

    // Handle Event Lifecycle
    let activeEvents = stats.activeEvents.map(e => ({ ...e, duration: e.duration - 1 })).filter(e => e.duration > 0);
    
    // Chance to trigger new event if none are active or just randomly
    if (activeEvents.length === 0 && Math.random() < 0.02) {
      activeEvents.push(EventService.getRandomEvent());
    } else if (!activeEvents.find(e => e.type.startsWith('mana_drought')) && Math.random() < 0.01) {
      activeEvents.push(EventService.getManaDroughtWarning());
    }

    // Check for transitions (warning -> drought)
    const warningIndex = activeEvents.findIndex(e => e.type === 'mana_drought_warning' && e.duration <= 0);
    if (warningIndex !== -1) {
      activeEvents.splice(warningIndex, 1);
      activeEvents.push(EventService.getManaDrought());
    }

    // Aggregate Effects
    const aggregateEffects = {
      incomeMultiplier: 1.0,
      happinessBonus: 0,
      manaMultiplier: 1.0,
      essenceMultiplier: 1.0,
      populationGrowthMultiplier: 1.0,
      maintenanceMultiplier: 1.0,
    };

    // Apply Weather Effects
    if (stats.weather === 'rain') {
      aggregateEffects.essenceMultiplier *= 1.25; // 25% essence boost during rain
      aggregateEffects.happinessBonus -= 5;       // slight gloom
    } else if (stats.weather === 'storm') {
      aggregateEffects.manaMultiplier *= 1.5;     // 50% mana boost during storm
      aggregateEffects.essenceMultiplier *= 0.75; // 25% penalty to essence collection
      aggregateEffects.happinessBonus -= 15;      // larger gloom
      aggregateEffects.incomeMultiplier *= 0.8;   // less shopping
    }

    activeEvents.forEach(event => {
      if (event.effects.incomeMultiplier) aggregateEffects.incomeMultiplier *= event.effects.incomeMultiplier;
      if (event.effects.happinessBonus) aggregateEffects.happinessBonus += event.effects.happinessBonus;
      if (event.effects.manaMultiplier) aggregateEffects.manaMultiplier *= event.effects.manaMultiplier;
      if (event.effects.essenceMultiplier) aggregateEffects.essenceMultiplier *= event.effects.essenceMultiplier;
      if (event.effects.populationGrowthMultiplier) aggregateEffects.populationGrowthMultiplier *= event.effects.populationGrowthMultiplier;
      if (event.effects.maintenanceMultiplier) aggregateEffects.maintenanceMultiplier *= event.effects.maintenanceMultiplier;
    });

    // Spatial coverage maps
    const coverage = {
      guards: Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(false)),
      mages: Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(false)),
      wisdom: Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(false)),
      grandAcademy: Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(false)),
      pollution: Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(false)),
      nature: Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(false)),
      sweets: Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(false)), // Bakery boost
      prosperity: Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(false)), // Market Square boost
      cosmic: Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(false)), // Observatory boost
      efficiency: Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(false)), // Clocktower boost
    };

    // Pre-pass: Calculate total utility supply and service coverage
    grid.forEach(row => row.forEach(tile => {
      const config = BUILDINGS[tile.buildingType];
      if (!config) return;

      if (tile.buildingType === BuildingType.PowerPlant) {
        let output = 120 * tile.level * aggregateEffects.manaMultiplier;
        manaSupply += output;
      }
      
      if (tile.buildingType === BuildingType.WaterTower) essenceSupply += 100 * tile.level * aggregateEffects.essenceMultiplier;
      if (tile.buildingType === BuildingType.DruidCircle) essenceSupply += 40 * tile.level * aggregateEffects.essenceMultiplier;
      
      maintenanceTotal += config.maintenance * tile.level * aggregateEffects.maintenanceMultiplier;

      if (config.serviceRadius) {
        const radius = config.serviceRadius + (tile.level - 1);
        this.applyCoverage(coverage, tile.x, tile.y, radius, tile.buildingType);
      }
      
      if (tile.buildingType === BuildingType.Industrial || tile.buildingType === BuildingType.LumberMill) {
        this.applyCoverage(coverage, tile.x, tile.y, 3, tile.buildingType);
      }
    }));

    // Main pass: Apply logic to each tile
    const newGrid = grid.map((row, y) => row.map((tile, x) => {
      if (tile.buildingType === BuildingType.None || tile.buildingType === BuildingType.Road) {
        if (tile.happiness === 100 && tile.hasMana && tile.hasEssence) return tile;
        return { ...tile, happiness: 100, hasMana: true, hasEssence: true };
      }

      const config = BUILDINGS[tile.buildingType];
      const mReq = config.manaReq * tile.level;
      const eReq = config.essenceReq * tile.level;

      const hasMana = (manaUsed + mReq) <= manaSupply;
      const hasEssence = (essenceUsed + eReq) <= essenceSupply;

      if (hasMana) manaUsed += mReq;
      if (hasEssence) essenceUsed += eReq;

      // Happiness logic: Multi-factor weighted system
      let happiness = 75 + aggregateEffects.happinessBonus; // Baseline + Event Bonus
      
      if (!hasMana) happiness -= 40;
      if (!hasEssence) happiness -= 40;
      
      if (tile.buildingType === BuildingType.Residential) {
        residentialCount++;
        
        // Services
        happiness += coverage.guards[y][x] ? 15 : -20;
        happiness += coverage.mages[y][x] ? 15 : -15;
        
        // Magic Academy provides better wisdom coverage than a regular school
        if (coverage.wisdom[y][x]) {
          happiness += coverage.grandAcademy[y][x] ? 25 : 20;
        }

        happiness += coverage.nature[y][x] ? 20 : 0;
        happiness += coverage.sweets[y][x] ? 12 : 0; 
        happiness += coverage.prosperity[y][x] ? 15 : 0; // Market Square unique effect
        happiness += coverage.cosmic[y][x] ? 10 : 0; // Observatory unique effect
        
        // Proximity penalties for industrial pollution (Mines & Lumber Mills)
        if (coverage.pollution[y][x]) happiness -= 30;
      }

      happiness = Math.max(0, Math.min(100, happiness));
      totalHappiness += happiness;

      // Economic output is throttled by happiness and utility availability
      // Clocktower (Efficiency) provides a flat 20% multiplier to production
      const efficiencyMultiplier = coverage.efficiency[y][x] ? 1.2 : 1.0;
      const effectiveness = ((hasMana && hasEssence) ? (0.2 + (happiness / 100) * 0.8) : 0.1) * efficiencyMultiplier;
      
      incomeTotal += config.incomeGen * tile.level * effectiveness * aggregateEffects.incomeMultiplier;
      popGrowth += config.popGen * tile.level * effectiveness * aggregateEffects.populationGrowthMultiplier;

      const hasGuards = coverage.guards[y][x];
      const hasMagicSafety = coverage.mages[y][x];
      const hasWisdom = coverage.wisdom[y][x];

      if (
        tile.hasMana === hasMana &&
        tile.hasEssence === hasEssence &&
        tile.hasGuards === hasGuards &&
        tile.hasMagicSafety === hasMagicSafety &&
        tile.hasWisdom === hasWisdom &&
        tile.happiness === happiness
      ) {
        return tile;
      }

      return { 
        ...tile, 
        hasMana, 
        hasEssence, 
        hasGuards,
        hasMagicSafety,
        hasWisdom,
        happiness 
      };
    }));

    const avgHappiness = residentialCount > 0 ? totalHappiness / residentialCount : 100;

    // Only create a new grid if at least one tile changed
    let gridChanged = false;
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        if (newGrid[y][x] !== grid[y][x]) {
          gridChanged = true;
          break;
        }
      }
      if (gridChanged) break;
    }

    return {
      newGrid: gridChanged ? newGrid : grid,
      newStats: {
        ...stats,
        money: stats.money + Math.floor(incomeTotal - maintenanceTotal),
        population: Math.max(0, stats.population + Math.floor(popGrowth)),
        happiness: Math.floor(avgHappiness),
        manaSupply,
        essenceSupply,
        manaUsage: manaUsed,
        essenceUsage: essenceUsed,
        incomeTotal: Math.floor(incomeTotal),
        maintenanceTotal: Math.floor(maintenanceTotal),
        day: stats.day + 1,
        time: (stats.time + 0.5) % 24,
        activeEvents: activeEvents
      }
    };
  }

  private static applyCoverage(coverage: any, cx: number, cy: number, r: number, type: BuildingType) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        const nx = cx + dx;
        const ny = cy + dy;
        if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE) {
          if (Math.sqrt(dx * dx + dy * dy) <= r) {
            if (type === BuildingType.PoliceStation) coverage.guards[ny][nx] = true;
            if (type === BuildingType.FireStation) coverage.mages[ny][nx] = true;
            if (type === BuildingType.School || type === BuildingType.Library || type === BuildingType.MagicAcademy) coverage.wisdom[ny][nx] = true;
            if (type === BuildingType.MagicAcademy) coverage.grandAcademy[ny][nx] = true;
            if (type === BuildingType.Park || type === BuildingType.LuminaBloom || type === BuildingType.DruidCircle) coverage.nature[ny][nx] = true;
            if (type === BuildingType.Bakery) coverage.sweets[ny][nx] = true;
            if (type === BuildingType.MarketSquare) coverage.prosperity[ny][nx] = true;
            if (type === BuildingType.GrandObservatory) coverage.cosmic[ny][nx] = true;
            if (type === BuildingType.Clocktower) coverage.efficiency[ny][nx] = true;
            if (type === BuildingType.Industrial || type === BuildingType.LumberMill) coverage.pollution[ny][nx] = true;
          }
        }
      }
    }
  }
}
