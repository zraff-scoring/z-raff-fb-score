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
        {!state.activeReplay && (!state.hideScoreboard || !state.hideTimer) && (
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
              <div className="px-3.5 bg-blue-600 flex flex-col items-center justify-center gap-1 h-16 border-r border-slate-800">
                {isImageUrl(state.settings.competitionLogo) ? (
                  <img 
                    src={state.settings.competitionLogo} 
                    alt="" 
                    className="w-8 h-8 object-contain" 
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="text-lg leading-none">{state.settings.competitionLogo}</span>
                )}
                <span className="text-[10px] uppercase font-mono tracking-widest text-white font-black" style={{ writingMode: 'vertical-lr' }}>
                  {state.settings.leagueName.substring(0, 3)}
                </span>
              </div>
            )}

            {/* Home Team */}
            {!state.hideScoreboard && (
              <div className="flex items-center gap-3 px-5 h-16">
                {state.settings.homeLogo && (
                  isImageUrl(state.settings.homeLogo) ? (
                    <img 
                      src={state.settings.homeLogo} 
                      alt={state.settings.homeTeam} 
                      className="w-9 h-9 object-cover rounded-full border border-slate-700 bg-slate-800 shadow"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="text-2xl leading-none flex items-center justify-center w-9 h-9">{state.settings.homeLogo}</span>
                  )
                )}
                <span className="font-sans font-black text-base tracking-wide text-white uppercase w-14 text-center">
                  {state.settings.homeTeam.substring(0, 3).toUpperCase()}
                </span>

                {/* Yellow/Red Cards indicators */}
                <div className="flex flex-col gap-0.5 justify-center items-center shrink-0">
                  {state.stats.yellowCardsHome > 0 && (
                    <div className="flex items-center justify-center bg-yellow-400 text-slate-950 font-mono font-black text-[9px] w-3 h-4 rounded-sm shadow-sm" title={`${state.stats.yellowCardsHome} Yellow Card(s)`}>
                      {state.stats.yellowCardsHome > 1 ? state.stats.yellowCardsHome : ''}
                    </div>
                  )}
                  {state.stats.redCardsHome > 0 && (
                    <div className="flex items-center justify-center bg-red-600 text-white font-mono font-black text-[9px] w-3 h-4 rounded-sm shadow-sm animate-pulse" title={`${state.stats.redCardsHome} Red Card(s)`}>
                      {state.stats.redCardsHome > 1 ? state.stats.redCardsHome : ''}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Score HUD */}
            {!state.hideScoreboard && (
              <div className="flex items-center justify-center bg-slate-900/95 px-6 h-16 border-x border-slate-800 relative min-w-[120px]">
                <motion.span 
                  key={state.scoreboard.homeScore}
                  initial={{ scale: 1.5, color: '#3b82f6' }}
                  animate={{ scale: 1, color: '#ffffff' }}
                  style={scoreGlow}
                  className="text-4xl font-black font-mono tracking-tight"
                >
                  {state.scoreboard.homeScore}
                </motion.span>
                <span className="mx-2.5 text-slate-500 font-black text-xl">:</span>
                <motion.span 
                  key={state.scoreboard.awayScore}
                  initial={{ scale: 1.5, color: '#3b82f6' }}
                  animate={{ scale: 1, color: '#ffffff' }}
                  style={scoreGlow}
                  className="text-4xl font-black font-mono tracking-tight"
                >
                  {state.scoreboard.awayScore}
                </motion.span>
              </div>
            )}

            {/* Away Team */}
            {!state.hideScoreboard && (
              <div className="flex items-center gap-3 px-5 h-16">
                {/* Yellow/Red Cards indicators */}
                <div className="flex flex-col gap-0.5 justify-center items-center shrink-0">
                  {state.stats.yellowCardsAway > 0 && (
                    <div className="flex items-center justify-center bg-yellow-400 text-slate-950 font-mono font-black text-[9px] w-3 h-4 rounded-sm shadow-sm" title={`${state.stats.yellowCardsAway} Yellow Card(s)`}>
                      {state.stats.yellowCardsAway > 1 ? state.stats.yellowCardsAway : ''}
                    </div>
                  )}
                  {state.stats.redCardsAway > 0 && (
                    <div className="flex items-center justify-center bg-red-600 text-white font-mono font-black text-[9px] w-3 h-4 rounded-sm shadow-sm animate-pulse" title={`${state.stats.redCardsAway} Red Card(s)`}>
                      {state.stats.redCardsAway > 1 ? state.stats.redCardsAway : ''}
                    </div>
                  )}
                </div>

                <span className="font-sans font-black text-base tracking-wide text-white uppercase w-14 text-center">
                  {state.settings.awayTeam.substring(0, 3).toUpperCase()}
                </span>
                {state.settings.awayLogo && (
                  isImageUrl(state.settings.awayLogo) ? (
                    <img 
                      src={state.settings.awayLogo} 
                      alt={state.settings.awayTeam} 
                      className="w-9 h-9 object-cover rounded-full border border-slate-700 bg-slate-800 shadow"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="text-2xl leading-none flex items-center justify-center w-9 h-9">{state.settings.awayLogo}</span>
                  )
                )}
              </div>
            )}

            {/* Timer HUD */}
            {!state.hideTimer && (
              <div className={`flex flex-col items-center justify-center bg-blue-950/80 px-5 h-16 min-w-[90px] ${!state.hideScoreboard ? 'border-l border-slate-800' : ''}`}>
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
            className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center z-40 scale-110 md:scale-125"
            id="obs-scoreboard-worldcup"
          >
            {/* IN-SCOREBOARD MODERN GOAL FLASH BANNER FOR WORLDCUP */}
            <AnimatePresence>
              {state.activeGoal && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 50, opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="w-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 rounded-t-xl flex items-center justify-between px-6 overflow-hidden border-t border-x border-amber-400 shadow-lg shadow-amber-500/10"
                >
                  <div className="flex items-center gap-2 whitespace-nowrap">
                    <span className="bg-slate-950 text-yellow-400 text-[10px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider animate-bounce">
                      GOAL!
                    </span>
                    <span className="text-slate-950 font-black text-sm uppercase tracking-wide">
                      {state.activeGoal.scorer.toUpperCase()}
                    </span>
                    <span className="text-slate-950/60 font-mono text-[11px] font-bold">
                      ({state.activeGoal.minute}')
                    </span>
                  </div>
                  <div className="text-slate-950 font-black text-sm font-mono">
                    {state.settings.homeTeam.substring(0, 3).toUpperCase()} {state.scoreboard.homeScore} - {state.scoreboard.awayScore} {state.settings.awayTeam.substring(0, 3).toUpperCase()}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main World Cup Layout */}
            <div className="flex items-center bg-slate-950/95 backdrop-blur-md rounded-2xl border border-slate-800 shadow-2xl shadow-black/95 overflow-hidden h-20">
              {/* Competition Pill */}
              {!state.hideScoreboard && (
                <div className="px-5 bg-gradient-to-br from-indigo-700 to-blue-900 flex items-center justify-center gap-3 h-full border-r border-slate-800/80">
                  {isImageUrl(state.settings.competitionLogo) ? (
                    <img 
                      src={state.settings.competitionLogo} 
                      alt="" 
                      className="w-10 h-10 object-contain" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="text-3xl leading-none">{state.settings.competitionLogo}</span>
                  )}
                  <span className="text-xs font-black uppercase font-mono tracking-widest text-slate-100">
                    {state.settings.leagueName.substring(0, 3).toUpperCase()}
                  </span>
                </div>
              )}

              {/* Home Team Tab */}
              {!state.hideScoreboard && (
                <div className="flex items-center gap-3.5 px-6 h-full">
                  {state.settings.homeLogo && (
                    isImageUrl(state.settings.homeLogo) ? (
                      <img 
                        src={state.settings.homeLogo} 
                        alt={state.settings.homeTeam} 
                        className="w-10 h-10 object-cover rounded-full border border-slate-700 bg-slate-900 shadow"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="text-3xl leading-none flex items-center justify-center w-10 h-10">{state.settings.homeLogo}</span>
                    )
                  )}
                  <span className="font-mono font-black text-2xl tracking-widest text-slate-100 uppercase">
                    {state.settings.homeTeam.substring(0, 3).toUpperCase()}
                  </span>

                  {/* Yellow/Red Cards indicators */}
                  {(state.stats.yellowCardsHome > 0 || state.stats.redCardsHome > 0) && (
                    <div className="flex gap-1 shrink-0 ml-1">
                      {state.stats.yellowCardsHome > 0 && (
                        <div className="flex items-center justify-center bg-yellow-400 text-slate-950 font-mono font-black text-[9px] w-3 h-4 rounded-sm shadow-sm">
                          {state.stats.yellowCardsHome > 1 ? state.stats.yellowCardsHome : ''}
                        </div>
                      )}
                      {state.stats.redCardsHome > 0 && (
                        <div className="flex items-center justify-center bg-red-600 text-white font-mono font-black text-[9px] w-3 h-4 rounded-sm shadow-sm animate-pulse">
                          {state.stats.redCardsHome > 1 ? state.stats.redCardsHome : ''}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Home Score Badge */}
              {!state.hideScoreboard && (
                <div className="bg-slate-900/90 w-16 h-full flex items-center justify-center border-l border-slate-800/60">
                  <motion.span 
                    key={state.scoreboard.homeScore}
                    initial={{ scale: 1.5, color: '#e2e8f0' }}
                    animate={{ scale: 1, color: '#ffffff' }}
                    className="text-3xl font-black font-mono text-white"
                  >
                    {state.scoreboard.homeScore}
                  </motion.span>
                </div>
              )}

              {/* VS Divider/Separator */}
              {!state.hideScoreboard && (
                <div className="w-10 h-full flex items-center justify-center bg-blue-600 font-mono text-sm font-black text-white text-center border-x border-slate-850">
                  -
                </div>
              )}

              {/* Away Score Badge */}
              {!state.hideScoreboard && (
                <div className="bg-slate-900/90 w-16 h-full flex items-center justify-center border-r border-slate-800/60">
                  <motion.span 
                    key={state.scoreboard.awayScore}
                    initial={{ scale: 1.5, color: '#e2e8f0' }}
                    animate={{ scale: 1, color: '#ffffff' }}
                    className="text-3xl font-black font-mono text-white"
                  >
                    {state.scoreboard.awayScore}
                  </motion.span>
                </div>
              )}

              {/* Away Team Tab */}
              {!state.hideScoreboard && (
                <div className="flex items-center gap-3.5 px-6 h-full border-r border-slate-800/80">
                  {/* Yellow/Red Cards indicators */}
                  {(state.stats.yellowCardsAway > 0 || state.stats.redCardsAway > 0) && (
                    <div className="flex gap-1 shrink-0 mr-1">
                      {state.stats.yellowCardsAway > 0 && (
                        <div className="flex items-center justify-center bg-yellow-400 text-slate-950 font-mono font-black text-[9px] w-3 h-4 rounded-sm shadow-sm">
                          {state.stats.yellowCardsAway > 1 ? state.stats.yellowCardsAway : ''}
                        </div>
                      )}
                      {state.stats.redCardsAway > 0 && (
                        <div className="flex items-center justify-center bg-red-600 text-white font-mono font-black text-[9px] w-3 h-4 rounded-sm shadow-sm animate-pulse">
                          {state.stats.redCardsAway > 1 ? state.stats.redCardsAway : ''}
                        </div>
                      )}
                    </div>
                  )}

                  <span className="font-mono font-black text-2xl tracking-widest text-slate-100 uppercase">
                    {state.settings.awayTeam.substring(0, 3).toUpperCase()}
                  </span>
                  {state.settings.awayLogo && (
                    isImageUrl(state.settings.awayLogo) ? (
                      <img 
                        src={state.settings.awayLogo} 
                        alt={state.settings.awayTeam} 
                        className="w-10 h-10 object-cover rounded-full border border-slate-700 bg-slate-900 shadow"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="text-3xl leading-none flex items-center justify-center w-10 h-10">{state.settings.awayLogo}</span>
                    )
                  )}
                </div>
              )}

              {/* Timer & Half HUD */}
              {!state.hideTimer && (
                <div className="flex flex-col items-center justify-center bg-amber-500/95 px-6 h-full min-w-[120px]">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-amber-950 font-black">
                    {activePeriodLabel(state.timer.period)}
                  </span>
                  <div className="flex items-center gap-0.5">
                    <span className="text-xl font-extrabold font-mono text-slate-950 tracking-wider">
                      {formatTime(state.timer.timeSeconds)}
                    </span>
                    {state.timer.injuryTimeMinutes > 0 && (
                      <span className="bg-slate-950 text-amber-400 text-xs font-black px-1.5 py-0.5 rounded ml-1.5">
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
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
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
              {state.lineups.activeLineupView === 'vs' ? (() => {
                const rSize = state.lineups.rosterSize || 11;
                const homeActive = state.lineups.homeStartingXI.slice(0, rSize);
                const awayActive = state.lineups.awayStartingXI.slice(0, rSize);
                const homeCaptain = homeActive.find((p: Player) => p.isCaptain) || homeActive.find((p: Player) => p.position === 'MF') || homeActive[0];
                const awayCaptain = awayActive.find((p: Player) => p.isCaptain) || awayActive.find((p: Player) => p.position === 'MF') || awayActive[0];

                return (
                  <div className="flex flex-col flex-1 my-4 justify-between" id="lineup-vs-showcase">
                    {/* Central Tournament Details Panel */}
                    <div className="bg-slate-900/50 rounded-2xl border border-slate-800/80 p-5 flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden mb-6">
                      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
                      
                      <div className="flex items-center gap-4 mb-2.5">
                        {state.settings.competitionLogo && (
                          isImageUrl(state.settings.competitionLogo) ? (
                            <img src={state.settings.competitionLogo} alt="" className="w-12 h-12 object-contain" referrerPolicy="no-referrer" />
                          ) : (
                            <span className="text-4xl leading-none">{state.settings.competitionLogo}</span>
                          )
                        )}
                        <div>
                          <h2 className="text-2xl font-black text-white tracking-wide uppercase leading-none">{state.settings.leagueName}</h2>
                          <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-widest">{state.settings.season || '2026/2027 SEASON'}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 divide-x divide-slate-800 gap-4 max-w-2xl text-xs font-mono text-slate-400 mt-2">
                        <div className="px-4">
                          <span className="text-[10px] text-slate-500 block uppercase">VENUE</span>
                          <span className="text-white font-bold">{state.settings.location}</span>
                        </div>
                        <div className="px-4">
                          <span className="text-[10px] text-slate-500 block uppercase">KICKOFF</span>
                          <span className="text-white font-bold">{state.settings.kickoffTime}</span>
                        </div>
                        <div className="px-4">
                          <span className="text-[10px] text-slate-500 block uppercase">REFEREE</span>
                          <span className="text-white font-bold">{state.settings.referee}</span>
                        </div>
                      </div>
                    </div>

                    {/* Team Matchup and Captains Block */}
                    <div className="grid grid-cols-11 gap-4 items-stretch flex-1 overflow-hidden">
                      {/* Left Side (Col 5): Home Team Panel */}
                      <div className="col-span-5 bg-gradient-to-b from-blue-950/20 to-slate-900/40 rounded-3xl border border-slate-800/80 p-6 flex flex-col justify-between items-center relative overflow-hidden shadow-xl">
                        {/* Team Title Card */}
                        <div className="flex items-center gap-4 w-full border-b border-slate-800 pb-4 mb-4">
                          {state.settings.homeLogo && (
                            isImageUrl(state.settings.homeLogo) ? (
                              <img src={state.settings.homeLogo} alt="" className="w-14 h-14 rounded-full border-2 border-slate-700 bg-slate-950 object-cover shadow-lg" referrerPolicy="no-referrer" />
                            ) : (
                              <span className="text-4xl leading-none flex items-center justify-center w-14 h-14">{state.settings.homeLogo}</span>
                            )
                          )}
                          <div className="text-left w-full truncate">
                            <span className="text-[10px] font-mono text-blue-400 uppercase tracking-widest block leading-none mb-1">HOME CLUB</span>
                            <h2 className="text-2xl font-black text-white uppercase tracking-tight leading-tight truncate">{state.settings.homeTeam}</h2>
                            <span className="text-xs text-slate-400 font-mono">COACH: {state.lineups.homeCoach}</span>
                          </div>
                        </div>

                        {/* Captain Pic Highlight */}
                        <div className="flex flex-col items-center flex-1 justify-center py-2">
                          <div className="relative mb-3">
                            <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-amber-500 border-2 border-slate-950 flex items-center justify-center text-[10px] font-black text-slate-950 shadow z-10 font-mono">
                              C
                            </div>
                            <div className="w-36 h-36 rounded-full p-0.5 bg-gradient-to-tr from-amber-500 to-yellow-300 shadow-lg shadow-amber-500/10">
                              <div className="w-full h-full rounded-full bg-slate-950 overflow-hidden relative border-4 border-slate-950">
                                {homeCaptain?.photoUrl ? (
                                  <img src={homeCaptain.photoUrl} alt={homeCaptain.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-500">
                                    <span className="text-3xl font-black">#{homeCaptain?.number}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-center">
                            <span className="text-[10px] uppercase font-mono tracking-wider text-amber-400 font-bold bg-amber-950/40 border border-amber-900/30 px-2 py-0.5 rounded">
                              {homeCaptain?.position} • JERSEY #{homeCaptain?.number}
                            </span>
                            <h3 className="text-xl font-black text-white mt-2 tracking-tight uppercase">
                              {homeCaptain?.name || 'No Captain Marked'}
                            </h3>
                            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block mt-0.5">TEAM CAPTAIN</span>
                          </div>
                        </div>
                      </div>

                      {/* Middle (Col 1): Big VS Graphic */}
                      <div className="col-span-1 flex flex-col items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 border border-blue-500 flex items-center justify-center shadow-xl shadow-blue-500/20 text-center relative animate-pulse">
                          <span className="font-sans font-black text-white italic text-lg tracking-wider">VS</span>
                          <div className="absolute -inset-1 rounded-full border border-blue-500/30 pointer-events-none" />
                        </div>
                      </div>

                      {/* Right Side (Col 5): Away Team Panel */}
                      <div className="col-span-5 bg-gradient-to-b from-blue-950/20 to-slate-900/40 rounded-3xl border border-slate-800/80 p-6 flex flex-col justify-between items-center relative overflow-hidden shadow-xl">
                        {/* Team Title Card */}
                        <div className="flex items-center gap-4 w-full border-b border-slate-800 pb-4 mb-4">
                          {state.settings.awayLogo && (
                            isImageUrl(state.settings.awayLogo) ? (
                              <img src={state.settings.awayLogo} alt="" className="w-14 h-14 rounded-full border-2 border-slate-700 bg-slate-950 object-cover shadow-lg" referrerPolicy="no-referrer" />
                            ) : (
                              <span className="text-4xl leading-none flex items-center justify-center w-14 h-14">{state.settings.awayLogo}</span>
                            )
                          )}
                          <div className="text-left w-full truncate">
                            <span className="text-[10px] font-mono text-blue-400 uppercase tracking-widest block leading-none mb-1">AWAY CLUB</span>
                            <h2 className="text-2xl font-black text-white uppercase tracking-tight leading-tight truncate">{state.settings.awayTeam}</h2>
                            <span className="text-xs text-slate-400 font-mono">COACH: {state.lineups.awayCoach}</span>
                          </div>
                        </div>

                        {/* Captain Pic Highlight */}
                        <div className="flex flex-col items-center flex-1 justify-center py-2">
                          <div className="relative mb-3">
                            <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-amber-500 border-2 border-slate-950 flex items-center justify-center text-[10px] font-black text-slate-950 shadow z-10 font-mono">
                              C
                            </div>
                            <div className="w-36 h-36 rounded-full p-0.5 bg-gradient-to-tr from-amber-500 to-yellow-300 shadow-lg shadow-amber-500/10">
                              <div className="w-full h-full rounded-full bg-slate-950 overflow-hidden relative border-4 border-slate-950">
                                {awayCaptain?.photoUrl ? (
                                  <img src={awayCaptain.photoUrl} alt={awayCaptain.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-500">
                                    <span className="text-3xl font-black">#{awayCaptain?.number}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-center">
                            <span className="text-[10px] uppercase font-mono tracking-wider text-amber-400 font-bold bg-amber-950/40 border border-amber-900/30 px-2 py-0.5 rounded">
                              {awayCaptain?.position} • JERSEY #{awayCaptain?.number}
                            </span>
                            <h3 className="text-xl font-black text-white mt-2 tracking-tight uppercase font-bold">
                              {awayCaptain?.name || 'No Captain Marked'}
                            </h3>
                            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block mt-0.5">TEAM CAPTAIN</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
                })() : (
                  <div className="grid grid-cols-12 gap-8 my-8 flex-1 overflow-hidden" id="lineup-team-layout">
                    {/* Left/Center Side (Col span 8): Starting XI Player List in 2-Column Grid */}
                    <div className="col-span-8 flex flex-col justify-between bg-slate-900/40 rounded-2xl border border-slate-800/60 p-6">
                      <div>
                        <div className="flex justify-between items-center border-b border-slate-800/80 pb-3 mb-4">
                          <h3 className="text-sm font-black uppercase font-mono text-blue-400 tracking-wider">
                            STARTING XI ROSTER
                          </h3>
                          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                            <span>COACH:</span>
                            <span className="text-white font-bold uppercase">
                              {state.lineups.activeLineupView === 'away' ? state.lineups.awayCoach : state.lineups.homeCoach || 'Unassigned'}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-2">
                          {(state.lineups.activeLineupView === 'away' ? state.lineups.awayStartingXI : state.lineups.homeStartingXI).slice(0, state.lineups.rosterSize || 11).map((player: Player, idx: number) => {
                            const isCap = player.isCaptain;
                            return (
                              <motion.div 
                                key={player.id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.04 }}
                                className={`flex items-center gap-3 border rounded-xl px-4 py-3 transition-colors ${
                                  isCap 
                                    ? 'bg-gradient-to-r from-amber-500/10 to-amber-600/5 border-amber-500/40 shadow-sm shadow-amber-500/5' 
                                    : 'bg-slate-950/40 hover:bg-slate-950/80 border-slate-850'
                                }`}
                              >
                                <span className={`text-sm font-mono font-black w-5 ${isCap ? 'text-amber-400' : 'text-blue-500'}`}>{player.number}</span>
                                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded uppercase font-bold ${
                                  isCap ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'
                                }`}>{player.position}</span>
                                <span className="text-sm font-bold text-white flex-1 truncate">{player.name}</span>
                                {isCap && (
                                  <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded font-mono uppercase tracking-wider animate-pulse">
                                    C
                                  </span>
                                )}
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="border-t border-slate-800/80 pt-4 flex items-center justify-between mt-4">
                        <div className="flex items-center gap-3">
                          {state.lineups.activeLineupView === 'home' ? (
                            state.settings.homeLogo && (
                              isImageUrl(state.settings.homeLogo) ? (
                                <img src={state.settings.homeLogo} alt="" className="w-10 h-10 rounded-full border border-slate-800 bg-slate-900 object-cover" referrerPolicy="no-referrer" />
                              ) : (
                                <span className="text-3xl leading-none flex items-center justify-center w-10 h-10">{state.settings.homeLogo}</span>
                              )
                            )
                          ) : (
                            state.settings.awayLogo && (
                              isImageUrl(state.settings.awayLogo) ? (
                                <img src={state.settings.awayLogo} alt="" className="w-10 h-10 rounded-full border border-slate-800 bg-slate-900 object-cover" referrerPolicy="no-referrer" />
                              ) : (
                                <span className="text-3xl leading-none flex items-center justify-center w-10 h-10">{state.settings.awayLogo}</span>
                              )
                            )
                          )}
                          <div>
                            <span className="text-[10px] font-mono text-slate-400 block uppercase">TEAM CLUB</span>
                            <span className="text-base font-black text-white block uppercase tracking-wide">
                              {state.lineups.activeLineupView === 'away' ? state.settings.awayTeam : state.settings.homeTeam}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Side (Col span 4): Featured Team Captain Card */}
                    {(() => {
                      const activeRoster = (state.lineups.activeLineupView === 'away' ? state.lineups.awayStartingXI : state.lineups.homeStartingXI).slice(0, state.lineups.rosterSize || 11);
                      const captain = activeRoster.find((p: Player) => p.isCaptain) || activeRoster.find((p: Player) => p.position === 'MF') || activeRoster[0];
                      return (
                        <div className="col-span-4 flex flex-col justify-between bg-gradient-to-b from-amber-500/10 via-slate-900/60 to-slate-900/90 rounded-2xl border border-amber-500/20 p-6 relative overflow-hidden shadow-2xl">
                          {/* Decorative backdrop */}
                          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                          <div className="absolute -left-10 bottom-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

                          <div className="flex flex-col items-center text-center mt-2">
                            {/* Captain Badge */}
                            <div className="px-3 py-1 bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full flex items-center gap-1.5 shadow-md shadow-amber-500/10 mb-6">
                              <Trophy className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" />
                              <span className="text-slate-950 text-[10px] font-black uppercase tracking-widest font-sans">
                                Team Captain
                              </span>
                            </div>

                            {/* Captain Portrait Frame */}
                            <div className="relative mb-6">
                              {/* Armband/Shield ornament */}
                              <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-amber-500 border-2 border-slate-950 flex items-center justify-center text-[10px] font-black text-slate-950 shadow-md z-10 font-mono">
                                C
                              </div>
                              <div className="w-40 h-40 rounded-full p-1 bg-gradient-to-tr from-amber-500 to-yellow-300 shadow-xl shadow-amber-500/10">
                                <div className="w-full h-full rounded-full bg-slate-950 overflow-hidden relative border-4 border-slate-950">
                                  {captain?.photoUrl ? (
                                    <img 
                                      src={captain.photoUrl} 
                                      alt={captain.name} 
                                      className="w-full h-full object-cover" 
                                      referrerPolicy="no-referrer"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-500">
                                      <span className="text-4xl font-black">#{captain?.number}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Captain Info */}
                            <span className="text-xs uppercase font-mono tracking-widest text-amber-400 font-bold">
                              {captain?.position} • JERSEY #{captain?.number}
                            </span>
                            <h2 className="text-2xl font-black tracking-tight text-white mt-1 uppercase">
                              {captain?.name || 'No Captain Designated'}
                            </h2>
                          </div>

                          <div className="border-t border-slate-800/80 pt-4 mt-6 text-center">
                            <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                              LEADER ON THE PITCH
                            </p>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
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
            className="absolute bottom-16 left-16 pointer-events-none z-50"
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
            initial={{ opacity: 0, scale: 0.8, x: 50 }}
            animate={{ opacity: 1, scale: 1.15, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 50 }}
            className="absolute top-8 right-12 pointer-events-none z-50 origin-top-right"
            id="obs-sponsor-popup"
          >
            <div className="bg-slate-950/95 border-2 border-blue-500/30 rounded-2xl px-6 py-4 flex items-center gap-4.5 w-100 shadow-2xl relative overflow-hidden backdrop-blur-md">
              {/* Animated accent lights */}
              <div className="absolute top-0 left-0 w-2 h-full bg-blue-500" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />

              {/* Sponsor Logo Panel */}
              <div className="w-14 h-14 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 shadow-inner overflow-hidden">
                {isImageUrl(state.activeSponsor.logoUrl) ? (
                  <img src={state.activeSponsor.logoUrl} alt="" className="w-full h-full object-contain p-1" referrerPolicy="no-referrer" />
                ) : (
                  <span className="text-3xl leading-none">{state.activeSponsor.logoUrl || '⭐'}</span>
                )}
              </div>

              {/* Sponsor details */}
              <div className="flex flex-col overflow-hidden text-left">
                <span className="text-[10px] uppercase font-mono tracking-[0.2em] text-blue-400 font-extrabold leading-none mb-1">OFFICIAL SPONSOR</span>
                <span className="text-lg font-black text-white truncate leading-tight tracking-wide">{state.activeSponsor.sponsorName}</span>
                <span className="text-xs text-slate-300 font-medium truncate mt-1 italic">{state.activeSponsor.promoText}</span>
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
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            className="absolute bottom-12 right-12 pointer-events-none z-50 origin-bottom-right"
            id="obs-penalty-popup"
          >
            <div className="bg-slate-950/95 border border-slate-800 rounded-2xl p-4 px-5 shadow-2xl shadow-black/95 flex flex-col items-center gap-3.5 min-w-[380px] max-w-[460px]">
              <span className="text-[10px] font-mono uppercase tracking-widest text-red-500 font-black">PENALTY SHOOTOUT</span>
              
              <div className="grid grid-cols-2 gap-6 w-full">
                {/* Home Penalties */}
                <div className="flex flex-col items-center gap-2 border-r border-slate-800/80 pr-4">
                  <span className="text-xs font-black text-white uppercase tracking-wider">{state.settings.homeTeam}</span>
                  <div className="flex items-center gap-1.5 flex-wrap justify-center">
                    {Array.from({ length: Math.max(5, state.penaltyShootout.homeAttempts.length, state.penaltyShootout.awayAttempts.length) }, (_, idx) => {
                      const res = state.penaltyShootout.homeAttempts[idx];
                      return (
                        <div key={idx} className="w-6 h-6 rounded-full border border-slate-700 bg-slate-900 flex items-center justify-center shrink-0">
                          {res === 'goal' && <CheckCircle className="w-5 h-5 text-emerald-400 fill-emerald-950" />}
                          {res === 'miss' && <XCircle className="w-5 h-5 text-red-500 fill-red-950" />}
                          {res === undefined && <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Away Penalties */}
                <div className="flex flex-col items-center gap-2 pl-4">
                  <span className="text-xs font-black text-white uppercase tracking-wider">{state.settings.awayTeam}</span>
                  <div className="flex items-center gap-1.5 flex-wrap justify-center">
                    {Array.from({ length: Math.max(5, state.penaltyShootout.homeAttempts.length, state.penaltyShootout.awayAttempts.length) }, (_, idx) => {
                      const res = state.penaltyShootout.awayAttempts[idx];
                      return (
                        <div key={idx} className="w-6 h-6 rounded-full border border-slate-700 bg-slate-900 flex items-center justify-center shrink-0">
                          {res === 'goal' && <CheckCircle className="w-5 h-5 text-emerald-400 fill-emerald-950" />}
                          {res === 'miss' && <XCircle className="w-5 h-5 text-red-500 fill-red-950" />}
                          {res === undefined && <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />}
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
                  className="bg-gradient-to-r from-yellow-500 to-amber-600 rounded-full px-4 py-1 text-slate-950 font-black text-xs uppercase tracking-widest mt-1 shadow-lg"
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
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center pointer-events-none"
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
      {/* 11.7 WELCOME SCREEN WITH TOURNAMENT DETAILS */}
      {/* ---------------------------------------------------- */}
      <AnimatePresence>
        {state.activeWelcome && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/90 backdrop-blur-lg z-[90] flex items-center justify-center pointer-events-none"
            id="obs-welcome-overlay"
          >
            {/* Ambient glowing orbs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

            <motion.div
              initial={{ scale: 0.9, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 30, opacity: 0 }}
              transition={{ type: 'spring', damping: 18 }}
              className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-10 max-w-3xl w-full flex flex-col items-center relative overflow-hidden shadow-2xl text-center"
            >
              {/* Light accent bar */}
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent" />

              {/* Tournament Info Header */}
              <div className="flex flex-col items-center gap-3 mb-6">
                {state.settings.competitionLogo && (
                  isImageUrl(state.settings.competitionLogo) ? (
                    <img 
                      src={state.settings.competitionLogo} 
                      alt="" 
                      className="w-20 h-20 object-contain drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="text-5xl leading-none">{state.settings.competitionLogo}</span>
                  )
                )}
                <div className="mt-2">
                  <span className="text-blue-500 font-mono text-xs uppercase tracking-[0.25em] font-black block mb-1">
                    LIVE BROADCAST PRE-SHOW
                  </span>
                  <h1 className="text-4xl font-black text-white tracking-wide uppercase">
                    {state.settings.leagueName}
                  </h1>
                  <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mt-1 block">
                    {state.settings.season || '2026/2027'} EDITION
                  </span>
                </div>
              </div>

              {/* Matchup Banner */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl px-8 py-5 w-full flex items-center justify-between gap-6 my-4 shadow-inner">
                {/* Home Team */}
                <div className="flex items-center gap-3 flex-1 justify-end">
                  <span className="text-lg font-black text-white uppercase tracking-tight truncate">{state.settings.homeTeam}</span>
                  {state.settings.homeLogo && (
                    isImageUrl(state.settings.homeLogo) ? (
                      <img src={state.settings.homeLogo} alt="" className="w-10 h-10 rounded-full object-cover border border-slate-800" referrerPolicy="no-referrer" />
                    ) : (
                      <span className="text-2xl leading-none">{state.settings.homeLogo}</span>
                    )
                  )}
                </div>

                {/* VS Indicator */}
                <div className="px-3.5 py-1.5 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-black font-mono tracking-widest uppercase">
                  VS
                </div>

                {/* Away Team */}
                <div className="flex items-center gap-3 flex-1 justify-start">
                  {state.settings.awayLogo && (
                    isImageUrl(state.settings.awayLogo) ? (
                      <img src={state.settings.awayLogo} alt="" className="w-10 h-10 rounded-full object-cover border border-slate-800" referrerPolicy="no-referrer" />
                    ) : (
                      <span className="text-2xl leading-none">{state.settings.awayLogo}</span>
                    )
                  )}
                  <span className="text-lg font-black text-white uppercase tracking-tight truncate">{state.settings.awayTeam}</span>
                </div>
              </div>

              {/* Welcome text */}
              <div className="my-6">
                <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 uppercase tracking-tight animate-pulse">
                  WELCOME TO THE MATCH
                </span>
                <p className="text-xs text-slate-400 mt-2 font-mono uppercase tracking-wider">
                  The action is about to begin. Adjust your audio, sit back, and enjoy the coverage.
                </p>
              </div>

              {/* Tournament Details Grid */}
              <div className="grid grid-cols-3 divide-x divide-slate-850 gap-4 w-full border-t border-slate-800 pt-6 text-xs font-mono text-slate-400 mt-2">
                <div className="px-2 text-center">
                  <span className="text-[10px] text-slate-500 block uppercase mb-1">STADIUM VENUE</span>
                  <span className="text-white font-bold">{state.settings.location}</span>
                </div>
                <div className="px-2 text-center">
                  <span className="text-[10px] text-slate-500 block uppercase mb-1">KICKOFF TIME</span>
                  <span className="text-white font-bold">{state.settings.kickoffTime}</span>
                </div>
                <div className="px-2 text-center">
                  <span className="text-[10px] text-slate-500 block uppercase mb-1">MATCH REFEREE</span>
                  <span className="text-white font-bold">{state.settings.referee}</span>
                </div>
              </div>
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
