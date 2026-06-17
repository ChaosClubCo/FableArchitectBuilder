/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';

interface HelpModalProps {
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-6 bg-slate-950/90 backdrop-blur-xl pointer-events-auto">
      <div className="w-full max-w-2xl max-h-[90vh] bg-indigo-950/95 border-2 border-amber-600/70 rounded-2xl md:rounded-[3rem] shadow-[0_45px_100px_rgba(0,0,0,1),0_0_50px_rgba(251,191,36,0.15)] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300 font-serif ring-1 ring-amber-500/30">
        
        {/* Header */}
        <div className="p-4 md:p-8 border-b border-amber-900/40 flex justify-between items-center bg-black/20">
          <div>
            <h3 className="text-xl md:text-3xl font-black text-[#fbbf24] italic tracking-tight drop-shadow-md">The Builder's Codex</h3>
            <p className="text-[8px] md:text-[10px] text-cyan-400 font-bold tracking-[0.2em] uppercase opacity-80">Arcane Command & Architecture Manual</p>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 md:w-12 md:h-12 hover:bg-white/10 rounded-full transition-all text-amber-500 flex items-center justify-center text-xl md:text-2xl border border-amber-900/30 hover:rotate-90 focus:outline-none"
            title="Dismis Codex"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 md:p-8 flex-1 overflow-y-auto no-scrollbar space-y-6 md:space-y-8">
          
          {/* Intro Guidance */}
          <div className="border border-amber-500/20 bg-indigo-950/50 rounded-xl md:rounded-2xl p-4 flex gap-4 items-center">
            <span className="text-3xl md:text-4xl">📖</span>
            <div className="flex-1 font-serif text-slate-300 text-xs md:text-sm leading-relaxed">
              Welcome, Sovereign! Leverage these spells and commands to architect your magical civilization instantly. Keyboard shortcuts allow you to build, rotate camera perspectives, and toggle constructs without leaving your high seat.
            </div>
          </div>

