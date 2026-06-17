
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { BuildingType, BuildingConfig, CityStats, Grid, AIGoal } from '../types';
import { BUILDINGS, CATEGORIES } from '../constants';
import AdvisorPanel from './AdvisorPanel';
import ResearchPanel from './ResearchPanel';
import HelpModal from './HelpModal';
import { ResearchService } from '../services/researchService';

const StatIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'pop': return <span className="text-emerald-300 drop-shadow-[0_0_5px_rgba(110,231,183,0.5)]">👥</span>;
    case 'gold': return <span className="text-[#fbbf24] drop-shadow-[0_0_5px_rgba(251,191,36,0.5)]">💰</span>;
    case 'mana': return <span className="text-fuchsia-400 drop-shadow-[0_0_5px_rgba(232,121,249,0.5)]">✨</span>;
    case 'essence': return <span className="text-blue-400 drop-shadow-[0_0_5px_rgba(96,165,250,0.5)]">💧</span>;
    case 'upkeep': return <span className="text-rose-400 drop-shadow-[0_0_5px_rgba(248,113,113,0.5)]">📜</span>;
    case 'range': return <span className="text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">🏹</span>;
    case 'quest': return <span className="text-[#fbbf24] text-lg drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]">📜</span>;
    default: return null;
  }
};

interface RoyalDecreeProps {
  goal: AIGoal | null;
  collapsed: boolean;
  onToggle: () => void;
}

