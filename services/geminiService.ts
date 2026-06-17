
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI, Type } from "@google/genai";
import { AIGoal, BuildingType, CityStats, Grid, NewsItem } from "../types";

const MODEL_NAME = 'gemini-3-flash-preview';

const goalSchema = {
  type: Type.OBJECT,
  properties: {
    description: {
      type: Type.STRING,
      description: "A mystical, fairytale-themed description of the quest from the Royal Wizard of KeysKingdom.",
    },
    targetType: {
      type: Type.STRING,
      enum: ["population", "money", "building_count", "happiness", "mana_surplus", "essence_surplus", "diversity"],
      description: "The metric the player must reach. 'mana_surplus' and 'essence_surplus' refer to unused/available magic resources. 'diversity' refers to count of unique building types.",
    },
    targetValue: {
      type: Type.INTEGER,
      description: "Target numeric value. Keep it challenging but reachable based on current stats.",
    },
    buildingType: {
      type: Type.STRING,
      enum: Object.values(BuildingType),
      description: "Required building type if targetType is building_count.",
    },
    reward: {
      type: Type.INTEGER,
      description: "Gold reward for completion (typically 500-2000).",
    },
  },
  required: ['description', 'targetType', 'targetValue', 'reward'],
};

const newsSchema = {
  type: Type.OBJECT,
  properties: {
    text: { type: Type.STRING, description: "A whimsical news headline for KeysKingdom." },
    type: { type: Type.STRING, enum: ["positive", "negative", "neutral", "urgent"] },
  },
  required: ['text', 'type'],
};

/**
 * Generates a mystical quest from the Royal Wizard
 */
export const generateCityGoal = async (stats: CityStats, grid: Grid): Promise<AIGoal | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const counts: Record<string, number> = {};
  const uniqueTypes = new Set<string>();
  grid.flat().forEach(tile => {
    if (tile.buildingType !== BuildingType.None) {
      counts[tile.buildingType] = (counts[tile.buildingType] || 0) + 1;
      if (tile.buildingType !== BuildingType.Road) uniqueTypes.add(tile.buildingType);
    }
  });

  const prompt = `
    Context:
    Day: ${stats.day}
    Gold: ${stats.money}
    Population: ${stats.population}
    Buildings Counts: ${JSON.stringify(counts)}
    Unique Buildings Count: ${uniqueTypes.size}
    Mana: ${stats.manaUsage}/${stats.manaSupply} (Available: ${stats.manaSupply - stats.manaUsage})
    Essence: ${stats.essenceUsage}/${stats.essenceSupply} (Available: ${stats.essenceSupply - stats.essenceUsage})
    Kingdom Mood: ${stats.happiness}%
    Active Events: ${stats.activeEvents.map(e => `${e.label} (${e.type})`).join(', ') || 'None'}
    
    You are the Ancient Royal Wizard of KeysKingdom. Create a specific, magical decree or prophecy for the Sovereign to fulfill.
    Vary the objectives significantly. You can choose:
    1. Resource Management: Reach a certain surplus of unused Mana or Essence.
    2. Architectural Diversity: Build at least X different types of unique structures.
    3. Expansion: Reach a population threshold.
    4. Prosperity: Reach a treasury gold count.
    5. Specific Structures: Construct a certain number of specific buildings.
    6. Contentment: Reach a high average happiness level.
    
    The description must be flavorful, high-fantasy, and address the current state of the kingdom. 
    Ensure the targetValue is a step up from the current state but not impossible.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: goalSchema,
      },
    });

    if (response.text) {
      const data = JSON.parse(response.text.trim());
      return { 
        ...data, 
        id: Math.random().toString(36).substring(7),
        completed: false 
      };
    }
  } catch (error) {
    console.error("Failed to generate quest:", error);
  }
  return null;
};

/**
 * Generates atmospheric world-building news items
 */
export const generateNewsEvent = async (stats: CityStats, recentAction: string | null): Promise<NewsItem | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    KeysKingdom Snapshot: Pop ${stats.population}, Gold ${stats.money}, Day ${stats.day}.
    Recent Event: ${recentAction || 'The sun rises over the valley.'}
    Active Phenomena: ${stats.activeEvents.map(e => e.label).join(', ') || 'None'}
    
    Generate a one-sentence news scroll update for the herald's parchment in KeysKingdom.
    Keep the tone whimsical and atmospheric.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: newsSchema,
      },
    });

    if (response.text) {
      const data = JSON.parse(response.text.trim());
      return {
        id: Math.random().toString(36).substring(7),
        text: data.text,
        type: data.type,
        timestamp: Date.now()
      };
    }
  } catch (error) {
    console.error("Failed to generate news:", error);
  }
  return null;
};
