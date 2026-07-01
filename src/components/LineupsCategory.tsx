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
      let targetXI = team === 'home' ? [...prev.lineups.homeStartingXI] : [...prev.lineups.awayStartingXI];
      if (!targetXI[index]) return prev;

      if (field === 'isCaptain' && value === true) {
        // Untick other captains on the same team
        targetXI = targetXI.map((player, idx) => ({
          ...player,
          isCaptain: idx === index,
        }));
      } else {
        targetXI[index] = {
          ...targetXI[index],
          [field]: value,
        };
      }

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

      <div className="flex flex-col gap-6">
        
        {/* starting XI Player Details Table & Actions */}
        <div className="w-full flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">Edit Starter Rosters</span>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Roster Option:</label>
                <select 
                  value={state.lineups.rosterSize || 11}
                  onChange={(e) => {
                    const size = parseInt(e.target.value) || 11;
                    updateState((prev) => ({
                      ...prev,
                      lineups: {
                        ...prev.lineups,
                        rosterSize: size,
                      }
                    }));
                  }}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white font-bold focus:outline-none focus:border-blue-500 cursor-pointer"
                  id="select-lineups-roster-size"
                >
                  <option value={6}>6 Players</option>
                  <option value={7}>7 Players</option>
                  <option value={8}>8 Players</option>
                  <option value={9}>9 Players</option>
                  <option value={10}>10 Players</option>
                  <option value={11}>11 Players</option>
                </select>
              </div>

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
          </div>

          {/* TABLE OF PLAYERS */}
          <div className="overflow-x-auto max-h-[350px] overflow-y-auto border border-slate-850 rounded-xl shadow-inner">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 text-[10px] font-mono uppercase border-b border-slate-850 sticky top-0 z-10">
                <tr>
                  <th className="px-3 py-2 w-16 text-center">Jersey</th>
                  <th className="px-3 py-2">Full Player Name</th>
                  <th className="px-3 py-2 w-32 text-center">Role / Position</th>
                  <th className="px-3 py-2 w-24 text-center">Captain</th>
                  <th className="px-3 py-2">Portrait URL (Captain Only)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {activeXI.slice(0, state.lineups.rosterSize || 11).map((player, idx) => (
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

                    {/* Captain */}
                    <td className="px-3 py-1.5 text-center">
                      <input 
                        type="checkbox"
                        checked={!!player.isCaptain}
                        onChange={(e) => handlePlayerChange(editTeam, idx, 'isCaptain', e.target.checked)}
                        className="w-4 h-4 rounded accent-blue-500 cursor-pointer"
                      />
                    </td>

                     {/* Portrait Photo URL (Captain Only) */}
                    <td className="px-3 py-1.5">
                      {player.isCaptain ? (
                        <input 
                          type="text"
                          value={player.photoUrl || ''}
                          onChange={(e) => handlePlayerChange(editTeam, idx, 'photoUrl', e.target.value)}
                          className="bg-slate-950 border border-amber-500/50 rounded px-2.5 py-1 text-[11px] w-full text-amber-300 focus:outline-none focus:border-amber-500 font-mono shadow-sm"
                          placeholder="Captain Portrait URL (https://...)"
                        />
                      ) : (
                        <span className="text-slate-600 text-[10px] font-mono italic px-2">Captain Only</span>
                      )}
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
