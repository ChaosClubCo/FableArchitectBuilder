
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { BuildingType, TechNode, CityStats } from '../types';

export const TECH_TREE: TechNode[] = [
  {
    id: 'basic_infra',
    name: 'Town Infrastructure',
    description: 'Knowledge of roads and basic sanitation.',
    cost: 0,
    unlocks: [BuildingType.Road, BuildingType.Residential, BuildingType.WaterTower],
    prerequisites: [],
    icon: '🏗️'
  },
  {
    id: 'commerce',
    name: 'Mercantile Exchange',
    description: 'Establishes trade routes and taxation.',
    cost: 50,
    unlocks: [BuildingType.Commercial, BuildingType.MarketSquare, BuildingType.Bakery],
    prerequisites: ['basic_infra'],
    icon: '⚖️'
  },
  {
    id: 'arcane_basics',
    name: 'Arcane Fundamentals',
    description: 'Harnessing ambient mana for power.',
    cost: 100,
    unlocks: [BuildingType.PowerPlant, BuildingType.LuminaBloom],
    prerequisites: ['basic_infra'],
    icon: '🔮'
  },
  {
    id: 'industry',
    name: 'Industrialization',
    description: 'Heavy machinery and resource extraction.',
    cost: 200,
    unlocks: [BuildingType.Industrial, BuildingType.LumberMill, BuildingType.Windmill],
    prerequisites: ['commerce'],
    icon: '⚒️'
  },
  {
    id: 'civic_duty',
    name: 'Civic Duty',
    description: 'Safety and order for the populace.',
    cost: 300,
    unlocks: [BuildingType.PoliceStation, BuildingType.FireStation, BuildingType.School],
    prerequisites: ['commerce', 'arcane_basics'],
    icon: '🛡️'
  },
  {
    id: 'nature_magic',
    name: 'Druidic Pacts',
    description: 'Communing with the ancient spirits.',
    cost: 500,
    unlocks: [BuildingType.Park, BuildingType.DruidCircle],
    prerequisites: ['arcane_basics'],
    icon: '🌿'
  },
  {
    id: 'advanced_arcana',
    name: 'High Magic',
    description: 'The deepest secrets of the cosmos.',
    cost: 1000,
    unlocks: [BuildingType.MagicAcademy, BuildingType.GrandObservatory, BuildingType.Library],
    prerequisites: ['civic_duty', 'nature_magic'],
    icon: '✨'
  },
  {
    id: 'monarchy',
    name: 'Divine Right',
    description: 'The ultimate symbol of sovereignty.',
    cost: 2500,
    unlocks: [BuildingType.Landmark, BuildingType.Clocktower],
    prerequisites: ['industry', 'advanced_arcana'],
    icon: '👑'
  }
];

export class ResearchService {
  static getAvailableTechs(unlocked: string[], wisdom: number): TechNode[] {
    return TECH_TREE.filter(tech => {
      // Not already unlocked
      if (unlocked.includes(tech.id)) return false;
      // Prereqs met
      const prereqsMet = tech.prerequisites.every(id => unlocked.includes(id));
      return prereqsMet;
    });
  }

  static isBuildingUnlocked(type: BuildingType, unlockedIds: string[]): boolean {
    // Special cases
    if (type === BuildingType.None || type === BuildingType.Upgrade) return true;
    
    // Find which tech unlocks this building
    const tech = TECH_TREE.find(t => t.unlocks.includes(type));
    
    // If no tech requires it, it's unlocked by default (fallback)
    // But in our tree, everything is covered. 
    // If 'basic_infra' is unlocked (which is default), then Road/Res/Water are available.
    if (!tech) return true;
    
    return unlockedIds.includes(tech.id);
  }

  static unlock(techId: string, stats: CityStats): { success: boolean, newStats: CityStats, message: string } {
    const tech = TECH_TREE.find(t => t.id === techId);
    if (!tech) return { success: false, newStats: stats, message: 'Unknown Technology' };

    if (stats.wisdom < tech.cost) {
      return { success: false, newStats: stats, message: `Insufficient Wisdom. Need ${tech.cost}.` };
    }

    return {
      success: true,
      newStats: {
        ...stats,
        wisdom: stats.wisdom - tech.cost,
        unlockedTechs: [...stats.unlockedTechs, techId]
      },
      message: `Discovered ${tech.name}!`
    };
  }
}
