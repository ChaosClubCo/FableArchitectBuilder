
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { CityStats, TechNode } from '../types';
import { TECH_TREE, ResearchService } from '../services/researchService';

interface ResearchPanelProps {
  stats: CityStats;
  onUnlock: (techId: string) => void;
  onClose: () => void;
}

const ResearchPanel: React.FC<ResearchPanelProps> = ({ stats, onUnlock, onClose }) => {
  const isUnlocked = (id: string) => stats.unlockedTechs.includes(id);
  const canUnlock = (node: TechNode) => {
    if (isUnlocked(node.id)) return false;
    if (stats.wisdom < node.cost) return false;
    return node.prerequisites.every(isUnlocked);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-2 sm:p-6 bg-slate-950/90 backdrop-blur-xl animate-in zoom-in-95">
      <div className="w-full max-w-5xl h-full max-h-[90vh] md:max-h-[80vh] bg-indigo-950 border-2 md:border-4 border-amber-600/50 rounded-2xl md:rounded-[2rem] flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden font-serif">
        
        {/* Header */}
        <div className="p-4 md:p-8 bg-black/40 border-b border-white/10 flex justify-between items-center">
          <div>
            <h2 className="text-xl md:text-4xl font-black text-[#fbbf24] uppercase tracking-widest drop-shadow-md">The Vault of Keys</h2>
            <p className="text-amber-400 font-mono text-[10px] md:text-xs mt-1 md:mt-2">Stored Wisdom: {stats.wisdom} ✨</p>
          </div>
          <button onClick={onClose} className="text-white hover:text-amber-500 text-3xl md:text-4xl">&times;</button>
        </div>

        {/* Tree Container */}
        <div className="flex-1 overflow-auto p-4 md:p-12 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed relative no-scrollbar">
          <div className="flex flex-col gap-8 md:gap-12 items-center min-w-max md:min-w-0 pb-8">
            {[0, 50, 200, 500, 1000, 2500].map((tierCost) => {
              const nodes = TECH_TREE.filter(n => n.cost >= tierCost && n.cost < (tierCost === 2500 ? 99999 : tierCost * 2.5));
              if (nodes.length === 0) return null;

              return (
                <div key={tierCost} className="flex gap-4 md:gap-8 justify-center flex-wrap relative">
                  {nodes.map(node => {
                    const unlocked = isUnlocked(node.id);
                    const purchasable = canUnlock(node);

                    return (
                      <div 
                        key={node.id} 
                        className={`w-48 md:w-64 p-3 md:p-5 rounded-xl border-2 transition-all flex flex-col gap-1 md:gap-2 relative z-10 ${
                          unlocked ? 'bg-emerald-900/80 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]' :
                          purchasable ? 'bg-indigo-900/90 border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.3)] scale-100 md:scale-105 cursor-pointer hover:bg-indigo-800' :
                          'bg-slate-900/50 border-white/5 opacity-60 grayscale'
                        }`}
                        onClick={() => purchasable && onUnlock(node.id)}
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-2xl md:text-3xl">{node.icon}</span>
                          <span className={`text-[8px] md:text-xs font-black px-1.5 md:px-2 py-0.5 md:py-1 rounded ${unlocked ? 'bg-emerald-500/20 text-emerald-300' : 'bg-black/40 text-white'}`}>
                            {unlocked ? 'UNLOCKED' : `${node.cost} ✨`}
                          </span>
                        </div>
                        <h3 className={`text-xs md:text-base font-bold leading-tight ${unlocked ? 'text-emerald-100' : 'text-white'}`}>{node.name}</h3>
                        <p className="text-[8px] md:text-[10px] text-slate-300 leading-tight"> {node.description}</p>
                        
                        {node.prerequisites.length > 0 && (
                          <div className="absolute -top-8 md:-top-12 left-1/2 w-px h-8 md:h-12 bg-white/10 -z-10" />
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResearchPanel;
