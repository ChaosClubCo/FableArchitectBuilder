
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useEffect, useState } from 'react';
import { KingdomProfile, SaveService } from '../services/saveService';

interface SaveLoadModalProps {
  onLoad: (profile: KingdomProfile) => void;
  onClose: () => void;
}

const SaveLoadModal: React.FC<SaveLoadModalProps> = ({ onLoad, onClose }) => {
  const [profiles, setProfiles] = useState<KingdomProfile[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newRealmName, setNewRealmName] = useState('');

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    const list = await SaveService.listProfiles();
    setProfiles(list);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you wish to strike this kingdom from history? The key will be lost forever.")) {
      await SaveService.deleteProfile(id);
      loadProfiles();
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRealmName.trim()) return;
    
    const id = newRealmName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.random().toString(36).substr(2, 4);
    
    const mockProfile: any = {
      id: id,
      name: newRealmName,
      isNew: true 
    };
    
    onLoad(mockProfile);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-6 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-indigo-950/95 border-2 border-amber-600/60 rounded-2xl md:rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[90vh] md:max-h-[80vh] font-serif ring-1 ring-amber-500/20">
        
        {/* Header */}
        <div className="p-4 md:p-8 border-b border-amber-900/40 flex justify-between items-center bg-black/20">
          <div>
            <h3 className="text-xl md:text-3xl font-black text-[#fbbf24] italic tracking-tight drop-shadow-md">Chronicle of Keys</h3>
            <p className="text-[8px] md:text-[10px] text-cyan-400 font-bold tracking-[0.2em] uppercase opacity-80">Select a Realm to Rule</p>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 md:w-10 md:h-10 hover:bg-white/10 rounded-full transition-all text-amber-500 flex items-center justify-center text-lg md:text-xl"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4 md:p-8 overflow-y-auto flex-1 no-scrollbar space-y-3 md:space-y-4">
          {isCreating ? (
            <form onSubmit={handleCreate} className="bg-black/30 p-6 md:p-8 rounded-2xl md:rounded-3xl border border-amber-500/30 flex flex-col gap-4 md:gap-6 animate-in zoom-in-95">
              <h4 className="text-lg md:text-xl text-white font-bold text-center">Forge a New Realm</h4>
              <input 
                autoFocus
                type="text" 
                value={newRealmName}
                onChange={(e) => setNewRealmName(e.target.value)}
                placeholder="e.g. Sapphire Bastion"
                className="w-full bg-indigo-950/50 border-2 border-amber-600/50 rounded-xl p-3 md:p-4 text-center text-lg md:text-xl text-amber-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-400 transition-colors"
                maxLength={24}
              />
              <div className="flex gap-2 md:gap-3 justify-center">
                <button 
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 md:px-6 py-2 md:py-3 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs md:text-base hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={!newRealmName.trim()}
                  className="px-6 md:px-8 py-2 md:py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-white font-black uppercase tracking-widest text-xs md:text-base hover:from-amber-500 hover:to-amber-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  Forge Key
                </button>
              </div>
            </form>
          ) : (
            <>
              {profiles.length === 0 && (
                <div className="text-center py-8 md:py-12 opacity-50">
                  <div className="text-4xl md:text-6xl mb-3 md:mb-4">🗝️</div>
                  <p className="text-amber-100/50 text-sm md:text-base">No chronicles found. Forge your first key.</p>
                </div>
              )}
              
              {profiles.map(profile => (
                <div 
                  key={profile.id}
                  onClick={() => onLoad(profile)}
                  className="group relative bg-indigo-900/20 hover:bg-indigo-900/40 border border-white/5 hover:border-amber-500/50 p-4 md:p-5 rounded-xl md:rounded-2xl cursor-pointer transition-all hover:scale-[1.01] flex justify-between items-center"
                >
                  <div className="flex flex-col gap-0.5 md:gap-1">
                    <h4 className="text-lg md:text-xl font-bold text-amber-100 group-hover:text-amber-400 transition-colors">{profile.name}</h4>
                    <div className="flex gap-3 md:gap-4 text-[10px] md:text-xs text-slate-400 font-mono">
                      <span>Day {profile.stats.day}</span>
                      <span>•</span>
                      <span>Pop: {profile.stats.population}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 md:gap-4">
                     <span className="text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity font-bold uppercase text-[10px] md:text-xs tracking-widest mr-2 md:mr-4">
                        Unlock
                     </span>
                     <button
                        onClick={(e) => handleDelete(e, profile.id)}
                        className="p-1.5 md:p-2 hover:bg-rose-500/20 rounded-lg text-slate-600 hover:text-rose-400 transition-colors"
                        title="Delete Save"
                     >
                        🗑️
                     </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        {!isCreating && (
          <div className="p-4 md:p-6 border-t border-amber-900/40 bg-black/30 flex justify-center">
            <button 
              onClick={() => setIsCreating(true)}
              className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 rounded-xl font-black uppercase tracking-[0.2em] transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 md:gap-3 text-xs md:text-base"
            >
              <span className="text-lg md:text-xl">🗝️</span> Forge New Key
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SaveLoadModal;
