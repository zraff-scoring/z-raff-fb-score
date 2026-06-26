import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, Users, Activity, AlertTriangle, 
  ArrowLeftRight, Heart, Sparkles, Share2, 
  Tv2, CheckCircle, XCircle 
} from 'lucide-react';
import { useBroadcast } from '../hooks/useBroadcast.js';
import { Player, BroadcastState } from '../types.js';

const isImageUrl = (val?: string) => {
  if (!val) return false;
  const trimmed = val.trim();
  return trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/') || trimmed.startsWith('data:') || trimmed.includes('.') || trimmed.includes('/');
};

export default function GraphicsOutput() {
  const { state } = useBroadcast();
  const [replayActive, setReplayActive] = useState(false);

  // Set body to transparent background on mount
  useEffect(() => {
    document.body.className = 'bg-transparent overflow-hidden text-white font-sans w-screen h-screen select-none';
    
    // Listen for the custom "broadcast-replay" event from WebSocket
    const handleReplayEvent = () => {
      setReplayActive(true);
      // Automatically end replay swipe after 2.5 seconds
      setTimeout(() => {
        setReplayActive(false);
      }, 2500);
    };

    const handleReplayEndEvent = () => {
      setReplayActive(false);
    };

    window.addEventListener('broadcast-replay', handleReplayEvent);
    window.addEventListener('broadcast-replay-end', handleReplayEndEvent);
    return () => {
      window.removeEventListener('broadcast-replay', handleReplayEvent);
      window.removeEventListener('broadcast-replay-end', handleReplayEndEvent);
    };
  }, []);

  if (!state || state.hideAllGraphics) {
    return <div className="w-full h-full bg-transparent" id="graphics-root" />;
  }

  // Format timer seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Inline CSS for glowing and shadows
  const scoreGlow = {
    textShadow: '0 0 10px rgba(59, 130, 246, 0.5), 0 0 20px rgba(59, 130, 246, 0.3)',
  };

  const activePeriodLabel = (period: string) => {
    switch(period) {
      case '1ST': return '1st Half';
      case '2ND': return '2nd Half';
      case 'OT1': return 'Extra Time 1';
      case 'OT2': return 'Extra Time 2';
      case 'PEN': return 'Penalties';
      case 'FT': return 'Full Time';
      default: return '';
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden" id="graphics-root">
      
      {/* ---------------------------------------------------- */}
      {/* 1. TOP SCOREBOARD & TIMER */}
      {/* ---------------------------------------------------- */}
      <AnimatePresence>
        {!state.activeReplay && (state.scoreboardStyle || 'classic') === 'classic' && (!state.hideScoreboard || !state.hideTimer) && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ type: 'spring', damping: 20 }}
            className="absolute top-6 left-8 flex items-center bg-slate-950/90 backdrop-blur-md rounded-xl border border-slate-800 shadow-2xl shadow-black/80 overflow-hidden"
            id="obs-scoreboard"
          >
            {/* IN-SCOREBOARD MODERN GOAL FLASH BANNER */}
            <AnimatePresence>
              {state.activeGoal && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: '100%', opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className="absolute inset-0 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 z-50 flex items-center justify-between px-6 overflow-hidden"
                >
                  <div className="flex items-center gap-3 whitespace-nowrap">
                    <span className="bg-slate-950 text-yellow-400 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider animate-bounce">
                      GOAL!
                    </span>
                    <span className="text-slate-950 font-black text-sm uppercase tracking-wide font-sans">
                      {state.activeGoal.scorer.toUpperCase()}
                    </span>
                    <span className="text-slate-950/60 font-mono text-xs font-bold">
                      ({state.activeGoal.minute}')
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 whitespace-nowrap bg-slate-950/10 px-3 py-1 rounded-lg border border-slate-950/10">
                    <span className="text-slate-950 font-black text-xs font-mono">
                      {state.settings.homeTeam.substring(0, 3).toUpperCase()} {state.scoreboard.homeScore} - {state.scoreboard.awayScore} {state.settings.awayTeam.substring(0, 3).toUpperCase()}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* League Tag */}
            {!state.hideScoreboard && (
              <div className="px-3 bg-blue-600 flex flex-col items-center justify-center gap-1 h-14 border-r border-slate-800">
                {isImageUrl(state.settings.competitionLogo) ? (
                  <img 
                    src={state.settings.competitionLogo} 
                    alt="" 
                    className="w-5 h-5 object-contain" 
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="text-sm leading-none">{state.settings.competitionLogo}</span>
                )}
                <span className="text-[10px] uppercase font-mono tracking-widest text-white font-bold rotate-180 writing-mode-vertical" style={{ writingMode: 'vertical-lr' }}>
                  {state.settings.leagueName.substring(0, 3)}
                </span>
              </div>
            )}

            {/* Home Team */}
            {!state.hideScoreboard && (
              <div className="flex items-center gap-3 px-4 h-14">
                {state.settings.homeLogo && (
                  isImageUrl(state.settings.homeLogo) ? (
                    <img 
                      src={state.settings.homeLogo} 
                      alt={state.settings.homeTeam} 
                      className="w-7 h-7 object-cover rounded-full border border-slate-700 bg-slate-800"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="text-xl leading-none flex items-center justify-center w-7 h-7">{state.settings.homeLogo}</span>
                  )
                )}
                <span className="font-sans font-extrabold text-sm tracking-wide text-white uppercase w-12 text-center">
                  {state.settings.homeTeam.substring(0, 3).toUpperCase()}
                </span>

                {/* Yellow/Red Cards indicators */}
                <div className="flex flex-col gap-0.5 justify-center items-center shrink-0">
                  {state.stats.yellowCardsHome > 0 && (
                    <div className="flex items-center justify-center bg-yellow-400 text-slate-950 font-mono font-black text-[8px] w-2.5 h-3.5 rounded-sm shadow-sm" title={`${state.stats.yellowCardsHome} Yellow Card(s)`}>
                      {state.stats.yellowCardsHome > 1 ? state.stats.yellowCardsHome : ''}
                    </div>
                  )}
                  {state.stats.redCardsHome > 0 && (
                    <div className="flex items-center justify-center bg-red-600 text-white font-mono font-black text-[8px] w-2.5 h-3.5 rounded-sm shadow-sm animate-pulse" title={`${state.stats.redCardsHome} Red Card(s)`}>
                      {state.stats.redCardsHome > 1 ? state.stats.redCardsHome : ''}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Score HUD */}
            {!state.hideScoreboard && (
              <div className="flex items-center justify-center bg-slate-900/90 px-5 h-14 border-x border-slate-800 relative min-w-[100px]">
                <motion.span 
                  key={state.scoreboard.homeScore}
                  initial={{ scale: 1.5, color: '#3b82f6' }}
                  animate={{ scale: 1, color: '#ffffff' }}
                  style={scoreGlow}
                  className="text-2xl font-black font-mono tracking-tight"
                >
                  {state.scoreboard.homeScore}
                </motion.span>
                <span className="mx-2 text-slate-500 font-bold">:</span>
                <motion.span 
                  key={state.scoreboard.awayScore}
                  initial={{ scale: 1.5, color: '#3b82f6' }}
                  animate={{ scale: 1, color: '#ffffff' }}
                  style={scoreGlow}
                  className="text-2xl font-black font-mono tracking-tight"
                >
                  {state.scoreboard.awayScore}
                </motion.span>
              </div>
            )}

            {/* Away Team */}
            {!state.hideScoreboard && (
              <div className="flex items-center gap-3 px-4 h-14">
                {/* Yellow/Red Cards indicators */}
                <div className="flex flex-col gap-0.5 justify-center items-center shrink-0">
                  {state.stats.yellowCardsAway > 0 && (
                    <div className="flex items-center justify-center bg-yellow-400 text-slate-950 font-mono font-black text-[8px] w-2.5 h-3.5 rounded-sm shadow-sm" title={`${state.stats.yellowCardsAway} Yellow Card(s)`}>
                      {state.stats.yellowCardsAway > 1 ? state.stats.yellowCardsAway : ''}
                    </div>
                  )}
                  {state.stats.redCardsAway > 0 && (
                    <div className="flex items-center justify-center bg-red-600 text-white font-mono font-black text-[8px] w-2.5 h-3.5 rounded-sm shadow-sm animate-pulse" title={`${state.stats.redCardsAway} Red Card(s)`}>
                      {state.stats.redCardsAway > 1 ? state.stats.redCardsAway : ''}
                    </div>
                  )}
                </div>

                <span className="font-sans font-extrabold text-sm tracking-wide text-white uppercase w-12 text-center">
                  {state.settings.awayTeam.substring(0, 3).toUpperCase()}
                </span>
                {state.settings.awayLogo && (
                  isImageUrl(state.settings.awayLogo) ? (
                    <img 
                      src={state.settings.awayLogo} 
                      alt={state.settings.awayTeam} 
                      className="w-7 h-7 object-cover rounded-full border border-slate-700 bg-slate-800"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="text-xl leading-none flex items-center justify-center w-7 h-7">{state.settings.awayLogo}</span>
                  )
                )}
              </div>
            )}

            {/* Timer HUD */}
            {!state.hideTimer && (
              <div className={`flex flex-col items-center justify-center bg-blue-950/80 px-4 h-14 min-w-[80px] ${!state.hideScoreboard ? 'border-l border-slate-800' : ''}`}>
                <span className="text-[9px] uppercase font-mono tracking-wider text-blue-400 font-bold">
                  {activePeriodLabel(state.timer.period)}
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-base font-extrabold font-mono text-white tracking-wider">
                    {formatTime(state.timer.timeSeconds)}
                  </span>
                  {state.timer.injuryTimeMinutes > 0 && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="bg-orange-500 text-slate-950 text-[10px] font-black px-1 rounded ml-1"
                    >
                      +{state.timer.injuryTimeMinutes}
                    </motion.span>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------------------------------------------------- */}
      {/* 1.5. WORLD CUP STYLE SCOREBOARD & TIMER */}
      {/* ---------------------------------------------------- */}
      <AnimatePresence>
        {!state.activeReplay && state.scoreboardStyle === 'worldcup' && (!state.hideScoreboard || !state.hideTimer) && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            transition={{ type: 'spring', damping: 20 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center z-40"
            id="obs-scoreboard-worldcup"
          >
            {/* IN-SCOREBOARD MODERN GOAL FLASH BANNER FOR WORLDCUP */}
            <AnimatePresence>
              {state.activeGoal && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 44, opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="w-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 rounded-t-lg flex items-center justify-between px-6 overflow-hidden border-t border-x border-amber-400 shadow-lg shadow-amber-500/10"
                >
                  <div className="flex items-center gap-2 whitespace-nowrap">
                    <span className="bg-slate-950 text-yellow-400 text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider animate-bounce">
                      GOAL!
                    </span>
                    <span className="text-slate-950 font-black text-xs uppercase tracking-wide">
                      {state.activeGoal.scorer.toUpperCase()}
                    </span>
                    <span className="text-slate-950/60 font-mono text-[10px] font-bold">
                      ({state.activeGoal.minute}')
                    </span>
                  </div>
                  <div className="text-slate-950 font-black text-xs font-mono">
                    {state.settings.homeTeam.substring(0, 3).toUpperCase()} {state.scoreboard.homeScore} - {state.scoreboard.awayScore} {state.settings.awayTeam.substring(0, 3).toUpperCase()}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main World Cup Layout */}
            <div className="flex items-center bg-slate-950/95 backdrop-blur-md rounded-xl border border-slate-800 shadow-2xl shadow-black/90 overflow-hidden h-14">
              {/* Competition Pill */}
              {!state.hideScoreboard && (
                <div className="px-3.5 bg-gradient-to-br from-indigo-700 to-blue-900 flex items-center justify-center gap-2 h-full border-r border-slate-800/80">
                  {isImageUrl(state.settings.competitionLogo) ? (
                    <img 
                      src={state.settings.competitionLogo} 
                      alt="" 
                      className="w-5 h-5 object-contain" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="text-base leading-none">{state.settings.competitionLogo}</span>
                  )}
                  <span className="text-[10px] font-black uppercase font-mono tracking-widest text-slate-100">
                    {state.settings.leagueName.substring(0, 3).toUpperCase()}
                  </span>
                </div>
              )}

              {/* Home Team Tab */}
              {!state.hideScoreboard && (
                <div className="flex items-center gap-2.5 px-4 h-full">
                  {state.settings.homeLogo && (
                    isImageUrl(state.settings.homeLogo) ? (
                      <img 
                        src={state.settings.homeLogo} 
                        alt={state.settings.homeTeam} 
                        className="w-6 h-6 object-cover rounded-full border border-slate-75 bg-slate-900"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="text-lg leading-none flex items-center justify-center w-6 h-6">{state.settings.homeLogo}</span>
                    )
                  )}
                  <span className="font-mono font-black text-sm tracking-widest text-slate-100 uppercase">
                    {state.settings.homeTeam.substring(0, 3).toUpperCase()}
                  </span>

                  {/* Yellow/Red Cards indicators */}
                  {(state.stats.yellowCardsHome > 0 || state.stats.redCardsHome > 0) && (
                    <div className="flex gap-1 shrink-0 ml-1">
                      {state.stats.yellowCardsHome > 0 && (
                        <div className="flex items-center justify-center bg-yellow-400 text-slate-950 font-mono font-black text-[8px] w-2 h-3 rounded-sm shadow-sm">
                          {state.stats.yellowCardsHome > 1 ? state.stats.yellowCardsHome : ''}
                        </div>
                      )}
                      {state.stats.redCardsHome > 0 && (
                        <div className="flex items-center justify-center bg-red-600 text-white font-mono font-black text-[8px] w-2 h-3 rounded-sm shadow-sm animate-pulse">
                          {state.stats.redCardsHome > 1 ? state.stats.redCardsHome : ''}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Home Score Badge */}
              {!state.hideScoreboard && (
                <div className="bg-slate-900/90 w-11 h-full flex items-center justify-center border-l border-slate-800/60">
                  <motion.span 
                    key={state.scoreboard.homeScore}
                    initial={{ scale: 1.5, color: '#e2e8f0' }}
                    animate={{ scale: 1, color: '#ffffff' }}
                    className="text-lg font-black font-mono"
                  >
                    {state.scoreboard.homeScore}
                  </motion.span>
                </div>
              )}

              {/* VS Divider/Separator */}
              {!state.hideScoreboard && (
                <div className="w-6 h-full flex items-center justify-center bg-blue-600 font-mono text-[9px] font-black text-white text-center border-x border-slate-850">
                  -
                </div>
              )}

              {/* Away Score Badge */}
              {!state.hideScoreboard && (
                <div className="bg-slate-900/90 w-11 h-full flex items-center justify-center border-r border-slate-800/60">
                  <motion.span 
                    key={state.scoreboard.awayScore}
                    initial={{ scale: 1.5, color: '#e2e8f0' }}
                    animate={{ scale: 1, color: '#ffffff' }}
                    className="text-lg font-black font-mono"
                  >
                    {state.scoreboard.awayScore}
                  </motion.span>
                </div>
              )}

              {/* Away Team Tab */}
              {!state.hideScoreboard && (
                <div className="flex items-center gap-2.5 px-4 h-full border-r border-slate-800/80">
                  {/* Yellow/Red Cards indicators */}
                  {(state.stats.yellowCardsAway > 0 || state.stats.redCardsAway > 0) && (
                    <div className="flex gap-1 shrink-0 mr-1">
                      {state.stats.yellowCardsAway > 0 && (
                        <div className="flex items-center justify-center bg-yellow-400 text-slate-950 font-mono font-black text-[8px] w-2 h-3 rounded-sm shadow-sm">
                          {state.stats.yellowCardsAway > 1 ? state.stats.yellowCardsAway : ''}
                        </div>
                      )}
                      {state.stats.redCardsAway > 0 && (
                        <div className="flex items-center justify-center bg-red-600 text-white font-mono font-black text-[8px] w-2 h-3 rounded-sm shadow-sm animate-pulse">
                          {state.stats.redCardsAway > 1 ? state.stats.redCardsAway : ''}
                        </div>
                      )}
                    </div>
                  )}

                  <span className="font-mono font-black text-sm tracking-widest text-slate-100 uppercase">
                    {state.settings.awayTeam.substring(0, 3).toUpperCase()}
                  </span>
                  {state.settings.awayLogo && (
                    isImageUrl(state.settings.awayLogo) ? (
                      <img 
                        src={state.settings.awayLogo} 
                        alt={state.settings.awayTeam} 
                        className="w-6 h-6 object-cover rounded-full border border-slate-75 bg-slate-900"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="text-lg leading-none flex items-center justify-center w-6 h-6">{state.settings.awayLogo}</span>
                    )
                  )}
                </div>
              )}

              {/* Timer & Half HUD */}
              {!state.hideTimer && (
                <div className="flex flex-col items-center justify-center bg-amber-500/95 px-5 h-full min-w-[85px]">
                  <span className="text-[8px] uppercase font-mono tracking-wider text-amber-950 font-black">
                    {activePeriodLabel(state.timer.period)}
                  </span>
                  <div className="flex items-center gap-0.5">
                    <span className="text-sm font-extrabold font-mono text-slate-950 tracking-wider">
                      {formatTime(state.timer.timeSeconds)}
                    </span>
                    {state.timer.injuryTimeMinutes > 0 && (
                      <span className="bg-slate-950 text-amber-400 text-[9px] font-black px-1 rounded ml-1">
                        +{state.timer.injuryTimeMinutes}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------------------------------------------------- */}
      {/* 2. DYNAMIC GOAL POPUP GRAPHIC */}
      {/* ---------------------------------------------------- */}
      <AnimatePresence>
        {state.activeGoal && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            id="obs-goal-popup"
          >
            <div className="w-[600px] bg-slate-950/95 border-2 border-yellow-500 rounded-3xl p-1 shadow-2xl shadow-yellow-500/20 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-900 via-slate-950 to-blue-900 rounded-[22px] px-8 py-6 relative overflow-hidden">
                {/* Visual lines backdrop */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]" />
                
                {/* Goal Header */}
                <motion.div 
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-col items-center text-center"
                >
                  <div className="px-6 py-1 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-full flex items-center gap-2 shadow-lg shadow-yellow-500/30">
                    <Trophy className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                    <span className="text-slate-950 text-xs font-black uppercase tracking-widest font-sans">
                      Goal Scored
                    </span>
                  </div>
                </motion.div>

                {/* Team Logo and Info */}
                <div className="flex items-center justify-center gap-6 mt-6">
                  {state.activeGoal.team === 'home' ? (
                    state.settings.homeLogo && (
                      isImageUrl(state.settings.homeLogo) ? (
                        <img src={state.settings.homeLogo} alt="" className="w-16 h-16 rounded-full border-2 border-yellow-500 shadow-lg bg-slate-800" referrerPolicy="no-referrer" />
                      ) : (
                        <span className="text-5xl leading-none flex items-center justify-center w-16 h-16">{state.settings.homeLogo}</span>
                      )
                    )
                  ) : (
                    state.settings.awayLogo && (
                      isImageUrl(state.settings.awayLogo) ? (
                        <img src={state.settings.awayLogo} alt="" className="w-16 h-16 rounded-full border-2 border-yellow-500 shadow-lg bg-slate-800" referrerPolicy="no-referrer" />
                      ) : (
                        <span className="text-5xl leading-none flex items-center justify-center w-16 h-16">{state.settings.awayLogo}</span>
                      )
                    )
                  )}

                  <div className="flex flex-col">
                    <span className="text-xs uppercase font-mono tracking-widest text-yellow-400 font-bold">
                      {state.activeGoal.team === 'home' ? state.settings.homeTeam : state.settings.awayTeam}
                    </span>
                    <span className="text-3xl font-black tracking-tight text-white mt-1">
                      {state.activeGoal.scorer}
                    </span>
                    {state.activeGoal.assist && (
                      <span className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-yellow-500" /> Assist: {state.activeGoal.assist}
                      </span>
                    )}
                  </div>
                </div>

                {/* Match Minute */}
                <div className="mt-6 border-t border-slate-800/80 pt-4 flex justify-between items-center text-slate-400 text-xs font-mono">
                  <span>Minute: <strong className="text-yellow-400 font-bold">{state.activeGoal.minute}'</strong></span>
                  <span>Goal #<strong className="text-yellow-400 font-bold">{state.activeGoal.goalNumber}</strong></span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------------------------------------------------- */}
      {/* 3. DYNAMIC CARD POPUPS */}
      {/* ---------------------------------------------------- */}
      <AnimatePresence>
        {state.activeCard && (
          <motion.div 
            key="card-popup"
            initial={{ opacity: 0, x: 200 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 200 }}
            className="absolute bottom-16 right-8 pointer-events-none z-50"
            id="obs-card-popup"
          >
            <div className="flex bg-slate-950/95 border border-slate-800 rounded-2xl p-4 shadow-2xl shadow-black/90 w-80 items-center gap-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-slate-800" />
              
              {/* Card visual */}
              <motion.div 
                initial={{ scale: 0.5, rotate: -15 }}
                animate={{ scale: 1, rotate: 5 }}
                className={`w-10 h-14 rounded-md shadow-lg shrink-0 ${
                  state.activeCard.cardType === 'yellow' ? 'bg-yellow-400 shadow-yellow-500/20 border border-yellow-300' : 'bg-red-500 shadow-red-500/20 border border-red-400'
                }`}
              />

              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 font-bold">
                  {state.activeCard.cardType === 'yellow' ? 'Yellow Card' : 'Red Card'}
                </span>
                <span className="text-lg font-black text-white leading-tight mt-1">
                  {state.activeCard.player}
                </span>
                <span className="text-xs text-blue-400 font-mono mt-1">
                  {state.activeCard.team === 'home' ? state.settings.homeTeam : state.settings.awayTeam} • {state.activeCard.minute}'
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------------------------------------------------- */}
      {/* 4. VAR GRAPHIC OVERLAY */}
      {/* ---------------------------------------------------- */}
      <AnimatePresence>
        {state.activeVAR && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            id="obs-var-popup"
          >
            <div className="w-[550px] bg-slate-950/95 border-2 border-red-600 rounded-2xl p-1 shadow-[0_0_50px_rgba(220,38,38,0.2)] overflow-hidden">
              <div className="bg-slate-950 rounded-xl p-6 relative">
                {/* Scanline effect */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-950/10 to-transparent animate-pulse pointer-events-none" />
                
                {/* Header */}
                <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                  <div className="p-2 bg-red-600 text-white rounded-lg animate-pulse">
                    <Tv2 className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="text-xs font-black uppercase font-mono tracking-widest text-red-500">Video Assistant Referee</span>
                    <h2 className="text-2xl font-black text-white tracking-tight">{state.activeVAR.type.replace('_', ' ')}</h2>
                  </div>
                </div>

                {/* Sub message */}
                <p className="mt-4 text-slate-300 font-semibold text-center border border-slate-800/80 bg-slate-900/40 py-3 px-4 rounded-lg">
                  {state.activeVAR.customMessage || "Decision Pending - Checking System Logs"}
                </p>

                {/* Pulsing Alert Light */}
                <div className="flex justify-center items-center gap-2 mt-4 text-[10px] font-mono uppercase tracking-widest text-red-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping inline-block" />
                  <span>Reviewing Broadcast Replay</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------------------------------------------------- */}
      {/* 5. TEAM LINEUPS (Tactical Formation View) */}
      {/* ---------------------------------------------------- */}
      <AnimatePresence>
        {state.lineups.activeLineupView && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/95 flex items-center justify-center p-12"
            id="obs-lineup-popup"
          >
            <div className="w-full max-w-6xl h-full flex flex-col justify-between relative">
              {/* Title Header */}
              <div className="flex justify-between items-center border-b border-slate-800 pb-6">
                <div>
                  <span className="text-xs font-black uppercase font-mono text-blue-500 tracking-wider">
                    {state.lineups.activeLineupView === 'vs' ? 'Tactical Clash' : 'Starting Lineup'}
                  </span>
                  <h1 className="text-4xl font-black text-white mt-1">
                    {state.lineups.activeLineupView === 'vs' 
                      ? `${state.settings.homeTeam} VS ${state.settings.awayTeam}` 
                      : state.lineups.activeLineupView === 'home' ? state.settings.homeTeam : state.settings.awayTeam
                    }
                  </h1>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs font-mono text-slate-400 block">FORMATION</span>
                    <span className="text-lg font-black text-white font-mono">
                      {state.lineups.activeLineupView === 'away' ? state.lineups.awayFormation : state.lineups.homeFormation}
                    </span>
                  </div>
                  <div className="w-10 h-10 bg-blue-600 flex items-center justify-center rounded-xl">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>

              {/* Grid Content */}
              <div className="grid grid-cols-5 gap-8 my-8 flex-1">
                {/* Left Side: Pitch Tactical Positioning */}
                <div className="col-span-3 bg-gradient-to-b from-blue-950/30 to-slate-900/50 rounded-2xl border border-slate-800/80 p-6 relative overflow-hidden flex items-center justify-center">
                  {/* Pitch outlines */}
                  <div className="absolute inset-4 border border-dashed border-slate-800/60 rounded-xl" />
                  <div className="absolute top-1/2 left-0 right-0 h-px border-t border-dashed border-slate-800/40" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-dashed border-slate-800/40" />
                  
                  {/* Player Pins */}
                  <div className="absolute inset-6">
                    {(state.lineups.activeLineupView === 'away' ? state.lineups.awayStartingXI : state.lineups.homeStartingXI).map((player: Player, idx: number) => {
                      const posX = player.x ?? 10;
                      const posY = player.y ?? 50;
                      return (
                        <motion.div 
                          key={player.id}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.05 }}
                          style={{ left: `${posX}%`, top: `${posY}%` }}
                          className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                        >
                          <div className="w-9 h-9 rounded-full bg-slate-950 border-2 border-blue-500 shadow-lg flex items-center justify-center relative">
                            <span className="text-xs font-mono font-black text-white">{player.number}</span>
                          </div>
                          <div className="bg-slate-950/90 border border-slate-800 rounded px-2 py-0.5 mt-1.5 shadow-md max-w-[100px] truncate text-center">
                            <p className="text-[10px] font-sans font-bold text-white leading-tight truncate">{player.name.split(' ').pop()}</p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* Right Side: Player List */}
                <div className="col-span-2 flex flex-col justify-between bg-slate-900/60 rounded-2xl border border-slate-800/50 p-6">
                  <div>
                    <h3 className="text-sm font-black uppercase font-mono text-slate-400 tracking-wider border-b border-slate-800 pb-2 mb-4"> Roster </h3>
                    <div className="grid grid-cols-1 gap-2.5 max-h-[420px] overflow-y-auto pr-2">
                      {(state.lineups.activeLineupView === 'away' ? state.lineups.awayStartingXI : state.lineups.homeStartingXI).map((player: Player, idx: number) => (
                        <motion.div 
                          key={player.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.04 }}
                          className="flex items-center gap-3 bg-slate-950/40 hover:bg-slate-950/80 border border-slate-800/60 rounded-xl px-4 py-2.5"
                        >
                          <span className="text-sm font-mono font-black text-blue-500 w-5">{player.number}</span>
                          <span className="text-xs font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded uppercase">{player.position}</span>
                          <span className="text-sm font-bold text-white flex-1">{player.name}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-slate-800/80 pt-4 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 block uppercase">HEAD COACH</span>
                      <span className="text-base font-black text-white mt-0.5 block">
                        {state.lineups.activeLineupView === 'away' ? state.lineups.awayCoach : state.lineups.homeCoach}
                      </span>
                    </div>
                    {state.lineups.activeLineupView === 'home' ? (
                      state.settings.homeLogo && (
                        isImageUrl(state.settings.homeLogo) ? (
                          <img src={state.settings.homeLogo} alt="" className="w-10 h-10 rounded-full border border-slate-800 bg-slate-900" referrerPolicy="no-referrer" />
                        ) : (
                          <span className="text-3xl leading-none flex items-center justify-center w-10 h-10">{state.settings.homeLogo}</span>
                        )
                      )
                    ) : (
                      state.settings.awayLogo && (
                        isImageUrl(state.settings.awayLogo) ? (
                          <img src={state.settings.awayLogo} alt="" className="w-10 h-10 rounded-full border border-slate-800 bg-slate-900" referrerPolicy="no-referrer" />
                        ) : (
                          <span className="text-3xl leading-none flex items-center justify-center w-10 h-10">{state.settings.awayLogo}</span>
                        )
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------------------------------------------------- */}
      {/* 6. SUBSTITUTION BOARD */}
      {/* ---------------------------------------------------- */}
      <AnimatePresence>
        {state.activeSubstitution && (
          <motion.div 
            key="substitution-popup"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="absolute bottom-16 left-8 pointer-events-none z-50"
            id="obs-sub-popup"
          >
            <div className="bg-slate-950/95 border-2 border-emerald-500 rounded-2xl overflow-hidden shadow-2xl shadow-black/90 w-96">
              {/* Header Banner */}
              <div className="bg-emerald-600 px-4 py-2 flex justify-between items-center">
                <span className="text-slate-950 font-black text-xs uppercase tracking-widest font-sans flex items-center gap-1.5">
                  <ArrowLeftRight className="w-3.5 h-3.5 stroke-[2.5]" /> Substitution
                </span>
                <span className="bg-slate-950 text-emerald-400 text-xs font-mono font-black px-1.5 py-0.5 rounded">
                  {state.activeSubstitution.minute}'
                </span>
              </div>

              {/* Substitution Details */}
              <div className="p-4 flex flex-col gap-3">
                {/* Team Label */}
                <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2 mb-1">
                  {state.activeSubstitution.team === 'home' ? (
                    state.settings.homeLogo && (
                      isImageUrl(state.settings.homeLogo) ? (
                        <img src={state.settings.homeLogo} alt="" className="w-5 h-5 rounded-full" referrerPolicy="no-referrer" />
                      ) : (
                        <span className="text-base leading-none flex items-center justify-center w-5 h-5">{state.settings.homeLogo}</span>
                      )
                    )
                  ) : (
                    state.settings.awayLogo && (
                      isImageUrl(state.settings.awayLogo) ? (
                        <img src={state.settings.awayLogo} alt="" className="w-5 h-5 rounded-full" referrerPolicy="no-referrer" />
                      ) : (
                        <span className="text-base leading-none flex items-center justify-center w-5 h-5">{state.settings.awayLogo}</span>
                      )
                    )
                  )}
                  <span className="text-xs uppercase font-mono tracking-widest text-emerald-400 font-bold">
                    {state.activeSubstitution.team === 'home' ? state.settings.homeTeam : state.settings.awayTeam}
                  </span>
                </div>

                {/* Player IN (Green Arrow Up) */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">PLAYER IN</span>
                    <span className="text-base font-black text-emerald-400 mt-0.5">{state.activeSubstitution.playerIn}</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <span className="text-lg font-bold">▲</span>
                  </div>
                </div>

                {/* Player OUT (Red Arrow Down) */}
                <div className="flex items-center justify-between border-t border-slate-900/60 pt-3">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">PLAYER OUT</span>
                    <span className="text-base font-black text-red-400 mt-0.5">{state.activeSubstitution.playerOut}</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center">
                    <span className="text-lg font-bold">▼</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------------------------------------------------- */}
      {/* 7. MATCH STATS GRAPHIC */}
      {/* ---------------------------------------------------- */}
      <AnimatePresence>
        {state.stats.activeStatsView && (
          <motion.div 
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            className="absolute bottom-24 left-8 pointer-events-none"
            id="obs-stats-popup"
          >
            <div className="w-[450px] bg-slate-950/95 border border-slate-800 rounded-3xl p-6 shadow-2xl shadow-black/95">
              {/* Header */}
              <div className="border-b border-slate-800 pb-3 mb-5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-blue-500 font-bold">Match Summary</span>
                  <h2 className="text-xl font-black text-white mt-0.5">TEAM STATS</h2>
                </div>
                <Activity className="w-5 h-5 text-blue-500" />
              </div>

              {/* Stats entries */}
              <div className="flex flex-col gap-4">
                {/* Possession Stat */}
                <div className="flex flex-col">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 font-mono">
                    <span>{state.stats.possessionHome}%</span>
                    <span>POSSESSION</span>
                    <span>{100 - state.stats.possessionHome}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
                    <div style={{ width: `${state.stats.possessionHome}%` }} className="bg-blue-500 h-full" />
                    <div style={{ width: `${100 - state.stats.possessionHome}%` }} className="bg-slate-400 h-full" />
                  </div>
                </div>

                {/* Shots Stat */}
                <div className="flex flex-col">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 font-mono">
                    <span>{state.stats.shotsHome}</span>
                    <span>TOTAL SHOTS</span>
                    <span>{state.stats.shotsAway}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
                    <div style={{ width: `${(state.stats.shotsHome / (state.stats.shotsHome + state.stats.shotsAway || 1)) * 100}%` }} className="bg-blue-500 h-full" />
                    <div style={{ width: `${(state.stats.shotsAway / (state.stats.shotsHome + state.stats.shotsAway || 1)) * 100}%` }} className="bg-slate-400 h-full" />
                  </div>
                </div>

                {/* Shots On Target */}
                <div className="flex flex-col">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 font-mono">
                    <span>{state.stats.shotsOnTargetHome}</span>
                    <span>SHOTS ON TARGET</span>
                    <span>{state.stats.shotsOnTargetAway}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
                    <div style={{ width: `${(state.stats.shotsOnTargetHome / (state.stats.shotsOnTargetHome + state.stats.shotsOnTargetAway || 1)) * 100}%` }} className="bg-blue-500 h-full" />
                    <div style={{ width: `${(state.stats.shotsOnTargetAway / (state.stats.shotsOnTargetHome + state.stats.shotsOnTargetAway || 1)) * 100}%` }} className="bg-slate-400 h-full" />
                  </div>
                </div>

                {/* corners */}
                <div className="flex flex-col">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 font-mono">
                    <span>{state.stats.cornersHome}</span>
                    <span>CORNERS</span>
                    <span>{state.stats.cornersAway}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
                    <div style={{ width: `${(state.stats.cornersHome / (state.stats.cornersHome + state.stats.cornersAway || 1)) * 100}%` }} className="bg-blue-500 h-full" />
                    <div style={{ width: `${(state.stats.cornersAway / (state.stats.cornersHome + state.stats.cornersAway || 1)) * 100}%` }} className="bg-slate-400 h-full" />
                  </div>
                </div>

                {/* Expected Goals xG */}
                <div className="flex flex-col">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 font-mono">
                    <span>{state.stats.xGHome.toFixed(2)}</span>
                    <span>Expected Goals (xG)</span>
                    <span>{state.stats.xGAway.toFixed(2)}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
                    <div style={{ width: `${(state.stats.xGHome / (state.stats.xGHome + state.stats.xGAway || 1)) * 100}%` }} className="bg-blue-500 h-full" />
                    <div style={{ width: `${(state.stats.xGAway / (state.stats.xGHome + state.stats.xGAway || 1)) * 100}%` }} className="bg-slate-400 h-full" />
                  </div>
                </div>

                {/* Fouls */}
                <div className="flex flex-col">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 font-mono">
                    <span>{state.stats.foulsHome}</span>
                    <span>FOULS COMMITTED</span>
                    <span>{state.stats.foulsAway}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
                    <div style={{ width: `${(state.stats.foulsHome / (state.stats.foulsHome + state.stats.foulsAway || 1)) * 100}%` }} className="bg-blue-500 h-full" />
                    <div style={{ width: `${(state.stats.foulsAway / (state.stats.foulsHome + state.stats.foulsAway || 1)) * 100}%` }} className="bg-slate-400 h-full" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------------------------------------------------- */}
      {/* 8. LOWER THIRD GRAPHIC */}
      {/* ---------------------------------------------------- */}
      <AnimatePresence>
        {state.activeLowerThird && (
          <motion.div 
            initial={
              state.activeLowerThird.animationType === 'slide-left' ? { x: -300, opacity: 0 } :
              state.activeLowerThird.animationType === 'slide-right' ? { x: 300, opacity: 0 } :
              state.activeLowerThird.animationType === 'reveal-3d' ? { rotateX: 90, opacity: 0, y: 50 } :
              { opacity: 0 }
            }
            animate={
              state.activeLowerThird.animationType === 'reveal-3d' ? { rotateX: 0, opacity: 1, y: 0 } :
              { x: 0, opacity: 1, y: 0 }
            }
            exit={
              state.activeLowerThird.animationType === 'slide-left' ? { x: -300, opacity: 0 } :
              state.activeLowerThird.animationType === 'slide-right' ? { x: 300, opacity: 0 } :
              { opacity: 0 }
            }
            className="absolute bottom-16 left-16 pointer-events-none"
            id="obs-lowerthird-popup"
          >
            <div className="bg-slate-950/95 border-l-4 border-blue-500 rounded-r-2xl px-6 py-4 shadow-2xl shadow-black/80 flex flex-col min-w-[380px] max-w-[550px]">
              <span className="text-[10px] font-mono tracking-widest text-blue-500 font-extrabold uppercase">
                {state.activeLowerThird.type} info
              </span>
              <h2 className="text-2xl font-black text-white mt-1 leading-tight tracking-tight">
                {state.activeLowerThird.title}
              </h2>
              <p className="text-sm text-slate-400 font-medium mt-1">
                {state.activeLowerThird.subtitle}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------------------------------------------------- */}
      {/* 9. SPONSOR SYSTEM BANNER */}
      {/* ---------------------------------------------------- */}
      <AnimatePresence>
        {state.activeSponsor?.type && (
          <motion.div 
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="absolute top-6 right-8 pointer-events-none"
            id="obs-sponsor-popup"
          >
            <div className="bg-slate-950/95 border border-slate-800 rounded-xl px-4 py-2.5 shadow-xl flex items-center gap-3 w-80 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-1.5 h-full bg-blue-500" />
              <div className="w-8 h-8 rounded bg-slate-900 border border-slate-800 flex items-center justify-center text-lg shrink-0">
                {state.activeSponsor.logoUrl || '⭐'}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-[9px] uppercase font-mono tracking-widest text-slate-400 font-black">SPONSORED BY</span>
                <span className="text-sm font-black text-white truncate leading-tight mt-0.5">{state.activeSponsor.sponsorName}</span>
                <span className="text-[10px] text-blue-400 truncate mt-0.5 font-medium">{state.activeSponsor.promoText}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------------------------------------------------- */}
      {/* 10. SOCIAL MEDIA FLOAT */}
      {/* ---------------------------------------------------- */}
      <AnimatePresence>
        {state.activeSocial?.platform && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute bottom-16 right-8 pointer-events-none"
            id="obs-social-popup"
          >
            <div className="bg-slate-950/95 border border-slate-800 rounded-2xl px-5 py-3 shadow-2xl flex items-center gap-3.5 w-76">
              <div className="w-9 h-9 rounded-xl bg-blue-600/15 border border-blue-500/20 text-blue-500 flex items-center justify-center shrink-0">
                <Share2 className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-mono tracking-widest text-blue-400 font-bold">
                  Follow us on {state.activeSocial.platform}
                </span>
                <span className="text-sm font-black text-white mt-0.5 font-mono">
                  {state.activeSocial.handle}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  {state.activeSocial.promoText}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------------------------------------------------- */}
      {/* 11. PENALTY SHOOTOUT HUD */}
      {/* ---------------------------------------------------- */}
      <AnimatePresence>
        {state.penaltyShootout.active && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute bottom-24 left-1/2 -translate-x-1/2 pointer-events-none"
            id="obs-penalty-popup"
          >
            <div className="bg-slate-950/95 border border-slate-800 rounded-3xl p-6 shadow-2xl shadow-black/95 flex flex-col items-center gap-4 w-[500px]">
              <span className="text-xs font-mono uppercase tracking-widest text-red-500 font-black">PENALTY SHOOTOUT</span>
              
              <div className="grid grid-cols-2 gap-8 w-full">
                {/* Home Penalties */}
                <div className="flex flex-col items-center gap-2 border-r border-slate-800/80 pr-4">
                  <span className="text-sm font-black text-white uppercase">{state.settings.homeTeam.substring(0, 3)}</span>
                  <div className="flex items-center gap-1.5">
                    {[0, 1, 2, 3, 4].map((idx) => {
                      const res = state.penaltyShootout.homeAttempts[idx];
                      return (
                        <div key={idx} className="w-6 h-6 rounded-full border border-slate-800 flex items-center justify-center">
                          {res === 'goal' && <CheckCircle className="w-5 h-5 text-emerald-400 fill-emerald-950" />}
                          {res === 'miss' && <XCircle className="w-5 h-5 text-red-500 fill-red-950" />}
                          {res === undefined && <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Away Penalties */}
                <div className="flex flex-col items-center gap-2 pl-4">
                  <span className="text-sm font-black text-white uppercase">{state.settings.awayTeam.substring(0, 3)}</span>
                  <div className="flex items-center gap-1.5">
                    {[0, 1, 2, 3, 4].map((idx) => {
                      const res = state.penaltyShootout.awayAttempts[idx];
                      return (
                        <div key={idx} className="w-6 h-6 rounded-full border border-slate-800 flex items-center justify-center">
                          {res === 'goal' && <CheckCircle className="w-5 h-5 text-emerald-400 fill-emerald-950" />}
                          {res === 'miss' && <XCircle className="w-5 h-5 text-red-500 fill-red-950" />}
                          {res === undefined && <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {state.penaltyShootout.winner && (
                <motion.div 
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="bg-gradient-to-r from-yellow-500 to-amber-600 rounded-full px-5 py-1 text-slate-950 font-black text-xs uppercase tracking-widest mt-2"
                >
                  Winner: {state.penaltyShootout.winner === 'home' ? state.settings.homeTeam : state.settings.awayTeam} 🎉
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------------------------------------------------- */}
      {/* 11.5. WINNER TEAM ANNOUNCEMENT GRAPHIC */}
      {/* ---------------------------------------------------- */}
      <AnimatePresence>
        {state.activeWinnerAnnounce && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md z-45 flex items-center justify-center pointer-events-none"
            id="obs-winner-overlay"
          >
            {/* Animated Golden Sparkles in Background */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    y: '110%', 
                    x: `${Math.random() * 100}%`,
                    scale: Math.random() * 0.8 + 0.4,
                    opacity: 0 
                  }}
                  animate={{ 
                    y: '-10%', 
                    opacity: [0, 0.8, 0.8, 0],
                    rotate: 360
                  }}
                  transition={{ 
                    duration: Math.random() * 4 + 3, 
                    repeat: Infinity,
                    delay: Math.random() * 2
                  }}
                  className="absolute text-amber-400 font-bold"
                  style={{ fontSize: `${Math.random() * 15 + 10}px` }}
                >
                  ⭐
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ scale: 0.8, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: 50, opacity: 0 }}
              transition={{ type: 'spring', damping: 15 }}
              className="bg-gradient-to-b from-slate-900/95 to-slate-950/95 border border-amber-500/30 rounded-3xl p-8 shadow-2xl shadow-amber-500/5 flex flex-col items-center max-w-lg w-full relative overflow-hidden text-center"
            >
              {/* Gold Top Light effect */}
              <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
              
              {/* Trophy Crown */}
              <motion.div 
                animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
                className="w-20 h-20 bg-gradient-to-br from-amber-400 via-yellow-300 to-amber-500 rounded-full flex items-center justify-center shadow-xl shadow-amber-500/20 mb-6 border-4 border-amber-200"
              >
                <Trophy className="w-10 h-10 text-slate-950 stroke-[2.5]" />
              </motion.div>

              <span className="text-amber-400 font-mono text-xs uppercase tracking-[0.25em] font-black mb-1">
                {state.activeWinnerAnnounce.customTitle || 'MATCH CHAMPIONS'}
              </span>

              {/* Winner Name */}
              {state.activeWinnerAnnounce.winner === 'home' && (
                <div className="flex flex-col items-center mt-2 mb-6">
                  {state.settings.homeLogo && (
                    isImageUrl(state.settings.homeLogo) ? (
                      <img 
                        src={state.settings.homeLogo} 
                        alt="" 
                        className="w-16 h-16 object-cover rounded-full border-2 border-amber-400/50 shadow-md mb-3" 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="text-4xl mb-3 block">{state.settings.homeLogo}</span>
                    )
                  )}
                  <h1 className="text-4xl font-black text-white uppercase tracking-tight leading-tight">
                    {state.settings.homeTeam}
                  </h1>
                </div>
              )}

              {state.activeWinnerAnnounce.winner === 'away' && (
                <div className="flex flex-col items-center mt-2 mb-6">
                  {state.settings.awayLogo && (
                    isImageUrl(state.settings.awayLogo) ? (
                      <img 
                        src={state.settings.awayLogo} 
                        alt="" 
                        className="w-16 h-16 object-cover rounded-full border-2 border-amber-400/50 shadow-md mb-3" 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="text-4xl mb-3 block">{state.settings.awayLogo}</span>
                    )
                  )}
                  <h1 className="text-4xl font-black text-white uppercase tracking-tight leading-tight">
                    {state.settings.awayTeam}
                  </h1>
                </div>
              )}

              {state.activeWinnerAnnounce.winner === 'draw' && (
                <div className="flex flex-col items-center mt-2 mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    {isImageUrl(state.settings.homeLogo) ? <img src={state.settings.homeLogo} alt="" className="w-10 h-10 object-cover rounded-full" referrerPolicy="no-referrer" /> : <span className="text-2xl">{state.settings.homeLogo}</span>}
                    <span className="text-slate-400 font-bold text-sm">VS</span>
                    {isImageUrl(state.settings.awayLogo) ? <img src={state.settings.awayLogo} alt="" className="w-10 h-10 object-cover rounded-full" referrerPolicy="no-referrer" /> : <span className="text-2xl">{state.settings.awayLogo}</span>}
                  </div>
                  <h1 className="text-3xl font-black text-white uppercase tracking-tight leading-tight">
                    HONOURS EVEN
                  </h1>
                </div>
              )}

              {/* Score breakdown card */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl py-3 px-6 w-full flex items-center justify-center gap-4 mb-3">
                <span className="font-mono text-sm font-bold text-slate-400 uppercase">{state.settings.homeTeam.substring(0, 3)}</span>
                <span className="font-mono text-2xl font-black text-white">{state.scoreboard.homeScore}</span>
                <span className="text-slate-600 font-bold">:</span>
                <span className="font-mono text-2xl font-black text-white">{state.scoreboard.awayScore}</span>
                <span className="font-mono text-sm font-bold text-slate-400 uppercase">{state.settings.awayTeam.substring(0, 3)}</span>
              </div>

              {/* Bottom text details */}
              <span className="text-[10px] text-slate-500 font-mono tracking-wider uppercase">
                {state.settings.leagueName} • {state.settings.location}
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------------------------------------------------- */}
      {/* 12. FULL SCREEN REPLAY TRANSITION OVERLAY */}
      {/* ---------------------------------------------------- */}
      <AnimatePresence>
        {replayActive && (
          <motion.div 
            initial={{ clipPath: 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)' }}
            animate={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)' }}
            exit={{ clipPath: 'polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)' }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            className="absolute inset-0 bg-blue-900 z-50 flex flex-col items-center justify-center"
            id="obs-replay-transition"
          >
            <motion.div 
              initial={{ scale: 0.2, rotate: -180, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="flex flex-col items-center"
            >
              <div className="w-28 h-28 bg-white text-blue-900 rounded-full flex items-center justify-center shadow-2xl mb-4 border-4 border-blue-400">
                <Trophy className="w-14 h-14" />
              </div>
              <h1 className="text-4xl font-black uppercase text-white tracking-widest">
                Z-raff Sports
              </h1>
              <div className="px-4 py-1 bg-blue-950/80 rounded-full border border-blue-800 mt-2">
                <span className="text-blue-400 font-mono text-xs font-bold uppercase tracking-widest">
                  Instant Replay
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