const RoyalDecree: React.FC<RoyalDecreeProps> = ({ goal, collapsed, onToggle }) => {
  if (!goal) return null;
  return (
    <div className="bg-indigo-950/90 border-2 border-amber-600/50 rounded-2xl md:rounded-3xl p-3 md:p-5 backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.5),0_0_15px_rgba(251,191,36,0.1)] pointer-events-auto w-full sm:w-80 animate-in slide-in-from-left duration-700 transition-all">
      <button 
        onClick={onToggle}
        className="flex items-center justify-between w-full text-left font-serif focus:outline-none"
        aria-expanded={!collapsed}
      >
        <div className="flex items-center gap-2 md:gap-3">
          <StatIcon type="quest" />
          <h4 className="text-[#fbbf24] font-black uppercase text-[10px] md:text-xs tracking-widest drop-shadow-sm font-serif">Royal Decree</h4>
        </div>
        <div className="flex items-center gap-2">
          {goal.completed && <span className="ml-auto bg-emerald-500/20 text-emerald-300 text-[8px] px-2 py-0.5 rounded-full font-black border border-emerald-500/30 animate-pulse">FULFILLED</span>}
          <span className="text-amber-500 text-xs font-bold font-sans select-none">{collapsed ? '▼' : '▲'}</span>
        </div>
      </button>

      {!collapsed && (
        <div className="mt-2 md:mt-3 animate-in fade-in slide-in-from-top-1 duration-200">
          <p className="text-white font-serif leading-tight md:leading-relaxed mb-3 md:mb-4 text-xs md:text-sm opacity-95">"{goal.description}"</p>
          <div className="flex items-center justify-between bg-black/40 rounded-xl p-2 md:p-3 border border-amber-600/20">
            <div className="flex flex-col">
              <span className="text-[7px] md:text-[8px] text-slate-400 font-black uppercase tracking-tighter mb-1 font-sans">Target</span>
              <span className="text-[10px] md:text-xs font-black text-[#fbbf24]">{goal.targetValue} {goal.targetType.replace('_', ' ')}</span>
            </div>
            <div className="text-right flex flex-col">
              <span className="text-[7px] md:text-[8px] text-slate-400 font-black uppercase tracking-tighter mb-1 font-sans">Grant</span>
              <span className="text-[10px] md:text-xs font-black text-emerald-400">+{goal.reward}G</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const EventAlert = ({ events }: { events: CityStats['activeEvents'] }) => {
  if (events.length === 0) return null;
  
  return (
    <div className="flex flex-col gap-2 md:gap-3 mt-2 md:mt-4 pointer-events-auto">
      {events.map(event => {
        const isWarning = event.type === 'mana_drought_warning';
        const isDrought = event.type === 'mana_drought';
        const isNegative = isWarning || isDrought || event.effects.happinessBonus && event.effects.happinessBonus < 0;
        
        return (
          <div 
            key={event.id}
            className={`w-full sm:w-80 p-3 md:p-4 rounded-xl md:rounded-2xl border-2 backdrop-blur-2xl transition-all duration-500 animate-in slide-in-from-left ${
              isNegative 
                ? 'bg-rose-950/80 border-rose-500/60 animate-pulse' 
                : 'bg-emerald-950/80 border-emerald-500/60'
            }`}
          >
            <div className="flex justify-between items-center mb-1">
              <h4 className={`font-black uppercase text-[8px] md:text-[10px] tracking-widest ${isNegative ? 'text-rose-200' : 'text-emerald-200'} opacity-80`}>
                {isWarning ? '⚠️ Arcane Omen' : isDrought ? '⚡ Mana Drought' : '📜 Kingdom Event'}
              </h4>
              <span className="bg-black/40 px-2 py-0.5 rounded-lg text-[8px] md:text-[10px] font-mono text-white/80 border border-white/10">
                {event.duration} ticks
              </span>
            </div>
            <p className="font-serif font-black text-sm md:text-lg leading-tight mb-1 text-white">{event.label}</p>
            <p className="text-[9px] md:text-[11px] text-white/70 italic leading-tight">{event.description}</p>
          </div>
        );
      })}
    </div>
  );
};

const BuildingTooltip = ({ config, currentGold }: { config: BuildingConfig, currentGold: number }) => {
  const isDemolish = config.type === BuildingType.None;
  const isUpgrade = config.type === BuildingType.Upgrade;
  const canAfford = currentGold >= config.cost;
  
  return (
    <div className={`fixed bottom-32 md:bottom-auto md:absolute md:bottom-full left-1/2 -translate-x-1/2 mb-4 md:mb-8 w-[90vw] sm:w-[280px] md:w-80 z-[100] bg-slate-900/98 border-2 border-cyan-500/50 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.9)] backdrop-blur-3xl pointer-events-none overflow-hidden ring-1 ring-cyan-400/20 animate-in fade-in zoom-in-95 duration-200`}>
      <div className="bg-gradient-to-br from-indigo-950 to-slate-900 p-3 md:p-6 border-b border-cyan-500/20">
        <div className="flex justify-between items-start mb-1">
          <h4 className="text-white font-black uppercase text-base md:text-xl tracking-tight leading-tight">{config.name}</h4>
          {!isDemolish && !isUpgrade && (
            <span className={`px-2 py-0.5 md:py-1 rounded-lg font-black text-[9px] md:text-[10px] whitespace-nowrap ${canAfford ? 'bg-[#fbbf24] text-slate-950' : 'bg-rose-600 text-white'}`}>
              {config.cost}G
            </span>
          )}
          {isDemolish && (
            <span className="px-2 py-0.5 md:py-1 rounded-lg font-black text-[9px] md:text-[10px] whitespace-nowrap bg-emerald-500 text-slate-950">
              Recover 35% g
            </span>
          )}
          {isUpgrade && (
            <span className="px-2 py-0.5 md:py-1 rounded-lg font-black text-[9px] md:text-[10px] whitespace-nowrap bg-fuchsia-500 text-white">
              Sovereign Upgrades
            </span>
          )}
        </div>
        <p className="text-slate-200 text-[9px] md:text-xs leading-relaxed italic opacity-80">"{config.description}"</p>
      </div>
      {!isDemolish && !isUpgrade && (
        <div className="p-2 md:p-5 space-y-2 md:space-y-4">
          <div className="grid grid-cols-2 gap-2 md:gap-3">
            {config.popGen > 0 && <div className="flex items-center gap-2 bg-white/5 p-1 md:p-2 rounded-xl"><StatIcon type="pop" /><span className="text-[10px] md:text-xs font-black text-white">+{config.popGen}</span></div>}
            {config.incomeGen > 0 && <div className="flex items-center gap-2 bg-white/5 p-1 md:p-2 rounded-xl"><StatIcon type="gold" /><span className="text-[10px] md:text-xs font-black text-[#fbbf24]">+{config.incomeGen}</span></div>}
            {config.manaReq > 0 && <div className="flex items-center gap-2 bg-white/5 p-1 md:p-2 rounded-xl"><StatIcon type="mana" /><span className="text-[10px] md:text-xs font-black text-fuchsia-400">-{config.manaReq}</span></div>}
            {config.essenceReq > 0 && <div className="flex items-center gap-2 bg-white/5 p-1 md:p-2 rounded-xl"><StatIcon type="essence" /><span className="text-[10px] md:text-xs font-black text-blue-400">-{config.essenceReq}</span></div>}
          </div>
        </div>
      )}
      {isDemolish && (
         <div className="p-3 md:p-5 text-[10px] md:text-xs text-slate-300 font-serif leading-relaxed space-y-2 select-none">
           <p className="text-emerald-400 font-black">🌱 Purges structures to restore soil.</p>
           <p>Demolishing recovers <span className="text-amber-400 font-black">35%</span> of the original construction and upgrade gold directly back to the treasury.</p>
         </div>
      )}
      {isUpgrade && (
         <div className="p-3 md:p-5 text-[10px] md:text-xs text-slate-300 font-serif leading-relaxed space-y-2 select-none">
           <p className="text-fuchsia-400 font-black">✨ Enhances mystical output.</p>
           <p>Imbues existing non-road structures with higher tiers, doubling productivity per level up to Tier 3.</p>
         </div>
      )}
    </div>
  );
};

interface ToolButtonProps {
  type: BuildingType;
  selected: boolean;
  locked: boolean;
  onClick: () => void;
  currentGold: number;
  shortcutIndex?: number;
}

const ToolButton: React.FC<ToolButtonProps> = ({ type, selected, locked, onClick, currentGold, shortcutIndex }) => {
  const config = BUILDINGS[type];
  const [hovered, setHovered] = useState(false);

  if (locked) return null;

  return (
    <div className="relative" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onTouchStart={() => setHovered(true)} onTouchEnd={() => setHovered(false)}>
      <button
        onClick={onClick}
        className={`w-11 h-11 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center transition-all duration-300 relative group overflow-hidden border ${
          selected 
            ? 'bg-gradient-to-br from-amber-400 to-amber-600 scale-110 shadow-[0_0_25px_rgba(245,158,11,0.6)] z-20 border-white/40' 
            : 'bg-indigo-950/60 hover:bg-indigo-900/80 border-cyan-500/10 hover:border-cyan-400/40'
        }`}
      >
        <div className={`text-xl md:text-2xl transition-transform duration-500 group-hover:scale-125 ${selected ? 'scale-110 drop-shadow-md' : 'opacity-70 group-hover:opacity-100'}`}>
          {getIconForType(type)}
        </div>
        {shortcutIndex !== undefined && (
          <div className="absolute bottom-0.5 right-1 text-[8px] md:text-[9px] font-mono font-bold text-slate-400 bg-black/60 px-1 rounded border border-white/10 select-none">
            {shortcutIndex}
          </div>
        )}
      </button>
      {hovered && <BuildingTooltip config={config} currentGold={currentGold} />}
    </div>
  );
};

function getIconForType(type: BuildingType) {
  switch (type) {
    case BuildingType.Road: return '🛣️';
    case BuildingType.Residential: return '🏠';
    case BuildingType.Commercial: return '🍻';
    case BuildingType.Industrial: return '⛏️';
    case BuildingType.Park: return '🌳';
    case BuildingType.PowerPlant: return '🔮';
    case BuildingType.WaterTower: return '💧';
    case BuildingType.PoliceStation: return '🛡️';
    case BuildingType.FireStation: return '🔥';
    case BuildingType.School: return '🧪';
    case BuildingType.Landmark: return '🏰';
    case BuildingType.LumberMill: return '🪵';
    case BuildingType.Bakery: return '🥐';
    case BuildingType.Library: return '📜';
    case BuildingType.LuminaBloom: return '🌸';
    case BuildingType.Windmill: return '🌾';
    case BuildingType.MarketSquare: return '⚖️';
    case BuildingType.MagicAcademy: return '🎩';
    case BuildingType.GrandObservatory: return '🔭';
    case BuildingType.Upgrade: return '✨';
    case BuildingType.None: return '🧹';
    case BuildingType.Clocktower: return '🕰️';
    case BuildingType.DruidCircle: return '🗿';
    default: return '❓';
  }
}

interface UIOverlayProps {
  stats: CityStats;
  selectedTool: BuildingType;
  onSelectTool: (t: BuildingType) => void;
  currentGoal: AIGoal | null;
  newsFeed: any[];
  grid: Grid;
  onPanelStateChange: (open: boolean) => void;
  onRotateView: (dir: number) => void;
  onRotateBuilding: () => void;
  onUnlockTech: (id: string) => void;
  autosaving?: boolean;
  activeTab: string;
  onActiveTabChange: (tab: string) => void;
  onManualSave?: () => void;
}

const UIOverlay: React.FC<UIOverlayProps> = ({ 
  stats, selectedTool, onSelectTool, currentGoal, newsFeed, grid, 
  onPanelStateChange, onRotateView, onRotateBuilding, onUnlockTech, autosaving,
  activeTab, onActiveTabChange, onManualSave
}) => {
  const [isAdvisorOpen, setIsAdvisorOpen] = useState(false);
  const [isResearchOpen, setIsResearchOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [decreeCollapsed, setDecreeCollapsed] = useState(false);

  useEffect(() => onPanelStateChange(isAdvisorOpen || isResearchOpen || isHelpOpen), [isAdvisorOpen, isResearchOpen, isHelpOpen, onPanelStateChange]);

  const categories = [
    { id: 'abodes', name: 'Abodes', icon: '🏠', types: [BuildingType.Residential] },
    { id: 'treasury', name: 'Treasury', icon: '💰', types: [BuildingType.Commercial, BuildingType.Industrial, BuildingType.LumberMill, BuildingType.Bakery, BuildingType.Windmill, BuildingType.MarketSquare] },
    { id: 'arcane', name: 'Arcane', icon: '🔮', types: [BuildingType.PowerPlant, BuildingType.WaterTower, BuildingType.LuminaBloom, BuildingType.FireStation, BuildingType.DruidCircle] },
    { id: 'society', name: 'Society', icon: '🎓', types: [BuildingType.PoliceStation, BuildingType.School, BuildingType.Library, BuildingType.MagicAcademy, BuildingType.GrandObservatory, BuildingType.Park, BuildingType.Clocktower] },
    { id: 'monuments', name: 'Relics', icon: '🏰', types: [BuildingType.Landmark] },
    { id: 'tools', name: 'Tools', icon: '⚒️', types: [BuildingType.Road, BuildingType.Upgrade, BuildingType.None] }
  ];

  const profit = stats.incomeTotal - stats.maintenanceTotal;
  const isBuildingActive = selectedTool !== BuildingType.None && selectedTool !== BuildingType.Upgrade;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col font-serif select-none overflow-hidden">
      {/* Top Header */}
      <div className="p-2 sm:p-4 md:p-8 flex flex-col md:flex-row justify-between items-start gap-2 md:gap-0 bg-gradient-to-b from-indigo-950/90 to-transparent">
        <div className="flex flex-col gap-2 md:gap-4 w-full md:w-auto">
          <div className="bg-slate-900/90 border-2 border-amber-600/40 rounded-xl md:rounded-3xl p-2 sm:p-3 md:p-5 backdrop-blur-xl shadow-xl flex flex-wrap md:flex-nowrap gap-3 sm:gap-4 md:gap-8 items-center pointer-events-auto ring-1 ring-amber-500/10 w-full md:w-auto justify-between md:justify-start">
            {/* Stats Block */}
            <div className="flex gap-2 sm:gap-4 items-center">
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 md:gap-2 mb-0.5 md:mb-1">
                  <StatIcon type="gold" />
                  <span className="text-sm sm:text-base md:text-2xl font-black text-[#fbbf24] tracking-tight">{stats.money.toLocaleString()}</span>
                </div>
                <span className={`text-[7px] md:text-[10px] font-black uppercase tracking-widest px-1 py-0.5 rounded bg-black/30 border border-white/5 ${profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                   {Math.abs(profit)}g
                </span>
              </div>
              
              <div className="w-px h-6 md:h-10 bg-amber-600/20" />

              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 md:gap-2 mb-0.5 md:mb-1">
                  <span className="text-sm sm:text-base md:text-xl">✨</span>
                  <span className="text-sm sm:text-base md:text-2xl font-black text-cyan-200 tracking-tight">{stats.wisdom.toLocaleString()}</span>
                </div>
                <span className="text-[7px] md:text-[10px] font-black uppercase tracking-widest text-cyan-500">Wisdom</span>
              </div>
            </div>

            {/* Stats Block - Pop & Happiness */}
            <div className="flex flex-col min-w-[70px] sm:min-w-[80px] md:min-w-0">
              <div className="flex items-center gap-1.5 md:gap-2 mb-0.5 md:mb-1">
                <StatIcon type="pop" />
                <span className="text-sm sm:text-base md:text-2xl font-black text-white tracking-tight">{stats.population.toLocaleString()}</span>
              </div>
              <div className="w-full md:w-24 h-1.5 md:h-2 bg-black/50 rounded-full overflow-hidden border border-white/10">
                <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-500" style={{ width: `${stats.happiness}%` }} />
              </div>
            </div>

            {/* Stats Block - Mana & Essence (Responsive UI) */}
            <div className="hidden sm:flex gap-3 sm:gap-4 items-center">
              <div className="w-px h-6 md:h-10 bg-amber-600/20" />
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 md:gap-2 mb-0.5 md:mb-1">
                  <StatIcon type="mana" />
                  <span className="text-sm sm:text-base md:text-2xl font-black text-fuchsia-300 tracking-tight">
                    {stats.manaUsage}/{stats.manaSupply}
                  </span>
                </div>
                <span className="text-[7px] md:text-[10px] font-black uppercase tracking-widest text-fuchsia-500">Mana</span>
              </div>

              <div className="w-px h-6 md:h-10 bg-amber-600/20" />
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 md:gap-2 mb-0.5 md:mb-1">
                  <StatIcon type="essence" />
                  <span className="text-sm sm:text-base md:text-2xl font-black text-blue-300 tracking-tight">
                    {stats.essenceUsage}/{stats.essenceSupply}
                  </span>
                </div>
                <span className="text-[7px] md:text-[10px] font-black uppercase tracking-widest text-blue-500">Essence</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 max-w-[90vw] md:max-w-none">
            <RoyalDecree 
              goal={currentGoal} 
              collapsed={decreeCollapsed} 
              onToggle={() => setDecreeCollapsed(!decreeCollapsed)} 
            />
            <EventAlert events={stats.activeEvents} />
          </div>
        </div>

        {/* Top Right Quick Actions */}
        <div className="fixed top-2 right-2 sm:top-4 sm:right-4 md:relative md:top-0 md:right-0 flex flex-col items-end gap-2 md:gap-4 pointer-events-auto">
          {autosaving && <div className="text-white text-[8px] md:text-xs font-mono opacity-50 animate-pulse">Saving...</div>}
          
          <div className="flex gap-2 md:gap-4">
             {onManualSave && (
               <button 
                  onClick={onManualSave}
                  className="bg-indigo-950/70 hover:bg-amber-800/80 border-2 border-amber-500/50 p-2 sm:p-3 md:p-5 rounded-lg sm:rounded-xl md:rounded-[2rem] backdrop-blur-md shadow-lg group transition-all active:scale-95 duration-200"
                  title="Save Kingdom Progress (Ctrl + S)"
               >
                  <div className="text-lg sm:text-xl md:text-3xl">💾</div>
               </button>
             )}

             <button 
                onClick={() => setIsHelpOpen(true)}
                className="bg-indigo-950/70 hover:bg-amber-900/90 border-2 border-amber-500/50 p-2 sm:p-3 md:p-5 rounded-lg sm:rounded-xl md:rounded-[2rem] backdrop-blur-md shadow-lg group transition-all"
                title="Building Codex"
             >
                <div className="text-lg sm:text-xl md:text-3xl">❓</div>
             </button>

             <button 
                onClick={() => setIsResearchOpen(true)}
                className="bg-indigo-950/70 hover:bg-emerald-900/90 border-2 border-emerald-500/50 p-2 sm:p-3 md:p-5 rounded-lg sm:rounded-xl md:rounded-[2rem] backdrop-blur-md shadow-lg group transition-all"
            >
                <div className="text-lg sm:text-xl md:text-3xl animate-bounce">📜</div>
            </button>

            <button 
                onClick={() => setIsAdvisorOpen(true)}
                className="bg-indigo-950/70 hover:bg-fuchsia-900/90 border-2 border-fuchsia-500/50 p-2 sm:p-3 md:p-5 rounded-lg sm:rounded-xl md:rounded-[2rem] backdrop-blur-md shadow-lg group transition-all"
            >
                <div className="text-lg sm:text-xl md:text-3xl animate-pulse">🧙‍♂️</div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Control HUD (Floating Left) */}
      <div className="fixed left-3 bottom-44 md:hidden flex flex-col gap-3 pointer-events-auto">
        <button 
          onClick={() => onRotateView(-1)}
          className="w-10 h-10 bg-black/60 border border-white/20 rounded-full flex items-center justify-center text-white text-lg active:scale-90 transition-transform"
        >
          ↺
        </button>
        <button 
          onClick={() => onRotateView(1)}
          className="w-10 h-10 bg-black/60 border border-white/20 rounded-full flex items-center justify-center text-white text-lg active:scale-90 transition-transform"
        >
          ↻
        </button>
        {isBuildingActive && (
          <button 
            onClick={() => onRotateBuilding()}
            className="w-10 h-10 bg-amber-600/80 border border-white/30 rounded-full flex items-center justify-center text-white text-lg active:scale-90 transition-transform shadow-lg"
          >
            📐
          </button>
        )}
      </div>

      {/* Main Toolbelt */}
      <div className="mt-auto p-2 sm:p-4 md:p-12 flex flex-col items-center w-full">
        <div className="bg-slate-900/95 border-2 border-amber-600/40 p-2 md:p-3 rounded-xl md:rounded-[3rem] backdrop-blur-3xl shadow-2xl pointer-events-auto flex flex-col items-center w-full max-w-4xl ring-1 ring-amber-500/20">
          
          {/* Scrollable Category Tabs */}
          <div className="flex gap-1 mb-2 md:mb-4 p-1 bg-black/40 rounded-lg md:rounded-2xl w-full border border-white/5 overflow-x-auto no-scrollbar scroll-smooth">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => onActiveTabChange(cat.id)}
                className={`flex-1 min-w-[60px] sm:min-w-[65px] md:min-w-0 py-1.5 md:py-2.5 px-1 sm:px-2 md:px-3 rounded-lg md:rounded-xl text-[6px] sm:text-[7px] md:text-[10px] font-black uppercase tracking-widest flex flex-col items-center gap-0.5 md:gap-1 transition-all ${activeTab === cat.id ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 shadow-md border border-white/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              >
                <span className="text-sm sm:text-base md:text-xl drop-shadow-sm">{cat.icon}</span>
                <span className="hidden sm:inline">{cat.name}</span>
              </button>
            ))}
          </div>

          {/* Selection Area */}
          <div className="flex gap-2 md:gap-4 p-1 md:p-2 min-h-[45px] sm:min-h-[50px] md:min-h-[80px] items-center flex-wrap justify-center overflow-y-auto max-h-20 sm:max-h-24 md:max-h-none scroll-smooth">
            {(() => {
              const types = categories.find(c => c.id === activeTab)?.types || [];
              const unlockedTypes = types.filter(t => ResearchService.isBuildingUnlocked(t, stats.unlockedTechs));
              
              return types.map(t => {
                const isUnlocked = ResearchService.isBuildingUnlocked(t, stats.unlockedTechs);
                const clickIndex = isUnlocked ? unlockedTypes.indexOf(t) : -1;
                const shortcutNum = clickIndex >= 0 && clickIndex < 5 ? clickIndex + 1 : undefined;
                
                return (
                  <ToolButton 
                    key={t} 
                    type={t} 
                    selected={selectedTool === t} 
                    locked={!isUnlocked}
                    shortcutIndex={shortcutNum}
                    onClick={() => {
                      onSelectTool(t);
                    }} 
                    currentGold={stats.money}
                  />
                );
              });
            })()}
          </div>
        </div>
      </div>

      {/* Herald News Scroll - Tablet/Desktop only */}
      <div className="absolute bottom-6 md:bottom-12 right-6 md:right-12 w-64 md:w-80 space-y-2 md:space-y-3 hidden sm:block" role="log" aria-live="polite">
        {newsFeed.slice(0, 3).map((news, i) => (
          <div key={news.id} className={`bg-indigo-950/90 border-2 p-3 md:p-4 rounded-xl md:rounded-2xl backdrop-blur-md animate-in slide-in-from-right duration-500 shadow-xl ${news.type === 'urgent' ? 'border-amber-500/70' : 'border-cyan-500/40 shadow-black/40'}`} style={{ opacity: 1 - (i * 0.3) }}>
            <p className={`text-[10px] md:text-[11px] font-serif leading-relaxed italic ${news.type === 'urgent' ? 'text-[#fbbf24]' : 'text-white/90'}`}>"{news.text}"</p>
          </div>
        ))}
      </div>

      {isAdvisorOpen && <AdvisorPanel stats={stats} grid={grid} onClose={() => setIsAdvisorOpen(false)} />}
      {isResearchOpen && <ResearchPanel stats={stats} onUnlock={onUnlockTech} onClose={() => setIsResearchOpen(false)} />}
      {isHelpOpen && <HelpModal onClose={() => setIsHelpOpen(false)} />}
    </div>
  );
};

export default UIOverlay;
