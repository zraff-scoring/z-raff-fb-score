import { useState } from 'react';
import { Users, Save, EyeOff, RotateCw } from 'lucide-react';
import { BroadcastState, Player } from '../types.js';

interface LineupsCategoryProps {
  state: BroadcastState;
  updateState: (updater: BroadcastState | ((prev: BroadcastState) => BroadcastState)) => void;
}

// Map standard tactical formations to (X, Y) percentages on the football pitch (0-100)
const FORMATION_PRESETS: Record<string, { x: number; y: number; position: 'GK' | 'DF' | 'MF' | 'FW' }[]> = {
  '4-3-3': [
    { x: 10, y: 50, position: 'GK' },
    { x: 30, y: 15, position: 'DF' },
    { x: 30, y: 38, position: 'DF' },
    { x: 30, y: 62, position: 'DF' },
    { x: 30, y: 85, position: 'DF' },
    { x: 55, y: 25, position: 'MF' },
    { x: 50, y: 50, position: 'MF' },
    { x: 55, y: 75, position: 'MF' },
    { x: 78, y: 15, position: 'FW' },
    { x: 85, y: 50, position: 'FW' },
    { x: 78, y: 85, position: 'FW' },
  ],
  '4-4-2': [
    { x: 10, y: 50, position: 'GK' },
    { x: 30, y: 15, position: 'DF' },
    { x: 30, y: 38, position: 'DF' },
    { x: 30, y: 62, position: 'DF' },
    { x: 30, y: 85, position: 'DF' },
    { x: 55, y: 15, position: 'MF' },
    { x: 55, y: 38, position: 'MF' },
    { x: 55, y: 62, position: 'MF' },
    { x: 55, y: 85, position: 'MF' },
    { x: 82, y: 33, position: 'FW' },
    { x: 82, y: 67, position: 'FW' },
  ],
  '3-5-2': [
    { x: 10, y: 50, position: 'GK' },
    { x: 30, y: 25, position: 'DF' },
    { x: 30, y: 50, position: 'DF' },
    { x: 30, y: 75, position: 'DF' },
    { x: 55, y: 15, position: 'MF' },
    { x: 52, y: 33, position: 'MF' },
    { x: 50, y: 50, position: 'MF' },
    { x: 52, y: 67, position: 'MF' },
    { x: 55, y: 85, position: 'MF' },
    { x: 82, y: 33, position: 'FW' },
    { x: 82, y: 67, position: 'FW' },
  ],
  '5-4-1': [
    { x: 10, y: 50, position: 'GK' },
    { x: 30, y: 12, position: 'DF' },
    { x: 28, y: 31, position: 'DF' },
    { x: 28, y: 50, position: 'DF' },
    { x: 28, y: 69, position: 'DF' },
    { x: 30, y: 88, position: 'DF' },
    { x: 55, y: 15, position: 'MF' },
    { x: 55, y: 38, position: 'MF' },
    { x: 55, y: 62, position: 'MF' },
    { x: 55, y: 85, position: 'MF' },
    { x: 85, y: 50, position: 'FW' },
  ],
  '4-2-3-1': [
    { x: 10, y: 50, position: 'GK' },
    { x: 30, y: 15, position: 'DF' },
    { x: 30, y: 38, position: 'DF' },
    { x: 30, y: 62, position: 'DF' },
    { x: 30, y: 85, position: 'DF' },
    { x: 50, y: 35, position: 'MF' },
    { x: 50, y: 65, position: 'MF' },
    { x: 70, y: 20, position: 'MF' },
    { x: 70, y: 50, position: 'MF' },
    { x: 70, y: 80, position: 'MF' },
    { x: 85, y: 50, position: 'FW' },
  ],
};

