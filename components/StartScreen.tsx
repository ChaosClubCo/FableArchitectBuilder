
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import SaveLoadModal from './SaveLoadModal';
import { KingdomProfile } from '../services/saveService';
import { soundService } from '../services/soundService';

interface StartScreenProps {
  onStart: (aiEnabled: boolean, profile?: KingdomProfile) => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  const [aiEnabled, setAiEnabled] = useState(true);
  const [showSaves, setShowSaves] = useState(false);

  const handleProfileSelect = (profile: KingdomProfile) => {
    setShowSaves(false);
    soundService.initialize();
    onStart(aiEnabled, profile);
  };

  const handleResume = () => {
    soundService.initialize();
    onStart(aiEnabled);
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-start md:justify-center z-50 text-white font-serif p-4 md:p-6 bg-slate-950/90 backdrop-blur-xl transition-all duration-1000 overflow-y-auto">
      <div className="w-full max-w-lg bg-indigo-950/95 p-6 sm:p-8 md:p-12 rounded-3xl md:rounded-[4rem] border-2 border-amber-500/50 shadow-[0_0_150px_rgba(0,0,0,1),0_0_50px_rgba(251,191,36,0.1)] relative overflow-hidden animate-fade-in ring-1 ring-amber-400/20 my-auto">
        
        {/* Dynamic magic aura glows */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        <div className="relative z-10 text-center">
            <div className="mb-2 px-2">
              <span className="text-amber-500 text-[8px] md:text-xs font-black uppercase tracking-[0.2em] md:tracking-[0.8em] opacity-80 block">
                Kinsley's Kingdom: Arcane Architect
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-4 md:mb-6 bg-gradient-to-b from-amber-100 via-[#fbbf24] to-amber-700 bg-clip-text text-transparent tracking-tighter italic drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] py-2 leading-tight">
              Kinsley's Kingdom
            </h1>
            
            <div className="w-full h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent mb-6 md:mb-12"></div>

            <div className="bg-black/40 p-4 md:p-8 rounded-2xl md:rounded-[2rem] border border-amber-500/20 mb-6 md:mb-8 shadow-inner group transition-all hover:bg-black/60 hover:border-amber-500/40">
              <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex flex-col gap-1 md:gap-2 text-left pr-4">
                    <span className="font-black text-lg sm:text-xl md:text-2xl text-white group-hover:text-[#fbbf24] transition-colors flex items-center gap-2">
                        Guardian Key
                        {aiEnabled && <span className="flex h-2 w-2 md:h-2.5 md:w-2.5 rounded-full bg-amber-400 shadow-[0_0_15px_rgba(251,191,36,1)]"></span>}
                    </span>
                    <span className="text-[9px] md:text-xs text-slate-400 leading-tight font-sans">
                        Channel the Gemini Oracle to unlock royal prophecies.
                    </span>
                  </div>
                  
                  <div className="relative flex-shrink-0 scale-100 md:scale-125">
                    <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={aiEnabled}
                        onChange={(e) => setAiEnabled(e.target.checked)}
                    />
                    <div className="w-12 h-6 md:w-14 md:h-7 bg-slate-800 border border-slate-700/50 rounded-full peer peer-focus:ring-2 peer-focus:ring-amber-500/40 after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-slate-600 after:border after:border-slate-500/50 after:rounded-full after:h-4 after:w-4 md:after:h-5 md:after:w-5 after:transition-all after:duration-300 peer-checked:bg-amber-950/80 peer-checked:border-amber-600/50 peer-checked:after:translate-x-6 md:peer-checked:after:translate-x-[28px] peer-checked:after:bg-gradient-to-b peer-checked:after:from-amber-300 peer-checked:after:to-amber-500 peer-checked:after:border-amber-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] peer-checked:shadow-[0_0_12px_rgba(245,158,11,0.25),inset_0_2px_4px_rgba(0,0,0,0.4)]"></div>
                  </div>
              </label>
            </div>

            <div className="flex flex-col gap-3 md:gap-4">
              <button 
                onClick={handleResume}
                className="group relative w-full py-4 md:py-6 bg-gradient-to-b from-amber-400 to-amber-700 hover:from-amber-300 hover:to-amber-600 text-slate-950 font-black rounded-2xl md:rounded-[2rem] shadow-[0_15px_40px_rgba(245,158,11,0.4)] transform transition-all hover:scale-[1.03] active:scale-[0.98] text-xl md:text-2xl tracking-[0.15em] uppercase border-2 border-white/20"
              >
                <span className="relative z-10">Turn the Key</span>
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl md:rounded-[2rem] blur-sm"></div>
              </button>

              <button 
                onClick={() => setShowSaves(true)}
                className="w-full py-3 md:py-4 bg-indigo-900/40 hover:bg-indigo-800/60 text-amber-200 font-bold rounded-xl md:rounded-[2rem] border border-amber-500/30 hover:border-amber-400/60 transition-all uppercase tracking-widest text-xs md:text-sm flex items-center justify-center gap-2 group"
              >
                <span>🗝️</span>
                <span className="group-hover:text-white transition-colors">Chronicle of Keys</span>
              </button>
            </div>

            <div className="mt-8 md:mt-12 space-y-1 md:space-y-2 opacity-60">
                <p className="text-[7px] md:text-[9px] text-slate-500 font-serif uppercase tracking-[0.3em] md:tracking-[0.5em] px-4">
                    Sovereign of the Crystal Lock
                </p>
                <p className="text-[7px] md:text-[8px] text-slate-600 font-sans tracking-widest">
                    V3.0 • FORGED IN THE ARCANE FORGE
                </p>
            </div>
        </div>
      </div>

      {showSaves && (
        <SaveLoadModal 
          onLoad={handleProfileSelect} 
          onClose={() => setShowSaves(false)} 
        />
      )}
    </div>
  );
};

export default StartScreen;
