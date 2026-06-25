import { useState } from 'react';
import { Trophy, Activity, Star, Circle, CheckCircle2, XCircle, RotateCcw, RefreshCw, EyeOff } from 'lucide-react';
import { BroadcastState } from '../types.js';

interface ScoreboardCategoryProps {
  state: BroadcastState;
  updateState: (updater: BroadcastState | ((prev: BroadcastState) => BroadcastState)) => void;
}

export default function ScoreboardCategory({ state, updateState }: ScoreboardCategoryProps) {
  // Goal event popup form state
  const [goalTeam, setGoalTeam] = useState<'home' | 'away'>('home');
  const [goalScorer, setGoalScorer] = useState('');
  const [goalAssist, setGoalAssist] = useState('');
  const [goalMinute, setGoalMinute] = useState(45);
  const [goalNumber, setGoalNumber] = useState(1);
  const [autoIncrementScore, setAutoIncrementScore] = useState(true);

  // Scoreboard manual increments/decrements
  const adjustScore = (team: 'home' | 'away', amount: number) => {
    updateState((prev) => {
      const currentScore = team === 'home' ? prev.scoreboard.homeScore : prev.scoreboard.awayScore;
      const newScore = Math.max(0, currentScore + amount);
      return {
        ...prev,
        scoreboard: {
          ...prev.scoreboard,
          [team === 'home' ? 'homeScore' : 'awayScore']: newScore,
        }
      };
    });
  };

  const handleResetScores = () => {
    updateState((prev) => ({
      ...prev,
      scoreboard: { homeScore: 0, awayScore: 0 }
    }));
  };

  // Trigger goal popup (and optionally auto increment score)
  const triggerGoalPopup = () => {
    updateState((prev) => {
      const nextScore = autoIncrementScore 
        ? (goalTeam === 'home' ? prev.scoreboard.homeScore + 1 : prev.scoreboard.awayScore + 1)
        : null;

      const updatedScoreboard = nextScore !== null 
        ? {
            ...prev.scoreboard,
            [goalTeam === 'home' ? 'homeScore' : 'awayScore']: nextScore
          }
        : prev.scoreboard;

      return {
        ...prev,
        scoreboard: updatedScoreboard,
        activeGoal: {
          team: goalTeam,
          scorer: goalScorer || 'Unidentified Scorer',
          assist: goalAssist || '',
          minute: goalMinute,
          goalNumber,
        }
      };
    });

    // Auto hide goal popup after 8 seconds
    setTimeout(() => {
      updateState((prev) => ({ ...prev, activeGoal: null }));
    }, 8000);
  };

  // Penalty Shootout HUD Handlers
  const handleAddPenaltyResult = (team: 'home' | 'away', success: boolean) => {
    updateState((prev) => {
      const currentAttempts = team === 'home' ? prev.penaltyShootout.homeAttempts : prev.penaltyShootout.awayAttempts;
      if (currentAttempts.length >= 10) return prev; // Limit to 10 max

      const result: 'goal' | 'miss' = success ? 'goal' : 'miss';
      const updatedAttempts = [...currentAttempts, result];

      return {
        ...prev,
        penaltyShootout: {
          ...prev.penaltyShootout,
          homeAttempts: team === 'home' ? updatedAttempts : prev.penaltyShootout.homeAttempts,
          awayAttempts: team === 'away' ? updatedAttempts : prev.penaltyShootout.awayAttempts,
        }
      };
    });
  };

  const handleClearPenalties = () => {
    updateState((prev) => ({
      ...prev,
      penaltyShootout: {
        active: false,
        homeAttempts: [],
        awayAttempts: [],
        winner: null,
      }
    }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* COLUMN 1: SCOREBOARD MANUAL CONTROLS & PENALTY SHOOTOUT */}
      <div className="flex flex-col gap-6">
        
        {/* SCOREBOARD MANUAL CONTROLS */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500 animate-pulse" />
              <h2 className="text-lg font-black text-white">Manual Scoreboard Controls</h2>
            </div>
            {state.activeGoal && (
              <span className="bg-amber-500/10 text-amber-400 text-[9px] font-mono font-bold px-2 py-0.5 rounded border border-amber-500/20 animate-pulse">
                GOAL FLASH ACTIVE
              </span>
            )}
          </div>

          <div className="flex justify-between items-center bg-slate-950 p-4 rounded-xl border border-slate-850 mb-4 gap-6">
            {/* Home Score */}
            <div className="flex flex-col items-center flex-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 truncate max-w-[120px] font-bold">
                {state.settings.homeTeam || 'Home'}
              </span>
              <input 
                type="number"
                value={state.scoreboard.homeScore}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val) && val >= 0) {
                    updateState(prev => ({
                      ...prev,
                      scoreboard: {
                        ...prev.scoreboard,
                        homeScore: val
                      }
                    }));
                  }
                }}
                className="w-20 text-center text-4xl font-black text-white bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl font-mono mb-3 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                min="0"
                id="input-score-home-direct"
              />
              <div className="flex gap-1.5 w-full">
                <button 
                  onClick={() => adjustScore('home', -1)} 
                  className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                  id="btn-score-home-minus"
                >
                  -1
                </button>
                <button 
                  onClick={() => adjustScore('home', 1)} 
                  className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
                  id="btn-score-home-plus"
                >
                  +1
                </button>
              </div>
            </div>

            {/* VS Divider */}
            <div className="text-slate-600 font-mono text-xs font-black px-2.5 py-1 bg-slate-900 rounded-lg">
              VS
            </div>

            {/* Away Score */}
            <div className="flex flex-col items-center flex-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 truncate max-w-[120px] font-bold">
                {state.settings.awayTeam || 'Away'}
              </span>
              <input 
                type="number"
                value={state.scoreboard.awayScore}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val) && val >= 0) {
                    updateState(prev => ({
                      ...prev,
                      scoreboard: {
                        ...prev.scoreboard,
                        awayScore: val
                      }
                    }));
                  }
                }}
                className="w-20 text-center text-4xl font-black text-white bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl font-mono mb-3 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                min="0"
                id="input-score-away-direct"
              />
              <div className="flex gap-1.5 w-full">
                <button 
                  onClick={() => adjustScore('away', -1)} 
                  className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                  id="btn-score-away-minus"
                >
                  -1
                </button>
                <button 
                  onClick={() => adjustScore('away', 1)} 
                  className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
                  id="btn-score-away-plus"
                >
                  +1
                </button>
              </div>
            </div>
          </div>

          <button 
            onClick={handleResetScores}
            className="w-full py-2 border border-slate-800 hover:border-slate-700 hover:bg-slate-850 text-slate-400 hover:text-slate-300 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
            id="btn-score-reset"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset Scoreboard to 0-0
          </button>
        </div>

        {/* SCOREBOARD STYLE SELECTOR */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
            <Trophy className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-black text-white">Scoreboard Theme & Layout</h2>
          </div>
          
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            Choose between the classic top-left overlay or the professional bottom-center FIFA World Cup style broadcast scoreboard.
          </p>

          <div className="grid grid-cols-2 gap-3 bg-slate-950 p-1.5 rounded-xl border border-slate-850 mb-4">
            <button
              onClick={() => updateState(prev => ({ ...prev, scoreboardStyle: 'classic' }))}
              className={`py-3 rounded-lg text-xs font-black transition-all uppercase flex flex-col items-center gap-1 cursor-pointer ${
                (state.scoreboardStyle || 'classic') === 'classic'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              id="btn-style-classic"
            >
              <span>Classic Theme</span>
              <span className="text-[9px] opacity-70 font-normal font-mono">Top-Left HUD</span>
            </button>
            <button
              onClick={() => updateState(prev => ({ ...prev, scoreboardStyle: 'worldcup' }))}
              className={`py-3 rounded-lg text-xs font-black transition-all uppercase flex flex-col items-center gap-1 cursor-pointer ${
                state.scoreboardStyle === 'worldcup'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              id="btn-style-worldcup"
            >
              <span>World Cup Theme</span>
              <span className="text-[9px] opacity-70 font-normal font-mono">Bottom-Center HUD</span>
            </button>
          </div>

          <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-850">
            <div>
              <span className="text-xs font-bold text-white block">Visibility Toggle</span>
              <span className="text-[10px] text-slate-400">Temporarily show or hide the scoreboard on stream</span>
            </div>
            <button
              onClick={() => updateState(prev => ({ ...prev, hideScoreboard: !prev.hideScoreboard }))}
              className={`px-4 py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                state.hideScoreboard 
                  ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/10' 
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/10'
              }`}
              id="btn-toggle-scoreboard-visibility"
            >
              {state.hideScoreboard ? 'SCOREBOARD HIDDEN' : 'SCOREBOARD VISIBLE'}
            </button>
          </div>
        </div>

        {/* PENALTY SHOOTOUT TRACKER */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-black text-white">Penalty Shootout HUD</h2>
            </div>

            <button 
              onClick={() => updateState((prev) => ({ ...prev, penaltyShootout: { ...prev.penaltyShootout, active: !prev.penaltyShootout.active } }))}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                state.penaltyShootout.active ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'
              }`}
              id="btn-penalty-hud-toggle"
            >
              {state.penaltyShootout.active ? 'Hide Penalty HUD' : 'Show Penalty HUD'}
            </button>
          </div>

          {!state.penaltyShootout.active ? (
            <p className="text-xs text-slate-500 leading-relaxed">
              Activate the Penalty Shootout HUD during cup matches that proceed to a shootout. This displays a special sequence on the broadcast scoreboard graphic to track active attempts.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              
              {/* Home penalties track */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono text-slate-300 uppercase font-bold truncate max-w-[140px]">
                    {state.settings.homeTeam || 'Home'}
                  </span>
                  <div className="flex gap-1.5">
                    <button 
                      onClick={() => handleAddPenaltyResult('home', false)}
                      className="p-1 bg-slate-950 hover:bg-red-950 border border-slate-800 hover:border-red-900 rounded text-red-500 transition-colors cursor-pointer"
                      id="btn-penalty-home-miss"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleAddPenaltyResult('home', true)}
                      className="p-1 bg-slate-950 hover:bg-emerald-950 border border-slate-800 hover:border-emerald-900 rounded text-emerald-500 transition-colors cursor-pointer"
                      id="btn-penalty-home-goal"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex gap-1.5 bg-slate-950 p-2 rounded-lg border border-slate-850">
                  {Array.from({ length: 5 }).map((_, idx) => {
                    const result = state.penaltyShootout.homeAttempts[idx];
                    return (
                      <div key={idx} className="flex-1 flex justify-center py-1">
                        {result === 'goal' && <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-500/10" />}
                        {result === 'miss' && <XCircle className="w-4 h-4 text-red-500 fill-red-500/10" />}
                        {result === undefined && <Circle className="w-4 h-4 text-slate-700 stroke-[1.5]" />}
                      </div>
                    );
                  })}
                  {state.penaltyShootout.homeAttempts.length > 5 && (
                    <div className="border-l border-slate-800 pl-1.5 flex gap-1.5">
                      {state.penaltyShootout.homeAttempts.slice(5).map((result, idx) => (
                        <div key={idx} className="w-4 h-4 flex items-center justify-center">
                          {result === 'goal' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                          {result === 'miss' && <XCircle className="w-4 h-4 text-red-500" />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Away penalties track */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono text-slate-300 uppercase font-bold truncate max-w-[140px]">
                    {state.settings.awayTeam || 'Away'}
                  </span>
                  <div className="flex gap-1.5">
                    <button 
                      onClick={() => handleAddPenaltyResult('away', false)}
                      className="p-1 bg-slate-950 hover:bg-red-950 border border-slate-800 hover:border-red-900 rounded text-red-500 transition-colors cursor-pointer"
                      id="btn-penalty-away-miss"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleAddPenaltyResult('away', true)}
                      className="p-1 bg-slate-950 hover:bg-emerald-950 border border-slate-800 hover:border-emerald-900 rounded text-emerald-500 transition-colors cursor-pointer"
                      id="btn-penalty-away-goal"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex gap-1.5 bg-slate-950 p-2 rounded-lg border border-slate-850">
                  {Array.from({ length: 5 }).map((_, idx) => {
                    const result = state.penaltyShootout.awayAttempts[idx];
                    return (
                      <div key={idx} className="flex-1 flex justify-center py-1">
                        {result === 'goal' && <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-500/10" />}
                        {result === 'miss' && <XCircle className="w-4 h-4 text-red-500 fill-red-500/10" />}
                        {result === undefined && <Circle className="w-4 h-4 text-slate-700 stroke-[1.5]" />}
                      </div>
                    );
                  })}
                  {state.penaltyShootout.awayAttempts.length > 5 && (
                    <div className="border-l border-slate-800 pl-1.5 flex gap-1.5">
                      {state.penaltyShootout.awayAttempts.slice(5).map((result, idx) => (
                        <div key={idx} className="w-4 h-4 flex items-center justify-center">
                          {result === 'goal' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                          {result === 'miss' && <XCircle className="w-4 h-4 text-red-500" />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <button 
                onClick={handleClearPenalties}
                className="w-full mt-1 py-1.5 border border-slate-800 hover:border-slate-700 hover:bg-slate-850 text-slate-400 hover:text-slate-300 rounded-lg text-[10px] font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                id="btn-penalty-clear"
              >
                <RotateCcw className="w-3 h-3" /> Clear Shootout Data
              </button>
            </div>
          )}
        </div>

      </div>

      {/* COLUMN 2: GOAL GRAPHICS EVENT TRIGGER */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <h2 className="text-lg font-black text-white">Goal Events & Modern Graphic</h2>
            </div>
            {state.activeGoal && (
              <button 
                onClick={() => updateState((prev) => ({ ...prev, activeGoal: null }))}
                className="px-2.5 py-1 text-[10px] rounded-lg font-bold flex items-center gap-1 bg-red-600 hover:bg-red-500 text-white transition-colors cursor-pointer"
                id="btn-goal-hide-popup"
              >
                <EyeOff className="w-3.5 h-3.5" />
                Hide Banner
              </button>
            )}
          </div>

          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            Triggering a goal event launches a premium in-scoreboard animation banner across the stream. Perfect for professional broadcast integration.
          </p>

          <div className="flex flex-col gap-3.5">
            {/* Scoring Team Selector */}
            <div className="flex flex-col">
              <label className="text-[10px] font-mono tracking-wider text-slate-400 uppercase mb-1.5 font-bold">Scoring Team</label>
              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-850">
                <button 
                  onClick={() => setGoalTeam('home')}
                  className={`py-2 rounded-lg text-xs font-bold transition-all uppercase cursor-pointer ${
                    goalTeam === 'home' 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  id="btn-goal-select-home"
                >
                  {state.settings.homeTeam || 'Home Team'}
                </button>
                <button 
                  onClick={() => setGoalTeam('away')}
                  className={`py-2 rounded-lg text-xs font-bold transition-all uppercase cursor-pointer ${
                    goalTeam === 'away' 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  id="btn-goal-select-away"
                >
                  {state.settings.awayTeam || 'Away Team'}
                </button>
              </div>
            </div>

            {/* Scorer / Assist input details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="flex flex-col">
                <label className="text-[10px] font-mono tracking-wider text-slate-400 uppercase mb-1.5 font-bold">Scorer Full Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Bukayo Saka" 
                  value={goalScorer}
                  onChange={(e) => setGoalScorer(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 w-full text-white"
                  id="goal-scorer-name"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-[10px] font-mono tracking-wider text-slate-400 uppercase mb-1.5 font-bold">Assist Provided By</label>
                <input 
                  type="text" 
                  placeholder="e.g. Martin Ødegaard" 
                  value={goalAssist}
                  onChange={(e) => setGoalAssist(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 w-full text-white"
                  id="goal-assist-name"
                />
              </div>
            </div>

            {/* Goal minute and sequence */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="flex flex-col">
                <label className="text-[10px] font-mono tracking-wider text-slate-400 uppercase mb-1.5 font-bold">Match Minute</label>
                <input 
                  type="number" 
                  value={goalMinute}
                  onChange={(e) => setGoalMinute(parseInt(e.target.value) || 0)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 w-full text-white font-mono"
                  min="1"
                  max="120"
                  id="goal-minute"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-[10px] font-mono tracking-wider text-slate-400 uppercase mb-1.5 font-bold">Scorer's Season Goal Count</label>
                <input 
                  type="number" 
                  value={goalNumber}
                  onChange={(e) => setGoalNumber(parseInt(e.target.value) || 1)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 w-full text-white font-mono"
                  min="1"
                  max="99"
                  id="goal-number-count"
                />
              </div>
            </div>

            {/* Auto Score Increment Checkbox */}
            <label className="flex items-center gap-2 px-1 py-1 cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={autoIncrementScore}
                onChange={(e) => setAutoIncrementScore(e.target.checked)}
                className="w-4 h-4 accent-blue-500 bg-slate-950 border border-slate-800 rounded cursor-pointer"
                id="goal-auto-increment"
              />
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tight">
                Automatically increment score by +1 for chosen team
              </span>
            </label>
          </div>
        </div>

        <button 
          onClick={triggerGoalPopup}
          className="w-full mt-6 py-4 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/15 cursor-pointer uppercase tracking-wider"
          id="btn-goal-trigger"
        >
          <Trophy className="w-4 h-4 text-slate-950 stroke-[2.5]" /> SHOW GOAL POPUP ON SCREEN
        </button>

        {/* MATCH WINNER ANNOUNCEMENT OVERLAY */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl mt-6">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400 animate-bounce" />
              <h2 className="text-lg font-black text-white">Winner Announcement Board</h2>
            </div>
            {state.activeWinnerAnnounce && (
              <button 
                onClick={() => updateState((prev) => ({ ...prev, activeWinnerAnnounce: null }))}
                className="px-2.5 py-1 text-[10px] rounded-lg font-bold flex items-center gap-1 bg-red-600 hover:bg-red-500 text-white transition-colors cursor-pointer"
                id="btn-winner-hide"
              >
                <EyeOff className="w-3.5 h-3.5" />
                Hide Banner
              </button>
            )}
          </div>

          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            Announce the match winner with a celebratory, high-impact broadcast overlay complete with final results, logo emblems, and particle motions.
          </p>

          <div className="flex flex-col gap-3.5">
            <div className="flex flex-col">
              <label className="text-[10px] font-mono tracking-wider text-slate-400 uppercase mb-1.5 font-bold">Select Winner Result</label>
              <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-850">
                <button
                  onClick={() => updateState(prev => ({
                    ...prev,
                    activeWinnerAnnounce: {
                      winner: 'home',
                      customTitle: prev.activeWinnerAnnounce?.customTitle || 'MATCH CHAMPIONS'
                    }
                  }))}
                  className={`py-2 rounded-lg text-[10px] font-black transition-all uppercase cursor-pointer truncate ${
                    state.activeWinnerAnnounce?.winner === 'home'
                      ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  id="btn-winner-select-home"
                >
                  {state.settings.homeTeam || 'Home Winner'}
                </button>
                <button
                  onClick={() => updateState(prev => ({
                    ...prev,
                    activeWinnerAnnounce: {
                      winner: 'away',
                      customTitle: prev.activeWinnerAnnounce?.customTitle || 'MATCH CHAMPIONS'
                    }
                  }))}
                  className={`py-2 rounded-lg text-[10px] font-black transition-all uppercase cursor-pointer truncate ${
                    state.activeWinnerAnnounce?.winner === 'away'
                      ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  id="btn-winner-select-away"
                >
                  {state.settings.awayTeam || 'Away Winner'}
                </button>
                <button
                  onClick={() => updateState(prev => ({
                    ...prev,
                    activeWinnerAnnounce: {
                      winner: 'draw',
                      customTitle: prev.activeWinnerAnnounce?.customTitle || 'MATCH COMPLETED'
                    }
                  }))}
                  className={`py-2 rounded-lg text-[10px] font-black transition-all uppercase cursor-pointer truncate ${
                    state.activeWinnerAnnounce?.winner === 'draw'
                      ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  id="btn-winner-select-draw"
                >
                  Draw / Tie
                </button>
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-[10px] font-mono tracking-wider text-slate-400 uppercase mb-1.5 font-bold">Celebration Title</label>
              <input
                type="text"
                placeholder="e.g. CHAMPIONS, WINNER, FULL TIME"
                value={state.activeWinnerAnnounce?.customTitle || 'MATCH CHAMPIONS'}
                onChange={(e) => {
                  const title = e.target.value;
                  updateState(prev => {
                    if (!prev.activeWinnerAnnounce) {
                      const autoWinner = prev.scoreboard.homeScore > prev.scoreboard.awayScore 
                        ? 'home' 
                        : (prev.scoreboard.awayScore > prev.scoreboard.homeScore ? 'away' : 'draw');
                      return {
                        ...prev,
                        activeWinnerAnnounce: {
                          winner: autoWinner,
                          customTitle: title
                        }
                      };
                    }
                    return {
                      ...prev,
                      activeWinnerAnnounce: {
                        ...prev.activeWinnerAnnounce,
                        customTitle: title
                      }
                    };
                  });
                }}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 w-full text-white"
                id="winner-custom-title"
              />
            </div>
            
            <div className="flex gap-2.5 mt-2">
              <button
                onClick={() => {
                  updateState(prev => {
                    const winner = prev.scoreboard.homeScore > prev.scoreboard.awayScore 
                      ? 'home' 
                      : (prev.scoreboard.awayScore > prev.scoreboard.homeScore ? 'away' : 'draw');
                    
                    return {
                      ...prev,
                      activeWinnerAnnounce: {
                        winner,
                        customTitle: prev.activeWinnerAnnounce?.customTitle || (winner === 'draw' ? 'MATCH COMPLETED' : 'MATCH CHAMPIONS')
                      }
                    };
                  });
                }}
                className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/15 cursor-pointer uppercase tracking-wider"
                id="btn-winner-trigger"
              >
                <Trophy className="w-4 h-4 text-slate-950 stroke-[2.5]" /> Launch Winner Banner
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
