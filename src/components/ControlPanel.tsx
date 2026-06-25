import { useState, useEffect } from 'react';
import { 
  Activity, Settings, EyeOff, Layout, Cast, HelpCircle, Trophy, Users, Copy, ExternalLink, Tv 
} from 'lucide-react';
import { useBroadcast } from '../hooks/useBroadcast.js';

// Import our modular category components
import MatchCategory from './MatchCategory.js';
import ScoreboardCategory from './ScoreboardCategory.js';
import TimerCategory from './TimerCategory.js';
import LineupsCategory from './LineupsCategory.js';
import OverlaysCategory from './OverlaysCategory.js';

type CategoryType = 'match' | 'scoreboard' | 'timer' | 'lineups' | 'overlays';

export default function ControlPanel() {
  const { state, updateState, triggerReplay, clearOverlays, isConnected } = useBroadcast();
  const [activeCategory, setActiveCategory] = useState<CategoryType>('match');
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/output`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Set background of control panel
  useEffect(() => {
    document.body.className = 'bg-slate-950 text-slate-100 font-sans min-h-screen pb-12 selection:bg-blue-600 selection:text-white';
  }, []);

  // Full manual reset
  const handleFullReset = async () => {
    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      const data = await res.json();
      if (data.success && data.state) {
        // Instantly sync the state in client
        updateState(data.state);
      }
    } catch (err) {
      console.error('Failed to perform server match reset:', err);
    }
  };

  if (!state) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-100 p-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <Activity className="w-12 h-12 text-blue-500 animate-spin" />
          <h2 className="text-xl font-black">Syncing with Live Broadcast Server...</h2>
          <p className="text-xs text-slate-400 max-w-xs">Connecting to WebSocket stream, pulling match configurations.</p>
        </div>
      </div>
    );
  }

  // Quick helper to hide all active stream overlays instantly
  const handleHideAllGraphics = () => {
    updateState((prev) => ({
      ...prev,
      hideAllGraphics: !prev.hideAllGraphics,
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 pt-6">
      
      {/* HEADER STATUS */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl text-white shadow-xl shadow-blue-500/10">
            <Cast className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight text-white leading-none">Z-raff Sports Control Panel</h1>
              <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold tracking-wider uppercase ${
                isConnected ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}>
                {isConnected ? '● Connected' : '○ Offline'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Live broadcast operator deck • Controls live OBS Browser Source output</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Quick Info Modal/Trigger Button */}
          <div className="text-[10px] text-slate-500 hidden xl:flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Hotkey prompt: F11 for Fullscreen on OBS</span>
          </div>

          <button 
            onClick={handleHideAllGraphics}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg cursor-pointer ${
              state.hideAllGraphics 
                ? 'bg-red-600 hover:bg-red-500 text-white' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
            id="btn-global-hide-graphics"
          >
            <EyeOff className="w-4 h-4" /> 
            {state.hideAllGraphics ? 'UNHIDE LIVE GRAPHICS' : 'HIDE ALL OVERLAYS'}
          </button>
        </div>
      </header>

      {/* OBS BROWSER SOURCE UTILITY BAR */}
      <div className="mb-6 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="p-2.5 bg-blue-600/10 text-blue-400 border border-blue-500/15 rounded-xl">
            <Tv className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-black text-white uppercase tracking-wider">OBS Browser Source Overlay URL</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Add this URL as a 1920x1080 Browser Source in OBS Studio to render live match graphics.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono text-[11px] text-slate-300 w-full md:w-80 select-all overflow-hidden truncate">
            {typeof window !== 'undefined' ? `${window.location.origin}/output` : '/output'}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className={`flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
                copied 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-750'
              }`}
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>

            <a
              href="/output"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 shadow-lg shadow-blue-600/15"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Launch</span>
            </a>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* CATEGORY SELECTOR TABS */}
      {/* ---------------------------------------------------- */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {[
          { 
            id: 'match', 
            label: 'Match Setup', 
            icon: Settings, 
            desc: 'Teams, logos, referee, reset', 
            active: false 
          },
          { 
            id: 'scoreboard', 
            label: 'Scoreboard', 
            icon: Trophy, 
            desc: 'Scores, goals, penalty shootouts', 
            active: state.penaltyShootout.active || !!state.activeGoal 
          },
          { 
            id: 'timer', 
            label: 'Match Timer', 
            icon: Activity, 
            desc: 'Play, pause, periods, offset', 
            active: state.timer.isRunning 
          },
          { 
            id: 'lineups', 
            label: 'Lineups & Pitch', 
            icon: Users, 
            desc: 'Formations, player rosters & tactical XI', 
            active: !!state.lineups.activeLineupView 
          },
          { 
            id: 'overlays', 
            label: 'Graphic Overlays', 
            icon: Layout, 
            desc: 'Lower thirds, stats, sponsors, subs, VAR', 
            active: !!(state.activeLowerThird || state.stats.activeStatsView || state.activeSponsor?.type || state.activeSocial?.platform || state.activeCard || state.activeSubstitution || state.activeVAR || state.activeReplay) 
          }
        ].map((cat) => {
          const Icon = cat.icon;
          const isSelected = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as CategoryType)}
              className={`p-4 rounded-2xl border text-left transition-all duration-200 relative overflow-hidden flex flex-col gap-2 group cursor-pointer ${
                isSelected
                  ? 'bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-600/15'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850 hover:border-slate-750'
              }`}
              id={`tab-select-${cat.id}`}
            >
              <div className="flex items-center justify-between w-full">
                <div className={`p-2 rounded-xl transition-colors ${
                  isSelected ? 'bg-blue-500 text-white' : 'bg-slate-950 text-blue-400 group-hover:text-blue-300'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                {cat.active && (
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" title="Active overlay on Stream"></span>
                  </span>
                )}
              </div>
              <div className="mt-1">
                <span className="text-xs font-black tracking-wide block uppercase leading-none">{cat.label}</span>
                <span className={`text-[10px] block mt-1 leading-tight ${
                  isSelected ? 'text-blue-100' : 'text-slate-500 group-hover:text-slate-400'
                }`}>
                  {cat.desc}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* ---------------------------------------------------- */}
      {/* CATEGORY CONTENTS */}
      {/* ---------------------------------------------------- */}
      <main className="transition-all duration-200">
        {activeCategory === 'match' && (
          <MatchCategory 
            state={state} 
            updateState={updateState} 
            clearOverlays={clearOverlays} 
            handleFullReset={handleFullReset} 
          />
        )}

        {activeCategory === 'scoreboard' && (
          <ScoreboardCategory 
            state={state} 
            updateState={updateState} 
          />
        )}

        {activeCategory === 'timer' && (
          <TimerCategory 
            state={state} 
            updateState={updateState} 
          />
        )}

        {activeCategory === 'lineups' && (
          <LineupsCategory 
            state={state} 
            updateState={updateState} 
          />
        )}

        {activeCategory === 'overlays' && (
          <OverlaysCategory 
            state={state} 
            updateState={updateState} 
            triggerReplay={triggerReplay} 
          />
        )}
      </main>

    </div>
  );
}
