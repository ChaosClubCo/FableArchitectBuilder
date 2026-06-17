
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { CityStats, Grid } from '../types';

interface AdvisorPanelProps {
  stats: CityStats;
  grid: Grid;
  onClose: () => void;
}

const AdvisorPanel: React.FC<AdvisorPanelProps> = ({ stats, grid, onClose }) => {
  const [response, setResponse] = useState<string>('Summoning the Keeper of Keys...');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const analyzeRealm = async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const buildings = grid.flat().filter(t => t.buildingType !== 'None');
      const buildingCounts = buildings.reduce((acc, b) => {
        acc[b.buildingType] = (acc[b.buildingType] || 0) + 1;
        return acc;
      }, {} as any);

      const prompt = `
        You are the Keeper of Keys in KeysKingdom. 
        Analyze the state of the Sovereign's realm and provide 3-4 magical prophecies or strategic decrees.
        
        Kingdom State:
        - Gold in Treasury: ${stats.money}g
        - Loyal Subjects: ${stats.population}
        - Public Mood: ${stats.happiness}%
        - Mana Reserves: ${stats.manaUsage}/${stats.manaSupply}
        - Essence Reserves: ${stats.essenceUsage}/${stats.essenceSupply}
        - Kingdom Structures: ${JSON.stringify(buildingCounts)}
        - Active Events: ${stats.activeEvents.map(e => e.label).join(', ') || 'None'}
        
        Keep your tone mystical, authoritative, and helpful. Use words like "Sovereign", "Keys", "Mana", and "Unlock".
      `;

      try {
        const result = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt,
        });
        setResponse(result.text || "The Oracle's lock is stuck. Check your connectivity spells.");
      } catch (e) {
        setResponse("A dark force blocks our magical communication. Check your connectivity spells.");
      } finally {
        setLoading(false);
      }
    };

    analyzeRealm();
  }, [stats, grid]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-6 bg-slate-950/90 backdrop-blur-xl pointer-events-auto">
      <div className="w-full max-w-xl max-h-[90vh] md:max-h-none bg-indigo-950/95 border-2 border-amber-600/70 rounded-2xl md:rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,1),0_0_50px_rgba(251,191,36,0.1)] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-500 font-serif ring-1 ring-amber-500/30">
        <div className="p-4 md:p-8 border-b border-amber-900/40 flex justify-between items-center bg-black/20">
          <div>
            <h3 className="text-xl md:text-3xl font-black text-[#fbbf24] italic tracking-tight drop-shadow-md">Keeper of Keys</h3>
            <p className="text-[8px] md:text-[10px] text-cyan-400 font-bold tracking-[0.2em] uppercase opacity-80">Unlocking Arcane Wisdom...</p>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 md:w-12 md:h-12 hover:bg-white/10 rounded-full transition-all text-amber-500 flex items-center justify-center text-xl md:text-2xl border border-amber-900/30 hover:rotate-90"
          >
            ✕
          </button>
        </div>
        
        <div className="p-6 md:p-10 flex-1 overflow-y-auto no-scrollbar font-serif">
          {loading ? (
            <div className="space-y-4 md:space-y-6">
              <div className="h-4 bg-white/10 rounded-full animate-pulse w-3/4" />
              <div className="h-4 bg-white/10 rounded-full animate-pulse w-full" />
              <div className="h-4 bg-white/10 rounded-full animate-pulse w-5/6" />
              <div className="h-4 bg-white/10 rounded-full animate-pulse w-2/3" />
            </div>
          ) : (
            <div className="text-white leading-relaxed text-sm md:text-lg whitespace-pre-wrap italic opacity-95 first-letter:text-3xl md:first-letter:text-4xl first-letter:font-black first-letter:text-[#fbbf24] first-letter:mr-1">
              {response}
            </div>
          )}
        </div>

        <div className="p-4 md:p-8 border-t border-amber-900/40 bg-black/30 flex justify-center">
          <button 
            onClick={onClose}
            className="w-full sm:w-auto px-8 md:px-16 py-3 md:py-5 bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-500 hover:to-amber-700 text-slate-950 rounded-xl md:rounded-2xl text-[10px] md:text-sm font-black uppercase tracking-[0.3em] transition-all shadow-[0_10px_30px_rgba(245,158,11,0.4)] active:scale-95 border-b-2 md:border-b-4 border-amber-900 active:border-b-0"
          >
            Thy Decree is Heard
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvisorPanel;
