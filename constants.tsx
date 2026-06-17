
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { BuildingConfig, BuildingType } from './types';

export const GRID_SIZE = 25;
export const MAX_LEVEL = 3;
export const TICK_RATE_MS = 2500;
export const INITIAL_MONEY = 3000;

export const BUILDINGS: Record<BuildingType, BuildingConfig> = {
  [BuildingType.None]: {
    type: BuildingType.None, cost: 0, maintenance: 0, name: 'Demolish', description: 'Clear the land of structures.', color: '#ef4444', popGen: 0, incomeGen: 0, manaReq: 0, essenceReq: 0
  },
  [BuildingType.Upgrade]: {
    type: BuildingType.Upgrade, cost: 0, maintenance: 0, name: 'Enhance', description: 'Infuse a structure with higher magical resonance.', color: '#d946ef', popGen: 0, incomeGen: 0, manaReq: 0, essenceReq: 0
  },
  [BuildingType.Road]: {
    type: BuildingType.Road, cost: 15, maintenance: 1, name: 'Cobblestone', description: 'A royal path for your subjects to travel.', color: '#94a3b8', popGen: 0, incomeGen: 0, manaReq: 0, essenceReq: 0
  },
  [BuildingType.Residential]: {
    type: BuildingType.Residential, cost: 120, maintenance: 4, name: 'Cottage', description: 'Quaint homes for your loyal subjects.', color: '#fecaca', popGen: 6, incomeGen: 0, manaReq: 1, essenceReq: 1
  },
  [BuildingType.Commercial]: {
    type: BuildingType.Commercial, cost: 300, maintenance: 12, name: 'Tavern', description: 'Where ale flows and stories are told.', color: '#fde68a', popGen: 0, incomeGen: 35, manaReq: 2, essenceReq: 2
  },
  [BuildingType.Industrial]: {
    type: BuildingType.Industrial, cost: 600, maintenance: 35, name: 'Mine', description: 'Extract jewels and gold from the earth.', color: '#64748b', popGen: 0, incomeGen: 90, manaReq: 5, essenceReq: 3
  },
  [BuildingType.Park]: {
    type: BuildingType.Park, cost: 200, maintenance: 8, name: 'Enchanted Forest', description: 'A grove pulsing with ancient spirits.', color: '#22c55e', popGen: 2, incomeGen: 0, manaReq: 0, essenceReq: 2, serviceRadius: 4
  },
  [BuildingType.PowerPlant]: {
    type: BuildingType.PowerPlant, cost: 1500, maintenance: 120, name: 'Wizard Tower', description: 'The source of your kingdom\'s Mana.', color: '#8b5cf6', popGen: 0, incomeGen: 0, manaReq: 0, essenceReq: 4, isUtility: true
  },
  [BuildingType.WaterTower]: {
    type: BuildingType.WaterTower, cost: 900, maintenance: 60, name: 'Ancient Well', description: 'Draws Sacred Essence from deep veins.', color: '#60a5fa', popGen: 0, incomeGen: 0, manaReq: 4, essenceReq: 0, isUtility: true
  },
  [BuildingType.PoliceStation]: {
    type: BuildingType.PoliceStation, cost: 700, maintenance: 40, name: 'Guard Post', description: 'Knights stationed to keep the peace.', color: '#3b82f6', popGen: 0, incomeGen: 0, manaReq: 3, essenceReq: 2, serviceRadius: 5
  },
  [BuildingType.FireStation]: {
    type: BuildingType.FireStation, cost: 700, maintenance: 40, name: 'Mage Sanctum', description: 'Wards off dragon-fire and curses.', color: '#f43f5e', popGen: 0, incomeGen: 0, manaReq: 5, essenceReq: 8, serviceRadius: 5
  },
  [BuildingType.School]: {
    type: BuildingType.School, cost: 1000, maintenance: 70, name: 'Alchemy Academy', description: 'Education in the mystic arts.', color: '#10b981', popGen: 0, incomeGen: 0, manaReq: 10, essenceReq: 5, serviceRadius: 6
  },
  [BuildingType.Landmark]: {
    type: BuildingType.Landmark, cost: 6000, maintenance: 300, name: 'Great Castle', description: 'The pinnacle of your sovereignty.', color: '#f59e0b', popGen: 20, incomeGen: 250, manaReq: 25, essenceReq: 20
  },
  [BuildingType.LumberMill]: {
    type: BuildingType.LumberMill, cost: 450, maintenance: 25, name: 'Lumber Mill', description: 'Processing magical timber for export.', color: '#78350f', popGen: 0, incomeGen: 65, manaReq: 2, essenceReq: 2
  },
  [BuildingType.Bakery]: {
    type: BuildingType.Bakery, cost: 180, maintenance: 6, name: 'Bakery', description: 'Baking mana-infused sourdough.', color: '#fb923c', popGen: 1, incomeGen: 20, manaReq: 1, essenceReq: 1, serviceRadius: 3
  },
  [BuildingType.Library]: {
    type: BuildingType.Library, cost: 800, maintenance: 50, name: 'Great Library', description: 'Storage of the realm\'s scrolls.', color: '#2563eb', popGen: 0, incomeGen: 0, manaReq: 8, essenceReq: 2, serviceRadius: 7
  },
  [BuildingType.LuminaBloom]: {
    type: BuildingType.LuminaBloom, cost: 250, maintenance: 10, name: 'Lumina Bloom', description: 'Radiant flowers that soothe souls.', color: '#d946ef', popGen: 3, incomeGen: 0, manaReq: 0, essenceReq: 3, serviceRadius: 4
  },
  [BuildingType.Windmill]: {
    type: BuildingType.Windmill, cost: 400, maintenance: 20, name: 'Windmill', description: 'Grinds stardust into golden flour. A clean industry for the realm.', color: '#fef3c7', popGen: 0, incomeGen: 60, manaReq: 2, essenceReq: 2
  },
  [BuildingType.MarketSquare]: {
    type: BuildingType.MarketSquare, cost: 1100, maintenance: 55, name: 'Market Square', description: 'A bustling hub for planar merchants. Boosts local prosperity.', color: '#fbbf24', popGen: 0, incomeGen: 160, manaReq: 6, essenceReq: 4, serviceRadius: 5
  },
  [BuildingType.MagicAcademy]: {
    type: BuildingType.MagicAcademy, cost: 2400, maintenance: 130, name: 'Magic Academy', description: 'Where tomorrow\'s Archmages begin their journey. High prestige and wisdom.', color: '#818cf8', popGen: 0, incomeGen: 0, manaReq: 15, essenceReq: 10, serviceRadius: 8
  },
  [BuildingType.GrandObservatory]: {
    type: BuildingType.GrandObservatory, cost: 1800, maintenance: 90, name: 'Grand Observatory', description: 'Charting the celestial tides. Inspires awe in all who gaze upon the stars.', color: '#4c1d95', popGen: 0, incomeGen: 0, manaReq: 12, essenceReq: 8, serviceRadius: 10
  },
  [BuildingType.Clocktower]: {
    type: BuildingType.Clocktower, cost: 1400, maintenance: 75, name: 'Royal Clocktower', description: 'Synchronizes the rhythms of the realm, boosting productivity.', color: '#78350f', popGen: 0, incomeGen: 0, manaReq: 8, essenceReq: 4, serviceRadius: 5
  },
  [BuildingType.DruidCircle]: {
    type: BuildingType.DruidCircle, cost: 850, maintenance: 30, name: 'Druid Circle', description: 'A sanctuary of natural magic that draws essence from the spirits.', color: '#065f46', popGen: 2, incomeGen: 0, manaReq: 0, essenceReq: 0, serviceRadius: 5, isUtility: true
  },
};

export interface Category {
  id: string;
  name: string;
  icon: string;
  types: BuildingType[];
}

export const CATEGORIES: Category[] = [
  { id: 'abodes', name: 'Abodes', icon: '🏠', types: [BuildingType.Residential] },
  { id: 'treasury', name: 'Treasury', icon: '💰', types: [BuildingType.Commercial, BuildingType.Industrial, BuildingType.LumberMill, BuildingType.Bakery, BuildingType.Windmill, BuildingType.MarketSquare] },
  { id: 'arcane', name: 'Arcane', icon: '🔮', types: [BuildingType.PowerPlant, BuildingType.WaterTower, BuildingType.LuminaBloom, BuildingType.FireStation, BuildingType.DruidCircle] },
  { id: 'society', name: 'Society', icon: '🎓', types: [BuildingType.PoliceStation, BuildingType.School, BuildingType.Library, BuildingType.MagicAcademy, BuildingType.GrandObservatory, BuildingType.Park, BuildingType.Clocktower] },
  { id: 'monuments', name: 'Relics', icon: '🏰', types: [BuildingType.Landmark] },
  { id: 'tools', name: 'Tools', icon: '⚒️', types: [BuildingType.Road, BuildingType.Upgrade, BuildingType.None] }
];
