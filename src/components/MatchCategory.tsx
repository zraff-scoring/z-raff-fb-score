import { useState, useEffect } from 'react';
import { Settings, ShieldAlert, RotateCcw, EyeOff } from 'lucide-react';
import { BroadcastState } from '../types.js';

interface MatchCategoryProps {
  state: BroadcastState;
  updateState: (updater: BroadcastState | ((prev: BroadcastState) => BroadcastState)) => void;
  clearOverlays: () => void;
  handleFullReset: () => void;
}

export default function MatchCategory({ state, updateState, clearOverlays, handleFullReset }: MatchCategoryProps) {
  // Local form states
  const [homeTeam, setHomeTeam] = useState('');
  const [awayTeam, setAwayTeam] = useState('');
  const [homeLogo, setHomeLogo] = useState('');
  const [awayLogo, setAwayLogo] = useState('');
  const [leagueName, setLeagueName] = useState('');
  const [location, setLocation] = useState('');
  const [referee, setReferee] = useState('');
  const [kickoffTime, setKickoffTime] = useState('');
  const [competitionLogo, setCompetitionLogo] = useState('');
  const [season, setSeason] = useState('');
  const [isConfirmingReset, setIsConfirmingReset] = useState(false);

  // Sync state to form
  useEffect(() => {
    if (state) {
      setHomeTeam(state.settings.homeTeam);
      setAwayTeam(state.settings.awayTeam);
      setHomeLogo(state.settings.homeLogo);
      setAwayLogo(state.settings.awayLogo);
      setLeagueName(state.settings.leagueName);
      setLocation(state.settings.location);
      setReferee(state.settings.referee);
      setKickoffTime(state.settings.kickoffTime);
      setCompetitionLogo(state.settings.competitionLogo);
      setSeason(state.settings.season);
    }
  }, [state]);

  const handleSaveSettings = () => {
    updateState((prev) => ({
      ...prev,
      settings: {
        homeTeam,
        awayTeam,
        homeLogo,
        awayLogo,
        leagueName,
        location,
        referee,
        kickoffTime,
        competitionLogo,
        season,
      }
    }));
  };

  const handleHideAllGraphics = () => {
    updateState((prev) => ({
      ...prev,
      hideAllGraphics: !prev.hideAllGraphics,
    }));
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* MATCH SETTINGS CARD */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-3">
          <Settings className="w-5 h-5 text-blue-500 animate-spin" style={{ animationDuration: '8s' }} />
          <h2 className="text-lg font-black text-white">Broadcast Match Details</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-[10px] font-mono tracking-wider text-slate-400 uppercase mb-1.5 font-bold">Home Team Name</label>
            <input 
              type="text" 
              value={homeTeam}
              onChange={(e) => setHomeTeam(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
              placeholder="e.g. Arsenal"
              id="match-input-homeTeam"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-[10px] font-mono tracking-wider text-slate-400 uppercase mb-1.5 font-bold">Away Team Name</label>
            <input 
              type="text" 
              value={awayTeam}
              onChange={(e) => setAwayTeam(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
              placeholder="e.g. Chelsea"
              id="match-input-awayTeam"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-[10px] font-mono tracking-wider text-slate-400 uppercase mb-1.5 font-bold">Home Logo (Direct Image Link)</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={homeLogo}
                onChange={(e) => setHomeLogo(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                placeholder="e.g. https://domain.com/logo.png"
                id="match-input-homeLogo"
              />
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-[10px] font-mono tracking-wider text-slate-400 uppercase mb-1.5 font-bold">Away Logo (Direct Image Link)</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={awayLogo}
                onChange={(e) => setAwayLogo(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                placeholder="e.g. https://domain.com/logo.png"
                id="match-input-awayLogo"
              />
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-[10px] font-mono tracking-wider text-slate-400 uppercase mb-1.5 font-bold">League / Competition Name</label>
            <input 
              type="text" 
              value={leagueName}
              onChange={(e) => setLeagueName(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
              placeholder="e.g. Premier League"
              id="match-input-leagueName"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-[10px] font-mono tracking-wider text-slate-400 uppercase mb-1.5 font-bold">Venue / Location</label>
            <input 
              type="text" 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
              placeholder="e.g. Emirates Stadium, London"
              id="match-input-location"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-[10px] font-mono tracking-wider text-slate-400 uppercase mb-1.5 font-bold">Match Referee</label>
            <input 
              type="text" 
              value={referee}
              onChange={(e) => setReferee(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
              placeholder="e.g. Michael Oliver"
              id="match-input-referee"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-[10px] font-mono tracking-wider text-slate-400 uppercase mb-1.5 font-bold">Kickoff Time Description</label>
            <input 
              type="text" 
              value={kickoffTime}
              onChange={(e) => setKickoffTime(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
              placeholder="e.g. 20:00 UTC"
              id="match-input-kickoff"
            />
          </div>

          <div className="flex flex-col col-span-1 md:col-span-2">
            <label className="text-[10px] font-mono tracking-wider text-slate-400 uppercase mb-1.5 font-bold">Competition Logo / Emblem (Direct Image Link)</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={competitionLogo}
                onChange={(e) => setCompetitionLogo(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                placeholder="e.g. https://domain.com/logo.png"
                id="match-input-compLogo"
              />
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-[10px] font-mono tracking-wider text-slate-400 uppercase mb-1.5 font-bold">Season Name</label>
            <input 
              type="text" 
              value={season}
              onChange={(e) => setSeason(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
              placeholder="e.g. 2025/2026"
              id="match-input-season"
            />
          </div>
        </div>

        <button 
          onClick={handleSaveSettings}
          className="w-full mt-5 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black rounded-xl text-xs transition-all shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider"
          id="btn-match-commit"
        >
          <Settings className="w-4 h-4" /> COMMIT AND UPDATE MATCH DETAILS
        </button>
      </div>

      {/* EMERGENCY BUTTONS BAR */}
      <div className="bg-slate-900 border border-red-950 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="text-red-500 w-5 h-5 animate-pulse" />
          <div>
            <span className="text-[9px] uppercase font-mono text-slate-400 block tracking-wider">CRITICAL BROADCAST CONTROL</span>
            <h3 className="text-base font-black text-white leading-tight">Emergency Operations</h3>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap items-center">
          <button 
            onClick={handleHideAllGraphics}
            className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-lg ${
              state.hideAllGraphics 
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/10' 
                : 'bg-red-950/40 border border-red-900/60 hover:bg-red-900/40 text-red-400'
            }`}
            id="btn-match-hide-toggle"
          >
            <EyeOff className="w-4 h-4" /> 
            {state.hideAllGraphics ? 'SHOW GRAPHICS (RESUME)' : 'FORCE HIDE GRAPHICS'}
          </button>

          <button 
            onClick={clearOverlays}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold transition-all text-slate-300"
            id="btn-match-clear-overlays"
          >
            Clear Active Overlays
          </button>
          
          {!isConfirmingReset ? (
            <button 
              onClick={() => setIsConfirmingReset(true)}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-red-600/10"
              id="btn-match-full-reset-trigger"
            >
              <RotateCcw className="w-4 h-4" /> Full Reset Match
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-red-950/40 p-1.5 rounded-xl border border-red-900/60" id="match-reset-confirmation">
              <span className="text-[10px] text-red-300 font-bold px-2 uppercase tracking-tight">Confirm full reset?</span>
              <button 
                onClick={() => {
                  handleFullReset();
                  setIsConfirmingReset(false);
                }}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-[10px] transition-all uppercase"
                id="btn-match-confirm-reset"
              >
                Yes, Reset
              </button>
              <button 
                onClick={() => setIsConfirmingReset(false)}
                className="px-3 py-1.5 bg-slate-850 hover:bg-slate-800 text-slate-300 font-bold rounded-lg text-[10px] transition-all uppercase"
                id="btn-match-cancel-reset"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
