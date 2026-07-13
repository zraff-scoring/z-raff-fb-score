import { useState } from 'react';
import { Trophy, Activity, Star, Circle, CheckCircle2, XCircle, RotateCcw, RefreshCw, EyeOff, LayoutGrid, Globe, Plus, Trash2 } from 'lucide-react';
import { BroadcastState, Player } from '../types.js';

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

  // Custom typed names if "custom_manual" option is selected
  const [customScorer, setCustomScorer] = useState('');
  const [customAssist, setCustomAssist] = useState('');

  // Scoreboard manual increments/decrements
  const adjustScore = (team: 'home' | 'away', amount: number) => {
    updateState((prev) => {
      const currentScore = team === 'home' ? prev.scoreboard.homeScore : prev.scoreboard.awayScore;
      const newScore = Math.max(0, currentScore + amount);
      
      const currentGoals = prev.scoreboard.goals || [];
      let updatedGoals = [...currentGoals];
      
      if (amount > 0) {
        // Add a placeholder goal record
        const calculatedMinute = Math.floor(prev.timer.timeSeconds / 60) + 1;
        // Try to pick a name from team's starting XI, or fall back to "Goal"
        const startingXI = team === 'home' ? prev.lineups.homeStartingXI : prev.lineups.awayStartingXI;
        const fallbackScorer = startingXI && startingXI.length > 0 
          ? startingXI[Math.floor(Math.random() * startingXI.length)].name 
          : 'Goal';
          
        updatedGoals.push({
          id: Math.random().toString(36).substring(2, 9),
          team,
          scorer: fallbackScorer,
          minute: calculatedMinute
        });
      } else if (amount < 0) {
        // Remove last goal for this team
        const teamGoals = updatedGoals.filter(g => g.team === team);
        if (teamGoals.length > 0) {
          const lastGoalId = teamGoals[teamGoals.length - 1].id;
          updatedGoals = updatedGoals.filter(g => g.id !== lastGoalId);
        }
      }

      return {
        ...prev,
        scoreboard: {
          ...prev.scoreboard,
          [team === 'home' ? 'homeScore' : 'awayScore']: newScore,
          goals: updatedGoals
        }
      };
    });
  };

  const handleResetScores = () => {
    updateState((prev) => ({
      ...prev,
      scoreboard: { homeScore: 0, awayScore: 0, goals: [] }
    }));
  };

  // Trigger goal popup (and optionally auto increment score)
  const triggerGoalPopup = () => {
    // Automatically calculate the current match minute from the live timer
    const calculatedMinute = Math.floor(state.timer.timeSeconds / 60) + 1;

    const finalScorer = goalScorer === 'custom_manual' ? customScorer : goalScorer;
    const finalAssist = goalAssist === 'custom_manual' ? customAssist : goalAssist;

    updateState((prev) => {
      const nextScore = autoIncrementScore 
        ? (goalTeam === 'home' ? prev.scoreboard.homeScore + 1 : prev.scoreboard.awayScore + 1)
        : null;

      const currentGoals = prev.scoreboard.goals || [];
      const newGoal = {
        id: Math.random().toString(36).substring(2, 9),
        team: goalTeam,
        scorer: finalScorer || 'Goal',
        minute: calculatedMinute
      };

      const updatedScoreboard = {
        ...prev.scoreboard,
        homeScore: nextScore !== null && goalTeam === 'home' ? nextScore : prev.scoreboard.homeScore,
        awayScore: nextScore !== null && goalTeam === 'away' ? nextScore : prev.scoreboard.awayScore,
        goals: [...currentGoals, newGoal]
      };

      return {
        ...prev,
        scoreboard: updatedScoreboard,
        activeGoal: {
          team: goalTeam,
          scorer: finalScorer || '',
          assist: finalAssist || '',
          minute: calculatedMinute,
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

  const activePlayers = goalTeam === 'home'
    ? [
        ...(state.lineups.homeStartingXI || []).slice(0, state.lineups.rosterSize || 11),
        ...(state.lineups.homeSubs || [])
      ]
    : [
        ...(state.lineups.awayStartingXI || []).slice(0, state.lineups.rosterSize || 11),
        ...(state.lineups.awaySubs || [])
      ];

  const activeTeamPlayers = activePlayers.filter(p => p && p.name && p.name.trim() !== '');

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

          {/* Real-time Goals & Scorers List (Syncs with World Cup style Scoreboard) */}
          <div className="border-t border-slate-800/80 pt-4 mt-4 mb-4">
            <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5 font-sans">
              <Trophy className="w-3.5 h-3.5 text-yellow-500" />
              World Cup Scorers & Times
            </h3>
            
            {/* List of active scorers */}
            <div className="grid grid-cols-2 gap-4 text-xs font-mono mb-4">
              {/* Home Goals */}
              <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-850">
                <span className="text-[10px] text-slate-400 font-bold uppercase block border-b border-slate-850/80 pb-1.5 mb-2 truncate">
                  {state.settings.homeTeamShort || 'HOME'} Goals
                </span>
                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                  {(!state.scoreboard.goals || state.scoreboard.goals.filter(g => g.team === 'home').length === 0) ? (
                    <span className="text-slate-600 text-[10px] italic">No goals registered</span>
                  ) : (
                    state.scoreboard.goals.filter(g => g.team === 'home').map((goal) => (
                      <div key={goal.id} className="flex flex-col gap-1 bg-slate-900/80 p-1.5 rounded border border-slate-800">
                        <input 
                          type="text" 
                          value={goal.scorer}
                          onChange={(e) => {
                            const newName = e.target.value;
                            updateState(prev => ({
                              ...prev,
                              scoreboard: {
                                ...prev.scoreboard,
                                goals: (prev.scoreboard.goals || []).map(g => g.id === goal.id ? { ...g, scorer: newName } : g)
                              }
                            }));
                          }}
                          placeholder="Scorer name"
                          className="bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-[10px] text-white focus:outline-none focus:border-blue-500 w-full font-sans font-semibold"
                        />
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1">
                            <span className="text-[9px] text-slate-500">Min:</span>
                            <input 
                              type="number" 
                              value={goal.minute}
                              onChange={(e) => {
                                const newMin = parseInt(e.target.value) || 1;
                                updateState(prev => ({
                                  ...prev,
                                  scoreboard: {
                                    ...prev.scoreboard,
                                    goals: (prev.scoreboard.goals || []).map(g => g.id === goal.id ? { ...g, minute: newMin } : g)
                                  }
                                }));
                              }}
                              className="bg-slate-950 border border-slate-800 rounded w-10 px-1 text-[10px] text-amber-500 text-center font-bold"
                            />
                          </div>
                          <button 
                            onClick={() => {
                              updateState(prev => ({
                                ...prev,
                                scoreboard: {
                                  ...prev.scoreboard,
                                  homeScore: Math.max(0, prev.scoreboard.homeScore - 1),
                                  goals: (prev.scoreboard.goals || []).filter(g => g.id !== goal.id)
                                }
                              }));
                            }}
                            className="text-slate-500 hover:text-red-500 transition-colors p-0.5 cursor-pointer"
                            title="Delete goal"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Away Goals */}
              <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-850">
                <span className="text-[10px] text-slate-400 font-bold uppercase block border-b border-slate-850/80 pb-1.5 mb-2 truncate">
                  {state.settings.awayTeamShort || 'AWAY'} Goals
                </span>
                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                  {(!state.scoreboard.goals || state.scoreboard.goals.filter(g => g.team === 'away').length === 0) ? (
                    <span className="text-slate-600 text-[10px] italic">No goals registered</span>
                  ) : (
                    state.scoreboard.goals.filter(g => g.team === 'away').map((goal) => (
                      <div key={goal.id} className="flex flex-col gap-1 bg-slate-900/80 p-1.5 rounded border border-slate-800">
                        <input 
                          type="text" 
                          value={goal.scorer}
                          onChange={(e) => {
                            const newName = e.target.value;
                            updateState(prev => ({
                              ...prev,
                              scoreboard: {
                                ...prev.scoreboard,
                                goals: (prev.scoreboard.goals || []).map(g => g.id === goal.id ? { ...g, scorer: newName } : g)
                              }
                            }));
                          }}
                          placeholder="Scorer name"
                          className="bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-[10px] text-white focus:outline-none focus:border-blue-500 w-full font-sans font-semibold"
                        />
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1">
                            <span className="text-[9px] text-slate-500">Min:</span>
                            <input 
                              type="number" 
                              value={goal.minute}
                              onChange={(e) => {
                                const newMin = parseInt(e.target.value) || 1;
                                updateState(prev => ({
                                  ...prev,
                                  scoreboard: {
                                    ...prev.scoreboard,
                                    goals: (prev.scoreboard.goals || []).map(g => g.id === goal.id ? { ...g, minute: newMin } : g)
                                  }
                                }));
                              }}
                              className="bg-slate-950 border border-slate-800 rounded w-10 px-1 text-[10px] text-amber-500 text-center font-bold"
                            />
                          </div>
                          <button 
                            onClick={() => {
                              updateState(prev => ({
                                ...prev,
                                scoreboard: {
                                  ...prev.scoreboard,
                                  awayScore: Math.max(0, prev.scoreboard.awayScore - 1),
                                  goals: (prev.scoreboard.goals || []).filter(g => g.id !== goal.id)
                                }
                              }));
                            }}
                            className="text-slate-500 hover:text-red-500 transition-colors p-0.5 cursor-pointer"
                            title="Delete goal"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Quick manual goal scorer adder */}
            <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-850 font-sans">
              <span className="text-[10px] text-slate-400 font-bold uppercase block mb-2">Quick Add Goal Record</span>
              <div className="flex flex-col sm:flex-row gap-2">
                <select 
                  id="quick-goal-team"
                  className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white cursor-pointer focus:outline-none focus:border-blue-500 shrink-0 font-sans"
                >
                  <option value="home">{state.settings.homeTeamShort || 'HOME'}</option>
                  <option value="away">{state.settings.awayTeamShort || 'AWAY'}</option>
                </select>
                
                <input 
                  id="quick-goal-scorer"
                  type="text" 
                  placeholder="Scorer Name" 
                  className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 flex-1 min-w-0 font-sans font-semibold"
                />

                <input 
                  id="quick-goal-minute"
                  type="number" 
                  defaultValue={Math.floor(state.timer.timeSeconds / 60) + 1}
                  placeholder="Min" 
                  className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 w-14 text-center font-mono shrink-0 font-bold text-amber-500"
                />

                <button 
                  onClick={() => {
                    const teamSelect = document.getElementById('quick-goal-team') as HTMLSelectElement;
                    const scorerInput = document.getElementById('quick-goal-scorer') as HTMLInputElement;
                    const minuteInput = document.getElementById('quick-goal-minute') as HTMLInputElement;
                    
                    const team = teamSelect?.value as 'home' | 'away';
                    const scorer = scorerInput?.value?.trim() || 'Goal';
                    const minute = parseInt(minuteInput?.value) || Math.floor(state.timer.timeSeconds / 60) + 1;

                    updateState(prev => {
                      const currentGoals = prev.scoreboard.goals || [];
                      const newGoal = {
                        id: Math.random().toString(36).substring(2, 9),
                        team,
                        scorer,
                        minute
                      };
                      return {
                        ...prev,
                        scoreboard: {
                          ...prev.scoreboard,
                          [team === 'home' ? 'homeScore' : 'awayScore']: prev.scoreboard[team === 'home' ? 'homeScore' : 'awayScore'] + 1,
                          goals: [...currentGoals, newGoal]
                        }
                      };
                    });

                    if (scorerInput) scorerInput.value = '';
                  }}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer shrink-0 font-sans"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
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

        {/* SCOREBOARD THEMES & LAYOUTS */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
            <Trophy className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-black text-white">Scoreboard Themes & Layouts</h2>
          </div>
          
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            Control and display individual broadcast overlays independently. You can activate both simultaneously or hide them separately.
          </p>

          <div className="space-y-3 mb-5">
            {/* Classic Theme Toggle */}
            <div className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-850">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                  <LayoutGrid className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <span className="text-sm font-black text-white block">Classic Theme (Top-Left)</span>
                  <span className="text-[10px] text-slate-400 font-mono">Traditional top-left broadcast HUD</span>
                </div>
              </div>
              <button
                onClick={() => updateState(prev => ({ ...prev, hideClassicScoreboard: !prev.hideClassicScoreboard }))}
                className={`px-4 py-2 rounded-lg text-xs font-black transition-all cursor-pointer min-w-[120px] ${
                  state.hideClassicScoreboard 
                    ? 'bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 shadow-inner' 
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/10'
                }`}
                id="btn-toggle-classic-visibility"
              >
                {state.hideClassicScoreboard ? 'HIDDEN' : 'VISIBLE'}
              </button>
            </div>

            {/* World Cup Theme Toggle */}
            <div className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-850">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                  <Globe className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <span className="text-sm font-black text-white block">World Cup Theme (Bottom-Center)</span>
                  <span className="text-[10px] text-slate-400 font-mono">Professional bottom-centered broadcast HUD</span>
                </div>
              </div>
              <button
                onClick={() => updateState(prev => ({ ...prev, hideWorldcupScoreboard: !prev.hideWorldcupScoreboard }))}
                className={`px-4 py-2 rounded-lg text-xs font-black transition-all cursor-pointer min-w-[120px] ${
                  state.hideWorldcupScoreboard 
                    ? 'bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 shadow-inner' 
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/10'
                }`}
                id="btn-toggle-worldcup-visibility"
              >
                {state.hideWorldcupScoreboard ? 'HIDDEN' : 'VISIBLE'}
              </button>
            </div>
          </div>

          {/* Classic Theme Additions: Sponsor & Tournament Round */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-4 mb-4">
            <span className="text-xs font-black text-slate-300 uppercase tracking-wider block border-b border-slate-850 pb-2">
              Classic Theme Custom Overlay Accessories
            </span>
            
            {/* Sponsor Controls */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Classic Sponsor Header Overlay</span>
                <button
                  onClick={() => updateState(prev => ({ ...prev, classicSponsorVisible: !prev.classicSponsorVisible }))}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    state.classicSponsorVisible
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-900 border border-slate-800 text-slate-400'
                  }`}
                >
                  {state.classicSponsorVisible ? 'Sponsor: ON' : 'Sponsor: OFF'}
                </button>
              </div>
              <input
                type="text"
                value={state.classicSponsorText || ''}
                onChange={(e) => updateState(prev => ({ ...prev, classicSponsorText: e.target.value }))}
                placeholder="Enter Sponsor Name"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-semibold"
              />
            </div>

            {/* Round Controls */}
            <div className="space-y-2 pt-2 border-t border-slate-850">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Classic Tournament Round Footer Overlay</span>
                <button
                  onClick={() => updateState(prev => ({ ...prev, classicRoundVisible: !prev.classicRoundVisible }))}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    state.classicRoundVisible
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-900 border border-slate-800 text-slate-400'
                  }`}
                >
                  {state.classicRoundVisible ? 'Round: ON' : 'Round: OFF'}
                </button>
              </div>
              
              {/* Round selection buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {['Round of 32', 'Round of 16', 'Quarter-Final', 'Semi-Final', 'Final'].map((round) => (
                  <button
                    key={round}
                    onClick={() => updateState(prev => ({ ...prev, classicRoundText: round, classicRoundVisible: true }))}
                    className={`px-2 py-1.5 rounded-lg text-[10px] font-black transition-all truncate cursor-pointer ${
                      state.classicRoundText === round && state.classicRoundVisible
                        ? 'bg-blue-600 text-white border border-blue-500'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800 hover:text-slate-300'
                    }`}
                  >
                    {round}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-850">
            <div>
              <span className="text-xs font-bold text-white block">Master Stream Overlay Toggle</span>
              <span className="text-[10px] text-slate-400">Quickly show/hide all scoreboards and timers</span>
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
              {state.hideScoreboard ? 'ALL HIDDEN' : 'ALL ACTIVE'}
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

              {/* Manual Shootout Winner Override */}
              <div className="flex flex-col gap-1.5 mt-1 border-t border-slate-800/60 pt-3">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Shootout Winner Override</span>
                <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-850">
                  <button
                    type="button"
                    onClick={() => updateState(prev => ({
                      ...prev,
                      penaltyShootout: { ...prev.penaltyShootout, winner: null }
                    }))}
                    className={`py-1.5 rounded-lg text-[9px] font-bold uppercase transition-all cursor-pointer ${
                      state.penaltyShootout.winner === null
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                    id="btn-shootout-win-none"
                  >
                    Auto/None
                  </button>
                  <button
                    type="button"
                    onClick={() => updateState(prev => ({
                      ...prev,
                      penaltyShootout: { ...prev.penaltyShootout, winner: 'home' }
                    }))}
                    className={`py-1.5 rounded-lg text-[9px] font-bold uppercase transition-all cursor-pointer ${
                      state.penaltyShootout.winner === 'home'
                        ? 'bg-emerald-600 text-white font-black'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                    id="btn-shootout-win-home"
                  >
                    {state.settings.homeTeamShort || 'Home'}
                  </button>
                  <button
                    type="button"
                    onClick={() => updateState(prev => ({
                      ...prev,
                      penaltyShootout: { ...prev.penaltyShootout, winner: 'away' }
                    }))}
                    className={`py-1.5 rounded-lg text-[9px] font-bold uppercase transition-all cursor-pointer ${
                      state.penaltyShootout.winner === 'away'
                        ? 'bg-emerald-600 text-white font-black'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                    id="btn-shootout-win-away"
                  >
                    {state.settings.awayTeamShort || 'Away'}
                  </button>
                </div>
              </div>

              <button 
                onClick={handleClearPenalties}
                className="w-full mt-2 py-1.5 border border-slate-800 hover:border-slate-700 hover:bg-slate-850 text-slate-400 hover:text-slate-300 rounded-lg text-[10px] font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
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
                  onClick={() => {
                    setGoalTeam('home');
                    setGoalScorer('');
                    setGoalAssist('');
                    setCustomScorer('');
                    setCustomAssist('');
                  }}
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
                  onClick={() => {
                    setGoalTeam('away');
                    setGoalScorer('');
                    setGoalAssist('');
                    setCustomScorer('');
                    setCustomAssist('');
                  }}
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
                <select 
                  value={goalScorer}
                  onChange={(e) => setGoalScorer(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 w-full text-white cursor-pointer mb-2"
                  id="goal-scorer-select"
                >
                  <option value="">Select Scorer...</option>
                  {activeTeamPlayers.map((player) => (
                    <option key={player.id || player.name} value={player.name}>
                      #{player.number} {player.name} ({player.position})
                    </option>
                  ))}
                  <option value="custom_manual">-- Type Custom Name --</option>
                </select>
                {goalScorer === 'custom_manual' && (
                  <input 
                    type="text" 
                    placeholder="Enter Custom Scorer Name" 
                    value={customScorer}
                    onChange={(e) => setCustomScorer(e.target.value)}
                    className="bg-slate-950 border border-blue-500 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 w-full text-white"
                    id="goal-scorer-custom-input"
                  />
                )}
              </div>
              <div className="flex flex-col">
                <label className="text-[10px] font-mono tracking-wider text-slate-400 uppercase mb-1.5 font-bold">Assist Provided By</label>
                <select 
                  value={goalAssist}
                  onChange={(e) => setGoalAssist(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 w-full text-white cursor-pointer mb-2"
                  id="goal-assist-select"
                >
                  <option value="">None (No Assist)</option>
                  {activeTeamPlayers.map((player) => (
                    <option key={player.id || player.name} value={player.name}>
                      #{player.number} {player.name} ({player.position})
                    </option>
                  ))}
                  <option value="custom_manual">-- Type Custom Name --</option>
                </select>
                {goalAssist === 'custom_manual' && (
                  <input 
                    type="text" 
                    placeholder="Enter Custom Assist Name" 
                    value={customAssist}
                    onChange={(e) => setCustomAssist(e.target.value)}
                    className="bg-slate-950 border border-blue-500 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 w-full text-white"
                    id="goal-assist-custom-input"
                  />
                )}
              </div>
            </div>

            {/* Goal minute and sequence */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="flex flex-col">
                <label className="text-[10px] font-mono tracking-wider text-slate-400 uppercase mb-1.5 font-bold">Match Minute (Auto-Counted)</label>
                <div className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono flex justify-between items-center h-[38px]">
                  <span className="font-bold text-amber-400">{Math.floor(state.timer.timeSeconds / 60) + 1}'</span>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">LIVE TIME</span>
                </div>
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
              <Trophy className="w-5 h-5 text-amber-400" />
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
            {/* Auto Calculated Result Status Block */}
            {(() => {
              const h = state.scoreboard.homeScore;
              const a = state.scoreboard.awayScore;
              let computedWinner: 'home' | 'away' | 'draw' = 'draw';
              let suffix = '';
              
              if (h > a) {
                computedWinner = 'home';
              } else if (a > h) {
                computedWinner = 'away';
              } else {
                const hPens = state.penaltyShootout?.homeAttempts.filter(x => x === 'goal').length || 0;
                const aPens = state.penaltyShootout?.awayAttempts.filter(x => x === 'goal').length || 0;
                const explicitWinner = state.penaltyShootout?.winner;
                
                if (explicitWinner === 'home' || (explicitWinner === null && hPens > aPens)) {
                  computedWinner = 'home';
                  suffix = ` (via Penalties: ${hPens}-${aPens})`;
                } else if (explicitWinner === 'away' || (explicitWinner === null && aPens > hPens)) {
                  computedWinner = 'away';
                  suffix = ` (via Penalties: ${hPens}-${aPens})`;
                } else if (hPens > 0 || aPens > 0) {
                  suffix = ` (Penalties tied: ${hPens}-${aPens})`;
                }
              }
              
              const winnerName = computedWinner === 'home' 
                ? state.settings.homeTeam 
                : (computedWinner === 'away' ? state.settings.awayTeam : 'Draw / Tie');
                
              return (
                <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-mono tracking-wider text-slate-500 uppercase font-black">Calculated Match Result</span>
                    <span className="text-white font-extrabold text-sm mt-0.5 uppercase tracking-wide">
                      {computedWinner === 'draw' ? 'No Winner (Tied Match)' : `${winnerName}${suffix}`}
                    </span>
                  </div>
                  <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-[10px] font-bold rounded-lg uppercase tracking-wider shrink-0">
                    {computedWinner === 'draw' ? 'TIE' : 'WINNER'}
                  </div>
                </div>
              );
            })()}

            <div className="flex flex-col">
              <label className="text-[10px] font-mono tracking-wider text-slate-400 uppercase mb-1.5 font-bold">Banner Text Option</label>
              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-850">
                <button
                  type="button"
                  onClick={() => updateState(prev => {
                    const h = prev.scoreboard.homeScore;
                    const a = prev.scoreboard.awayScore;
                    let winner: 'home' | 'away' | 'draw' = 'draw';
                    if (h > a) winner = 'home';
                    else if (a > h) winner = 'away';
                    else if (prev.penaltyShootout?.winner === 'home') winner = 'home';
                    else if (prev.penaltyShootout?.winner === 'away') winner = 'away';
                    else {
                      const hPens = prev.penaltyShootout?.homeAttempts.filter(x => x === 'goal').length || 0;
                      const aPens = prev.penaltyShootout?.awayAttempts.filter(x => x === 'goal').length || 0;
                      if (hPens > aPens) winner = 'home';
                      else if (aPens > hPens) winner = 'away';
                    }
                    
                    return {
                      ...prev,
                      activeWinnerAnnounce: {
                        winner,
                        customTitle: 'WINNER IS'
                      }
                    };
                  })}
                  className={`py-2 rounded-lg text-[10px] font-black transition-all uppercase cursor-pointer ${
                    (state.activeWinnerAnnounce?.customTitle || 'WINNER IS') === 'WINNER IS'
                      ? 'bg-blue-600 text-white shadow-md font-extrabold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  id="btn-winner-title-winner"
                >
                  Winner Is
                </button>
                <button
                  type="button"
                  onClick={() => updateState(prev => {
                    const h = prev.scoreboard.homeScore;
                    const a = prev.scoreboard.awayScore;
                    let winner: 'home' | 'away' | 'draw' = 'draw';
                    if (h > a) winner = 'home';
                    else if (a > h) winner = 'away';
                    else if (prev.penaltyShootout?.winner === 'home') winner = 'home';
                    else if (prev.penaltyShootout?.winner === 'away') winner = 'away';
                    else {
                      const hPens = prev.penaltyShootout?.homeAttempts.filter(x => x === 'goal').length || 0;
                      const aPens = prev.penaltyShootout?.awayAttempts.filter(x => x === 'goal').length || 0;
                      if (hPens > aPens) winner = 'home';
                      else if (aPens > hPens) winner = 'away';
                    }
                    
                    return {
                      ...prev,
                      activeWinnerAnnounce: {
                        winner,
                        customTitle: 'CHAMPION IS'
                      }
                    };
                  })}
                  className={`py-2 rounded-lg text-[10px] font-black transition-all uppercase cursor-pointer ${
                    state.activeWinnerAnnounce?.customTitle === 'CHAMPION IS'
                      ? 'bg-blue-600 text-white shadow-md font-extrabold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  id="btn-winner-title-champion"
                >
                  Champion Is
                </button>
              </div>
            </div>
            
            <div className="flex gap-2.5 mt-2">
              <button
                onClick={() => {
                  updateState(prev => {
                    const h = prev.scoreboard.homeScore;
                    const a = prev.scoreboard.awayScore;
                    let winner: 'home' | 'away' | 'draw' = 'draw';
                    if (h > a) winner = 'home';
                    else if (a > h) winner = 'away';
                    else if (prev.penaltyShootout?.winner === 'home') winner = 'home';
                    else if (prev.penaltyShootout?.winner === 'away') winner = 'away';
                    else {
                      const hPens = prev.penaltyShootout?.homeAttempts.filter(x => x === 'goal').length || 0;
                      const aPens = prev.penaltyShootout?.awayAttempts.filter(x => x === 'goal').length || 0;
                      if (hPens > aPens) winner = 'home';
                      else if (aPens > hPens) winner = 'away';
                    }
                    
                    return {
                      ...prev,
                      activeWinnerAnnounce: {
                        winner,
                        customTitle: prev.activeWinnerAnnounce?.customTitle || 'WINNER IS'
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
