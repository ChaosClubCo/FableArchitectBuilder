
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { CityStats, Grid } from '../types';

interface WizardConsoleProps {
  stats: CityStats;
  grid: Grid;
  onCommand: (cmd: string, args: string[]) => void;
  isOpen: boolean;
  onClose: () => void;
}

const WizardConsole: React.FC<WizardConsoleProps> = ({ stats, grid, onCommand, isOpen, onClose }) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>(['KeysKingdom Grimoire OS v4.0.0', 'Arcane connection established. Type "help" to list incantations.']);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [history]);

  const scry = async (query: string) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    setHistory(prev => [...prev, `> Scrying: "${query}"...`]);
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `You are the Grimoire Terminal of KeysKingdom. Answer concisely. 
        Current Gold: ${stats.money}g, Pop: ${stats.population}.
        Query: ${query}`,
      });
      setHistory(prev => [...prev, `[Oracle]: ${response.text}`]);
    } catch (e) {
      setHistory(prev => [...prev, `[Error]: The ley lines are unstable. Connection lost.`]);
    }
  };

  const handleInput = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const parts = input.trim().split(' ');
      const cmd = parts[0].toLowerCase();
      const args = parts.slice(1);

      setHistory(prev => [...prev, `> ${input}`]);

      if (cmd === 'help') {
        setHistory(prev => [...prev, 'Incantations: scry [lore], gift [gold], weather [type], stats, clear, exit']);
      } else if (cmd === 'scry') {
        scry(args.join(' '));
      } else if (cmd === 'clear') {
        setHistory([]);
      } else if (cmd === 'exit') {
        onClose();
      } else if (cmd === 'stats') {
        setHistory(prev => [...prev, JSON.stringify({ gold: stats.money, pop: stats.population, day: stats.day }, null, 2)]);
      } else {
        onCommand(cmd, args);
      }
      setInput('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-indigo-950/95 font-mono text-amber-400 p-4 md:p-8 flex flex-col backdrop-blur-2xl border-2 md:border-4 border-amber-600/30">
      <div className="flex justify-between items-center mb-4 md:mb-6 border-b-2 border-amber-900/50 pb-3 md:pb-4">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-amber-500 animate-ping"></div>
          <span className="text-[10px] md:text-sm uppercase tracking-[0.2em] md:tracking-[0.5em] font-black text-amber-300 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]">KeysKingdom Terminal</span>
        </div>
        <button 
          onClick={onClose} 
          className="hover:text-white transition-colors bg-white/5 px-3 md:px-4 py-1 rounded-lg border border-white/10 text-[8px] md:text-xs tracking-widest"
        >
          SEAL
        </button>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar mb-4 md:mb-6 space-y-1 md:space-y-2 text-xs md:text-base scroll-smooth">
        {history.map((line, i) => (
          <div key={i} className="whitespace-pre-wrap leading-tight md:leading-relaxed">
            <span className="text-amber-600 mr-2 md:mr-3 select-none">#</span>
            <span className={line.startsWith('[Oracle]') ? 'text-amber-200' : line.startsWith('[Error]') ? 'text-rose-400' : 'text-amber-300/90'}>
              {line}
            </span>
          </div>
        ))}
      </div>
      <div className="flex gap-2 md:gap-4 items-center bg-black/50 p-3 md:p-5 rounded-xl md:rounded-2xl border border-amber-500/20 shadow-inner">
        <span className="text-amber-500 font-bold animate-pulse text-lg md:text-xl drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]">{'>'}</span>
        <input
          autoFocus
          className="bg-transparent border-none outline-none flex-1 text-amber-100 text-sm md:text-lg placeholder:text-amber-900"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleInput}
          placeholder="Enter thy command..."
        />
      </div>
    </div>
  );
};

export default WizardConsole;
