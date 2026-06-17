
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { Grid, BuildingType, CityStats } from '../types';
import { BUILDINGS, MAX_LEVEL } from '../constants';

export interface ActionResponse {
  newGrid: Grid;
  newStats: CityStats;
  success: boolean;
  message: string;
  type: 'positive' | 'negative' | 'neutral';
}

export class ActionService {
  /**
   * Dispatches the correct kingdom action based on tool selection
   */
  static execute(tool: BuildingType, grid: Grid, stats: CityStats, x: number, y: number, variantIndex: number = 0): ActionResponse {
    switch (tool) {
      case BuildingType.Upgrade:
        return this.upgradeTile(grid, stats, x, y);
      case BuildingType.None:
        return this.bulldozeTile(grid, stats, x, y);
      default:
        return this.buildTile(grid, stats, x, y, tool, variantIndex);
    }
  }

  static getUpgradeCost(bType: BuildingType, currentLevel: number): number {
    const baseCost = BUILDINGS[bType].cost;
    return Math.floor(baseCost * (currentLevel + 1) * 1.8);
  }

  static upgradeTile(grid: Grid, stats: CityStats, x: number, y: number): ActionResponse {
    const tile = grid[y][x];
    const bType = tile.buildingType;

    if (bType === BuildingType.None || bType === BuildingType.Road) {
      return { newGrid: grid, newStats: stats, success: false, message: "Only structures can be enhanced.", type: 'neutral' };
    }

    if (tile.level >= MAX_LEVEL) {
      return { newGrid: grid, newStats: stats, success: false, message: "Structure is already at max magical resonance.", type: 'neutral' };
    }

    const cost = this.getUpgradeCost(bType, tile.level);

    if (stats.money < cost) {
      return { newGrid: grid, newStats: stats, success: false, message: `The treasury lacks the ${cost}g required for this rite.`, type: 'negative' };
    }

    const newGrid = grid.map((row, ridx) => ridx === y ? row.map((t, cidx) => cidx === x ? { 
      ...t, 
      level: t.level + 1,
      lastUpgraded: Date.now() // Added timestamp for visual effect triggers
    } : t) : row);
    const newStats = { ...stats, money: stats.money - cost };

    return {
      newGrid, newStats, success: true,
      message: `${BUILDINGS[bType].name} enhanced to Tier ${tile.level + 1}.`,
      type: 'positive'
    };
  }

  static buildTile(grid: Grid, stats: CityStats, x: number, y: number, tool: BuildingType, variantIndex: number): ActionResponse {
    const tile = grid[y][x];
    const config = BUILDINGS[tool];

    if (tile.buildingType !== BuildingType.None) {
      return { newGrid: grid, newStats: stats, success: false, message: "That land is already occupied.", type: 'neutral' };
    }

    if (stats.money < config.cost) {
      return { newGrid: grid, newStats: stats, success: false, message: `Thy treasury needs ${config.cost}g to establish this ${config.name}.`, type: 'negative' };
    }

    const newGrid = grid.map((row, ridx) => ridx === y ? row.map((t, cidx) => cidx === x ? { 
      ...t, 
      buildingType: tool, 
      level: 1,
      variant: variantIndex
    } : t) : row);
    const newStats = { ...stats, money: stats.money - config.cost };

    return {
      newGrid, newStats, success: true,
      message: `Established ${config.name}.`,
      type: 'positive'
    };
  }

  static bulldozeTile(grid: Grid, stats: CityStats, x: number, y: number): ActionResponse {
    const tile = grid[y][x];
    if (tile.buildingType === BuildingType.None) {
      return { newGrid: grid, newStats: stats, success: false, message: "The land is already clear.", type: 'neutral' };
    }

    const bType = tile.buildingType;
    const baseConfig = BUILDINGS[bType];
    
    // Calculate 35% gold refund
    let refund = 0;
    if (baseConfig && baseConfig.cost > 0) {
      refund += Math.floor(baseConfig.cost * 0.35);
      
      // Also refund 35% of the cost paid for each upgrade tier
      for (let l = 1; l < tile.level; l++) {
        const upgradeCost = this.getUpgradeCost(bType, l);
        refund += Math.floor(upgradeCost * 0.35);
      }
    }

    const newGrid = grid.map((row, ridx) => 
      ridx === y 
        ? row.map((t, cidx) => 
            cidx === x 
              ? { 
                  ...t, 
                  buildingType: BuildingType.None, 
                  level: 1, 
                  variant: undefined, 
                  lastUpgraded: undefined,
                  hasMana: false,
                  hasEssence: false,
                  hasGuards: false,
                  hasMagicSafety: false,
                  hasWisdom: false
                } 
              : t
          ) 
        : row
    );

    const newStats = { ...stats, money: stats.money + refund };

    return {
      newGrid, 
      newStats, 
      success: true,
      message: `${baseConfig ? baseConfig.name : 'Structure'} cleared. Recovered ${refund}g.`,
      type: 'positive'
    };
  }
}