          {/* Grid Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Perspective & Camera Column */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-amber-950/50">
                <span className="text-lg">👁️</span>
                <h4 className="text-[#fbbf24] font-black text-xs md:text-sm tracking-wider uppercase">Perspectives & Cam</h4>
              </div>
              <ul className="space-y-3">
                <li className="flex justify-between items-center bg-slate-900/40 p-2 rounded-lg border border-white/5">
                  <span className="text-slate-300 text-xs md:text-sm">Rotate View Left</span>
                  <kbd className="font-mono bg-slate-800 text-[#fbbf24] px-2.5 py-1 rounded text-xs border border-amber-600/30 shadow shadow-black/80 font-bold">Q</kbd>
                </li>
                <li className="flex justify-between items-center bg-slate-900/40 p-2 rounded-lg border border-white/5">
                  <span className="text-slate-300 text-xs md:text-sm">Rotate View Right</span>
                  <kbd className="font-mono bg-slate-800 text-[#fbbf24] px-2.5 py-1 rounded text-xs border border-amber-600/30 shadow shadow-black/80 font-bold">E</kbd>
                </li>
                <li className="flex justify-between items-center bg-slate-900/40 p-2 rounded-lg border border-white/5">
                  <span className="text-slate-300 text-xs md:text-sm">Pan Workspace</span>
                  <span className="text-[10px] md:text-xs text-slate-400 font-sans font-medium">Click & Drag Map</span>
                </li>
              </ul>

              {/* Construction Helpers */}
              <div className="flex items-center gap-2 pt-2 pb-2 border-b border-amber-950/50">
                <span className="text-lg">⚒️</span>
                <h4 className="text-[#fbbf24] font-black text-xs md:text-sm tracking-wider uppercase">Construction Tools</h4>
              </div>
              <ul className="space-y-3">
                <li className="flex justify-between items-center bg-slate-900/40 p-2 rounded-lg border border-white/5">
                  <span className="text-slate-300 text-xs md:text-sm">Rotate Blueprint Struct</span>
                  <kbd className="font-mono bg-slate-800 text-[#fbbf24] px-2.5 py-1 rounded text-xs border border-amber-600/30 shadow shadow-black/80 font-bold">R</kbd>
                </li>
                <li className="flex justify-between items-center bg-slate-900/40 p-2 rounded-lg border border-white/5">
                  <span className="text-slate-300 text-xs md:text-sm">Enhance / Upgrade Struct</span>
                  <kbd className="font-mono bg-slate-800 text-[#fbbf24] px-2.5 py-1 rounded text-xs border border-amber-600/30 shadow shadow-black/80 font-bold">U</kbd>
                </li>
                <li className="flex justify-between items-center bg-slate-900/40 p-2 rounded-lg border border-white/5">
                  <span className="text-slate-300 text-xs md:text-sm">Clear / Demolish Land</span>
                  <div className="flex gap-1">
                    <kbd className="font-mono bg-slate-800 text-slate-300 px-1.5 py-1 rounded text-[10px] border border-white/10 shadow shadow-black/80">Del</kbd>
                    <kbd className="font-mono bg-slate-800 text-slate-300 px-1.5 py-1 rounded text-[10px] border border-white/10 shadow shadow-black/80">B</kbd>
                  </div>
                </li>
                <li className="flex justify-between items-center bg-slate-900/40 p-2 rounded-lg border border-white/5">
                  <span className="text-slate-300 text-xs md:text-sm">Wizard Developer Console</span>
                  <kbd className="font-mono bg-slate-800 text-[#fbbf24] px-2 py-1 rounded text-xs border border-amber-600/30 shadow shadow-black/80 font-bold">`</kbd>
                </li>
                <li className="flex justify-between items-center bg-slate-900/40 p-2 rounded-lg border border-white/5">
                  <span className="text-slate-300 text-xs md:text-sm">Save Kingdom Progress</span>
                  <div className="flex gap-1 items-center">
                    <kbd className="font-mono bg-slate-800 text-slate-300 px-1.5 py-1 rounded text-[10px] border border-white/10 shadow shadow-black/80">Ctrl</kbd>
                    <span className="text-amber-500 font-bold text-xs">+</span>
                    <kbd className="font-mono bg-slate-800 text-[#fbbf24] px-2 py-1 rounded text-xs border border-amber-600/30 shadow shadow-black/80 font-bold">S</kbd>
                  </div>
                </li>
              </ul>
            </div>

            {/* Direct Spell Hotkeys Column */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-amber-950/50">
                <span className="text-lg">⚙️</span>
                <h4 className="text-[#fbbf24] font-black text-xs md:text-sm tracking-wider uppercase">Tab selection Hotkeys</h4>
              </div>
              <div className="bg-indigo-900/30 rounded-xl p-3 border border-amber-900/20 text-slate-300 text-[10px] md:text-xs leading-relaxed space-y-2 mb-2 font-sans">
                <p className="font-serif text-amber-300 font-bold uppercase tracking-wider text-[11px] mb-1">Adaptive Toolbelt Shortcuts</p>
                Press keys <kbd className="font-mono bg-slate-800 text-amber-400 px-1 rounded">1</kbd> to <kbd className="font-mono bg-slate-800 text-amber-400 px-1 rounded">5</kbd> to instantly build the corresponding unlocked structure in your currently selected Category Tab.
              </div>

              <div className="flex items-center gap-2 pt-2 pb-2 border-b border-amber-950/50">
                <span className="text-lg">🌌</span>
                <h4 className="text-[#fbbf24] font-black text-xs md:text-sm tracking-wider uppercase">Direct Blueprint Spells</h4>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex justify-between items-center bg-slate-900/40 p-2 rounded-lg border border-white/5">
                  <span className="text-slate-400 text-xs">🌾 Windmill</span>
                  <kbd className="font-mono bg-slate-800 text-[#fbbf24] px-2 py-0.5 rounded text-xs border border-amber-600/25 font-bold">W</kbd>
                </div>
                <div className="flex justify-between items-center bg-slate-900/40 p-2 rounded-lg border border-white/5">
                  <span className="text-slate-400 text-xs">💰 Market Sq</span>
                  <kbd className="font-mono bg-slate-800 text-[#fbbf24] px-2 py-0.5 rounded text-xs border border-amber-600/25 font-bold">M</kbd>
                </div>
                <div className="flex justify-between items-center bg-slate-900/40 p-2 rounded-lg border border-white/5">
                  <span className="text-slate-400 text-xs">🎓 Academy</span>
                  <kbd className="font-mono bg-slate-800 text-[#fbbf24] px-2 py-0.5 rounded text-xs border border-amber-600/25 font-bold">A</kbd>
                </div>
                <div className="flex justify-between items-center bg-slate-900/40 p-2 rounded-lg border border-white/5">
                  <span className="text-slate-400 text-xs">📚 Library</span>
                  <kbd className="font-mono bg-slate-800 text-[#fbbf24] px-2 py-0.5 rounded text-xs border border-amber-600/25 font-bold">L</kbd>
                </div>
                <div className="flex justify-between items-center bg-slate-900/40 p-2 rounded-lg border border-white/5">
                  <span className="text-slate-400 text-xs">🍞 Bakery</span>
                  <kbd className="font-mono bg-slate-800 text-[#fbbf24] px-2 py-0.5 rounded text-xs border border-amber-600/25 font-bold">K</kbd>
                </div>
                <div className="flex justify-between items-center bg-slate-900/40 p-2 rounded-lg border border-white/5">
                  <span className="text-slate-400 text-xs">⚡ wizard T</span>
                  <kbd className="font-mono bg-slate-800 text-[#fbbf24] px-2 py-0.5 rounded text-xs border border-amber-600/25 font-bold">6</kbd>
                </div>
                <div className="flex justify-between items-center bg-slate-900/40 p-2 rounded-lg border border-white/5">
                  <span className="text-slate-400 text-xs">💧 Well</span>
                  <kbd className="font-mono bg-slate-800 text-[#fbbf24] px-2 py-0.5 rounded text-xs border border-amber-600/25 font-bold">7</kbd>
                </div>
                <div className="flex justify-between items-center bg-slate-900/40 p-2 rounded-lg border border-white/5">
                  <span className="text-slate-400 text-xs">🛡️ Guard P</span>
                  <kbd className="font-mono bg-slate-800 text-[#fbbf24] px-2 py-0.5 rounded text-xs border border-amber-600/25 font-bold">8</kbd>
                </div>
                <div className="flex justify-between items-center bg-slate-900/40 p-2 rounded-lg border border-white/5">
                  <span className="text-slate-400 text-xs">🔥 Sanctum</span>
                  <kbd className="font-mono bg-slate-800 text-[#fbbf24] px-2 py-0.5 rounded text-xs border border-amber-600/25 font-bold">9</kbd>
                </div>
                <div className="flex justify-between items-center bg-slate-900/40 p-2 rounded-lg border border-white/5">
                  <span className="text-slate-400 text-xs">🧪 Alchemy</span>
                  <kbd className="font-mono bg-slate-800 text-[#fbbf24] px-2 py-0.5 rounded text-xs border border-amber-600/25 font-bold">0</kbd>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Footer actions */}
        <div className="p-4 md:p-8 border-t border-amber-900/40 bg-black/30 flex justify-center">
          <button 
            onClick={onClose}
            className="w-full sm:w-auto px-8 md:px-16 py-3 md:py-4 bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-500 hover:to-amber-700 text-slate-950 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-[0.3em] transition-all shadow-[0_10px_30px_rgba(245,158,11,0.35)] active:scale-95 border-b-2 md:border-b-4 border-amber-900 active:border-b-0 focus:outline-none"
          >
            I Understand the Rites
          </button>
        </div>

      </div>
    </div>
  );
};

export default HelpModal;