export default function LineupsCategory({ state, updateState }: LineupsCategoryProps) {
  // Editing state for which team's roster is being edited
  const [editTeam, setEditTeam] = useState<'home' | 'away'>('home');
  const [fieldOrientation, setFieldOrientation] = useState<'horizontal' | 'vertical'>('horizontal');

  // Trigger lineup display overlay to go on / off air
  const setLineupView = (view: 'home' | 'away' | 'vs' | null) => {
    updateState((prev) => ({
      ...prev,
      lineups: {
        ...prev.lineups,
        activeLineupView: view,
      }
    }));
  };

  // Inline player edit handlers
  const handlePlayerChange = (team: 'home' | 'away', index: number, field: keyof Player, value: any) => {
    updateState((prev) => {
      const targetXI = team === 'home' ? [...prev.lineups.homeStartingXI] : [...prev.lineups.awayStartingXI];
      if (!targetXI[index]) return prev;

      targetXI[index] = {
        ...targetXI[index],
        [field]: value,
      };

      return {
        ...prev,
        lineups: {
          ...prev.lineups,
          [team === 'home' ? 'homeStartingXI' : 'awayStartingXI']: targetXI,
        }
      };
    });
  };

  // Apply formation preset coordinates
  const handleApplyFormation = (team: 'home' | 'away', formation: string) => {
    const coords = FORMATION_PRESETS[formation];
    if (!coords) return;

    updateState((prev) => {
      const targetXI = team === 'home' ? [...prev.lineups.homeStartingXI] : [...prev.lineups.awayStartingXI];

      const updatedXI = targetXI.map((player, idx) => {
        const coord = coords[idx % 11];
        return {
          ...player,
          position: coord.position,
          x: coord.x,
          y: coord.y,
        };
      });

      return {
        ...prev,
        lineups: {
          ...prev.lineups,
          [team === 'home' ? 'homeFormation' : 'awayFormation']: formation,
          [team === 'home' ? 'homeStartingXI' : 'awayStartingXI']: updatedXI,
        }
      };
    });
  };

  // Coach configuration name edit
  const handleCoachChange = (team: 'home' | 'away', coachName: string) => {
    updateState((prev) => ({
      ...prev,
      lineups: {
        ...prev.lineups,
        [team === 'home' ? 'homeCoach' : 'awayCoach']: coachName,
      }
    }));
  };

  const activeXI = editTeam === 'home' ? state.lineups.homeStartingXI : state.lineups.awayStartingXI;
  const activeFormation = editTeam === 'home' ? state.lineups.homeFormation : state.lineups.awayFormation;
  const activeCoach = editTeam === 'home' ? state.lineups.homeCoach : state.lineups.awayCoach;
  const teamDisplayName = editTeam === 'home' ? state.settings.homeTeam : state.settings.awayTeam;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      
      {/* LINEUP SECTION HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl text-white">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-blue-400 block font-bold leading-none mb-1">Rosters & Formations</span>
            <h2 className="text-lg font-black text-white">Interactive Lineup Visualizer</h2>
          </div>
        </div>

        {/* Home/Away Selection Tabs */}
        <div className="flex bg-slate-950 p-1.5 rounded-xl border border-slate-850 shrink-0">
          <button 
            onClick={() => setEditTeam('home')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              editTeam === 'home' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
            id="btn-lineups-tab-home"
          >
            {state.settings.homeTeam || 'Home Team'}
          </button>
          <button 
            onClick={() => setEditTeam('away')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              editTeam === 'away' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
            id="btn-lineups-tab-away"
          >
            {state.settings.awayTeam || 'Away Team'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COLUMN 1: FORMATION PRESETS & MINI TACTICAL FOOTBALL PITCH PREVIEW */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Tactical preset list */}
          <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-850">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-black mb-3 block">Choose Tactical Formation</span>
            <div className="grid grid-cols-5 gap-1.5">
              {Object.keys(FORMATION_PRESETS).map((f) => (
                <button
                  key={f}
                  onClick={() => handleApplyFormation(editTeam, f)}
                  className={`py-2 rounded-lg text-[10px] font-mono font-black transition-all cursor-pointer ${
                    activeFormation === f 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/10' 
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-750 hover:text-slate-200'
                  }`}
                  id={`btn-formation-${f}`}
                >
                  {f}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-500 mt-2.5 leading-tight">
              Selecting a formation preset auto-calculates 2D coordinates for all 11 players on the live broadcast starting lineup pitch graphic!
            </p>
          </div>

          {/* MINI TACTICAL PITCH PREVIEW */}
          <div className="bg-slate-950/75 rounded-2xl border border-slate-850 p-4 h-80 relative overflow-hidden flex items-center justify-center shadow-inner">
            {/* Pitch layout lines */}
            <div className="absolute inset-3 border border-slate-800/80 rounded-xl" />
            <div className="absolute inset-4 border border-dashed border-slate-800/40 rounded-xl" />
            
            {fieldOrientation === 'horizontal' ? (
              <>
                {/* Horizontal Pitch Lines */}
                <div className="absolute top-1/2 left-0 right-0 h-px border-t border-dashed border-slate-800/40" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full border border-dashed border-slate-800/40" />
                <div className="absolute left-3 top-1/4 bottom-1/4 w-12 border border-dashed border-slate-800/40" />
                <div className="absolute right-3 top-1/4 bottom-1/4 w-12 border border-dashed border-slate-800/40" />
              </>
            ) : (
              <>
                {/* Vertical Pitch Lines */}
                <div className="absolute top-1/2 left-0 right-0 h-px border-t border-dashed border-slate-800/40" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full border border-dashed border-slate-800/40" />
                <div className="absolute top-3 left-1/4 right-1/4 h-12 border-b border-x border-dashed border-slate-800/40" />
                <div className="absolute bottom-3 left-1/4 right-1/4 h-12 border-t border-x border-dashed border-slate-800/40" />
              </>
            )}

            {/* Rotation Trigger Button */}
            <button 
              onClick={() => setFieldOrientation(prev => prev === 'horizontal' ? 'vertical' : 'horizontal')}
              className="absolute top-3 right-3 bg-slate-900/90 hover:bg-slate-800 text-xs font-bold px-2.5 py-1.5 rounded-lg border border-slate-800 flex items-center gap-1.5 text-slate-300 transition-all shadow-md z-30 cursor-pointer"
              title="Rotate Preview orientation"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span className="uppercase tracking-wider text-[9px]">{fieldOrientation === 'horizontal' ? 'Vertical view' : 'Horizontal view'}</span>
            </button>

            <span className="absolute bottom-2.5 right-4 text-[8px] font-mono text-slate-600 uppercase tracking-widest">Interactive Field Preview</span>
            <span className="absolute top-2.5 left-4 text-[8px] font-mono text-blue-400 uppercase tracking-widest font-black">
              {teamDisplayName} XI ({activeFormation})
            </span>

            {/* Displaying Live Player Dots */}
            <div className="absolute inset-6">
              {activeXI.map((player, idx) => {
                const posX = player.x ?? 10;
                const posY = player.y ?? 50;
                
                // If vertical orientation, we map posX (GK to FW) as vertical bottom-to-top, and posY as horizontal left-to-right
                const leftPercent = fieldOrientation === 'horizontal' ? posX : posY;
                const topPercent = fieldOrientation === 'horizontal' ? posY : (100 - posX);

                return (
                  <div 
                    key={player.id || idx}
                    style={{ left: `${leftPercent}%`, top: `${topPercent}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group"
                  >
                    <div className="w-6 h-6 rounded-full bg-blue-600 border border-white text-[10px] font-mono font-black text-white flex items-center justify-center shadow-lg relative cursor-default">
                      {player.number}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-slate-950 text-[8px] font-sans text-white px-1.5 py-0.5 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">
                        {player.name} ({player.position})
                      </div>
                    </div>
                    <span className="text-[7.5px] font-sans font-black text-slate-300 mt-0.5 bg-slate-950/80 px-1 rounded leading-none truncate max-w-[50px]">
                      {player.name ? player.name.split(' ').pop() : `Player`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* COLUMN 2: starting XI Player Details Table & Actions */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">Edit Starter Rosters</span>
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-mono text-slate-500 uppercase">Head Coach:</label>
              <input 
                type="text"
                value={activeCoach}
                onChange={(e) => handleCoachChange(editTeam, e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white max-w-[150px] font-bold focus:outline-none focus:border-blue-500"
                placeholder="Coach Name"
                id="input-lineups-coach"
              />
            </div>
          </div>

          {/* TABLE OF PLAYERS */}
          <div className="overflow-x-auto max-h-[350px] overflow-y-auto border border-slate-850 rounded-xl shadow-inner">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 text-[10px] font-mono uppercase border-b border-slate-850 sticky top-0 z-10">
                <tr>
                  <th className="px-3 py-2 w-16 text-center">Jersey</th>
                  <th className="px-3 py-2">Full Player Name</th>
                  <th className="px-3 py-2 w-28 text-center">Role / Position</th>
                  <th className="px-3 py-2 w-24 text-center">Coordinates</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {activeXI.map((player, idx) => (
                  <tr key={player.id || idx} className="hover:bg-slate-950/40">
                    {/* Jersey number */}
                    <td className="px-3 py-1.5 text-center">
                      <input 
                        type="number"
                        value={player.number}
                        onChange={(e) => handlePlayerChange(editTeam, idx, 'number', parseInt(e.target.value) || 0)}
                        className="bg-slate-950 border border-slate-800 text-center rounded px-1.5 py-1 text-xs w-11 text-white font-mono focus:outline-none focus:border-blue-500"
                        min="1"
                        max="99"
                      />
                    </td>

                    {/* Name */}
                    <td className="px-3 py-1.5">
                      <input 
                        type="text"
                        value={player.name}
                        onChange={(e) => handlePlayerChange(editTeam, idx, 'name', e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs w-full text-white font-medium focus:outline-none focus:border-blue-500"
                        placeholder="Player Name"
                      />
                    </td>

                    {/* Role */}
                    <td className="px-3 py-1.5">
                      <select 
                        value={player.position}
                        onChange={(e) => handlePlayerChange(editTeam, idx, 'position', e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-xs w-full text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="GK">GK (Goalkeeper)</option>
                        <option value="DF">DF (Defender)</option>
                        <option value="MF">MF (Midfielder)</option>
                        <option value="FW">FW (Forward)</option>
                      </select>
                    </td>

                    {/* Coordinates */}
                    <td className="px-3 py-1.5 text-center text-[10px] font-mono text-slate-500">
                      ({player.x}%, {player.y}%)
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ON-AIR LINEUPS DISPLAY BROADCAST TRIGGERS */}
          <div className="flex flex-col sm:flex-row justify-between items-center bg-slate-950/50 p-4 rounded-xl border border-slate-850 gap-4 mt-2">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-mono font-black uppercase leading-none">STARTING XI ON-AIR TRIGGERS</span>
              <span className="text-[9px] text-slate-500 mt-1">Render fully styled Starting XI boards directly onto the live stream.</span>
            </div>

            <div className="flex gap-2 flex-wrap justify-end">
              {state.lineups.activeLineupView && (
                <button 
                  onClick={() => setLineupView(null)}
                  className="px-3 py-2 bg-red-950/40 border border-red-900/40 hover:bg-red-900/20 text-red-400 font-bold rounded-lg text-[10px] uppercase transition-all flex items-center gap-1 cursor-pointer"
                  id="btn-lineups-hide-overlay"
                >
                  <EyeOff className="w-3.5 h-3.5" /> Hide XI
                </button>
              )}
              
              <button 
                onClick={() => setLineupView('home')}
                className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer flex items-center gap-1 ${
                  state.lineups.activeLineupView === 'home' 
                    ? 'bg-blue-600 text-white shadow' 
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
                id="btn-lineups-push-home"
              >
                <Save className="w-3.5 h-3.5" /> PUSH HOME XI
              </button>

              <button 
                onClick={() => setLineupView('away')}
                className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer flex items-center gap-1 ${
                  state.lineups.activeLineupView === 'away' 
                    ? 'bg-blue-600 text-white shadow' 
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
                id="btn-lineups-push-away"
              >
                <Save className="w-3.5 h-3.5" /> PUSH AWAY XI
              </button>

              <button 
                onClick={() => setLineupView('vs')}
                className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer flex items-center gap-1 ${
                  state.lineups.activeLineupView === 'vs' 
                    ? 'bg-blue-600 text-white shadow' 
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
                id="btn-lineups-push-vs"
              >
                PUSH VS LAYOUT
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
