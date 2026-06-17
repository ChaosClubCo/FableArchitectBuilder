
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { KingdomEvent } from '../types';

export class EventService {
  private static EVENT_POOL: Omit<KingdomEvent, 'id' | 'duration'>[] = [
    {
      type: 'festival',
      label: 'Festival of Lights',
      description: 'The kingdom celebrates with magical lanterns. Happiness and commerce are booming!',
      effects: {
        happinessBonus: 20,
        incomeMultiplier: 1.25,
      },
      visualEffect: 'fireworks',
    },
    {
      type: 'mana_surge',
      label: 'Mana Surge',
      description: 'A rift in the ether has opened. Mana is abundant, but the air is volatile.',
      effects: {
        manaMultiplier: 2.0,
        maintenanceMultiplier: 1.1,
      },
      visualEffect: 'golden_glow',
    },
    {
      type: 'dragon_sighting',
      label: 'Dragon Sighting',
      description: 'A Great Wyrm has been spotted. Citizens are terrified, and guards are on high alert.',
      effects: {
        happinessBonus: -25,
        maintenanceMultiplier: 1.5,
      },
      visualEffect: 'shadows',
    },
    {
      type: 'royal_visit',
      label: 'Royal Visit',
      description: 'The High Monarch is visiting. Prestige and trade are at an all-time high.',
      effects: {
        incomeMultiplier: 1.5,
        maintenanceMultiplier: 1.2,
      },
      visualEffect: 'golden_glow',
    },
    {
      type: 'plague_of_shadows',
      label: 'Plague of Shadows',
      description: 'A dark mist creeps through the streets. Growth has slowed and spirits are low.',
      effects: {
        populationGrowthMultiplier: 0.5,
        happinessBonus: -15,
      },
      visualEffect: 'shadows',
    },
    {
      type: 'golden_harvest',
      label: 'Golden Harvest',
      description: 'The enchanted fields are yielding record crops. Prosperity for all!',
      effects: {
        incomeMultiplier: 1.3,
        populationGrowthMultiplier: 1.2,
      },
      visualEffect: 'golden_glow',
    }
  ];

  static getRandomEvent(): KingdomEvent {
    const base = this.EVENT_POOL[Math.floor(Math.random() * this.EVENT_POOL.length)];
    return {
      ...base,
      id: Math.random().toString(36).substr(2, 9),
      duration: 15 + Math.floor(Math.random() * 20), // 15-35 ticks
    };
  }

  static getManaDrought(): KingdomEvent {
    return {
      id: 'mana_drought',
      type: 'mana_drought',
      label: 'Mana Drought',
      description: 'The ley lines have withered. Mana production is severely crippled.',
      duration: 12,
      effects: {
        manaMultiplier: 0.25,
        happinessBonus: -10,
      },
      visualEffect: 'none',
    };
  }

  static getManaDroughtWarning(): KingdomEvent {
    return {
      id: 'mana_drought_warning',
      type: 'mana_drought_warning',
      label: 'Unstable Ley Lines',
      description: 'The ground trembles as magical energy fluctuates. A drought is imminent.',
      duration: 6,
      effects: {},
      visualEffect: 'none',
    };
  }
}
