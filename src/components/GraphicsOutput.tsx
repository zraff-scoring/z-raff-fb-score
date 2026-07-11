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
        {!state.activeReplay && !state.hideClassicScoreboard && (!state.hideScoreboard || !state.hideTimer || state.timer.customStatus) && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ type: 'spring', damping: 20 }}
            className="absolute top-6 left-8 flex items-center bg-slate-950/90 backdrop-blur-md rounded-xl border border-slate-800 shadow-2xl shadow-black/80 overflow-visible"
            id="obs-scoreboard"
          >
            {/* IN-SCOREBOARD MODERN GOAL FLASH BANNER */}
            <AnimatePresence>
              {state.activeGoal && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: '100%', opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className="absolute inset-0 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 z-50 flex items-center justify-between px-6 overflow-hidden rounded-xl"
                >
                  <div className="flex items-center gap-3 whitespace-nowrap">
                    <span className="bg-slate-950 text-yellow-400 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider animate-bounce">
                      GOAL!
                    </span>
                    <span className="text-slate-950 font-black text-sm uppercase tracking-wide font-sans">
                      {state.activeGoal.scorer ? state.activeGoal.scorer.toUpperCase() : ((state.activeGoal.team === 'home' ? state.settings.homeTeam : state.settings.awayTeam) || 'GOAL SCORED!').toUpperCase()}
                    </span>
                    <span className="text-slate-950/60 font-mono text-xs font-bold">
                      ({state.activeGoal.minute}')
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 whitespace-nowrap bg-slate-950/10 px-3 py-1 rounded-lg border border-slate-950/10">
                    <span className="text-slate-950 font-black text-sm font-mono">
                      {state.settings.homeTeamShort} {state.scoreboard.homeScore} - {state.scoreboard.awayScore} {state.settings.awayTeamShort}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* League Tag */}
            {!state.hideScoreboard && (
              <div className="px-4 bg-blue-600 flex items-center justify-center h-16 border-r border-slate-800 rounded-l-xl">
                {isImageUrl(state.settings.competitionLogo) ? (
                  <img 
                    src={state.settings.competitionLogo} 
                    alt="" 
                    className="w-13 h-13 object-contain" 
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="text-3xl leading-none">{state.settings.competitionLogo}</span>
                )}
              </div>
            )}

            {/* Home Team */}
            {!state.hideScoreboard && (
              <div className="flex items-center gap-3 px-5 h-16 relative overflow-visible">
                {/* Floating Cards system on top of scoreboard */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 z-50 overflow-visible">
                  {Array.from({ length: state.stats.yellowCardsHome }).map((_, i) => (
                    <motion.div 
                      key={`y-home-classic-${i}`}
                      initial={{ scale: 0, y: 10 }}
                      animate={{ scale: 1, y: 0 }}
                      className="w-3 bg-yellow-400 h-4.5 rounded-[2px] shadow-lg shadow-black/80 border border-yellow-300"
                      title="Yellow Card"
                    />
                  ))}
                  {Array.from({ length: state.stats.redCardsHome }).map((_, i) => (
                    <motion.div 
                      key={`r-home-classic-${i}`}
                      initial={{ scale: 0, y: 10 }}
                      animate={{ scale: 1, y: 0 }}
                      className="w-3 bg-red-600 h-4.5 rounded-[2px] shadow-lg shadow-black/80 border border-red-500 animate-pulse"
                      title="Red Card"
                    />
                  ))}
                </div>

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
                <div 
                  className="w-[18px] h-[18px] rounded-full border-2 border-slate-950 ring-2 ring-white/20 shadow-inner shrink-0 ml-1.5"
                  style={{ backgroundColor: state.settings.homeColor || '#EF4444' }}
                />
                <span className="font-sans font-black text-3xl tracking-wider text-white uppercase w-24 text-center">
                  {state.settings.homeTeamShort}
                </span>
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
                  className="text-5xl font-black font-mono tracking-tighter"
                >
                  {state.scoreboard.homeScore}
                </motion.span>
                <span className="mx-2.5 text-slate-500 font-black text-2xl">:</span>
                <motion.span 
                  key={state.scoreboard.awayScore}
                  initial={{ scale: 1.5, color: '#3b82f6' }}
                  animate={{ scale: 1, color: '#ffffff' }}
                  style={scoreGlow}
                  className="text-5xl font-black font-mono tracking-tighter"
                >
                  {state.scoreboard.awayScore}
                </motion.span>
              </div>
            )}

            {/* Away Team */}
            {!state.hideScoreboard && (
              <div className="flex items-center gap-3 px-5 h-16 relative overflow-visible">
                {/* Floating Cards system on top of scoreboard */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 z-50 overflow-visible">
                  {Array.from({ length: state.stats.yellowCardsAway }).map((_, i) => (
                    <motion.div 
                      key={`y-away-classic-${i}`}
                      initial={{ scale: 0, y: 10 }}
                      animate={{ scale: 1, y: 0 }}
                      className="w-3 bg-yellow-400 h-4.5 rounded-[2px] shadow-lg shadow-black/80 border border-yellow-300"
                      title="Yellow Card"
                    />
                  ))}
                  {Array.from({ length: state.stats.redCardsAway }).map((_, i) => (
                    <motion.div 
                      key={`r-away-classic-${i}`}
                      initial={{ scale: 0, y: 10 }}
                      animate={{ scale: 1, y: 0 }}
                      className="w-3 bg-red-600 h-4.5 rounded-[2px] shadow-lg shadow-black/80 border border-red-500 animate-pulse"
                      title="Red Card"
                    />
                  ))}
                </div>

                <span className="font-sans font-black text-3xl tracking-wider text-white uppercase w-24 text-center">
                  {state.settings.awayTeamShort}
                </span>
                <div 
                  className="w-[18px] h-[18px] rounded-full border-2 border-slate-950 ring-2 ring-white/20 shadow-inner shrink-0 mr-1.5"
                  style={{ backgroundColor: state.settings.awayColor || '#3B82F6' }}
                />
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
            {(!state.hideTimer || state.timer.customStatus) && (
              <div className={`flex flex-col items-center justify-center bg-blue-950/80 px-6 h-16 ${state.timer.customStatus ? 'min-w-[180px]' : 'min-w-[100px]'} ${!state.hideScoreboard ? 'border-l border-slate-800 rounded-r-xl' : 'rounded-xl'}`}>
                {state.timer.customStatus ? (
                  <span className="text-sm sm:text-base font-black font-sans text-yellow-400 uppercase tracking-wider text-center animate-pulse py-1 select-none">
                    {state.timer.customStatus}
                  </span>
                ) : (
                  <>
                    <span className="text-[10px] uppercase font-mono tracking-widest text-blue-400 font-black">
                      {activePeriodLabel(state.timer.period)}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-xl font-black font-mono text-white tracking-wider">
                        {formatTime(state.timer.timeSeconds)}
                      </span>
                      {state.timer.injuryTimeMinutes > 0 && (
                        <motion.span 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="bg-orange-500 text-slate-950 text-[11px] font-black px-1.5 py-0.5 rounded ml-1"
                        >
                          +{state.timer.injuryTimeMinutes}
                        </motion.span>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------------------------------------------------- */}
      {/* 1.5. WORLD CUP STYLE SCOREBOARD & TIMER */}
      {/* ---------------------------------------------------- */}
      <AnimatePresence>
        {!state.activeReplay && !state.hideWorldcupScoreboard && (!state.hideScoreboard || !state.hideTimer || state.timer.customStatus) && (
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
            <div className="scale-110 md:scale-125 origin-bottom pointer-events-auto">
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                transition={{ type: 'spring', damping: 20 }}
                className="flex flex-col items-center"
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
                      {state.activeGoal.scorer ? state.activeGoal.scorer.toUpperCase() : ((state.activeGoal.team === 'home' ? state.settings.homeTeam : state.settings.awayTeam) || 'GOAL SCORED!').toUpperCase()}
                    </span>
                    <span className="text-slate-950/60 font-mono text-[11px] font-bold">
                      ({state.activeGoal.minute}')
                    </span>
                  </div>
                  <div className="text-slate-950 font-black text-sm font-mono">
                    {state.settings.homeTeamShort} {state.scoreboard.homeScore} - {state.scoreboard.awayScore} {state.settings.awayTeamShort}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main World Cup Layout */}
            <div className="flex items-center bg-slate-950/95 backdrop-blur-md rounded-2xl border border-slate-800 shadow-2xl shadow-black/95 overflow-visible h-20">
              {/* Competition Pill */}
              {!state.hideScoreboard && (
                <div className="px-6 bg-gradient-to-br from-indigo-700 to-blue-900 flex items-center justify-center h-full border-r border-slate-800/80 rounded-l-2xl">
                  {isImageUrl(state.settings.competitionLogo) ? (
                    <img 
                      src={state.settings.competitionLogo} 
                      alt="" 
                      className="w-16 h-16 object-contain animate-pulse-subtle" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="text-4xl leading-none">{state.settings.competitionLogo}</span>
                  )}
                </div>
              )}

              {/* Home Team Tab */}
              {!state.hideScoreboard && (
                <div className="flex items-center gap-3.5 px-6 h-full relative overflow-visible">
                  {/* Floating Cards system on top of scoreboard */}
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1 z-50 overflow-visible">
                    {Array.from({ length: state.stats.yellowCardsHome }).map((_, i) => (
                      <motion.div 
                        key={`y-home-wc-${i}`}
                        initial={{ scale: 0, y: 10 }}
                        animate={{ scale: 1, y: 0 }}
                        className="w-3.5 bg-yellow-400 h-5 rounded-[2px] shadow-lg shadow-black/80 border border-yellow-300"
                        title="Yellow Card"
                      />
                    ))}
                    {Array.from({ length: state.stats.redCardsHome }).map((_, i) => (
                      <motion.div 
                        key={`r-home-wc-${i}`}
                        initial={{ scale: 0, y: 10 }}
                        animate={{ scale: 1, y: 0 }}
                        className="w-3.5 bg-red-600 h-5 rounded-[2px] shadow-lg shadow-black/80 border border-red-500 animate-pulse"
                        title="Red Card"
                      />
                    ))}
                  </div>

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
                  <div 
                    className="w-[22px] h-[22px] rounded-full border-2 border-slate-950 ring-2 ring-white/20 shadow-inner shrink-0 ml-1.5"
                    style={{ backgroundColor: state.settings.homeColor || '#EF4444' }}
                  />
                  <span className="font-mono font-black text-5xl tracking-widest text-white uppercase">
                    {state.settings.homeTeamShort}
                  </span>
                </div>
              )}

              {/* Home Score Badge */}
              {!state.hideScoreboard && (
                <div className="bg-slate-900/90 w-20 h-full flex items-center justify-center border-l border-slate-800/60">
                  <motion.span 
                    key={state.scoreboard.homeScore}
                    initial={{ scale: 1.5, color: '#e2e8f0' }}
                    animate={{ scale: 1, color: '#ffffff' }}
                    className="text-4xl font-black font-mono text-white"
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
                <div className="bg-slate-900/90 w-20 h-full flex items-center justify-center border-r border-slate-800/60">
                  <motion.span 
                    key={state.scoreboard.awayScore}
                    initial={{ scale: 1.5, color: '#e2e8f0' }}
                    animate={{ scale: 1, color: '#ffffff' }}
                    className="text-4xl font-black font-mono text-white"
                  >
                    {state.scoreboard.awayScore}
                  </motion.span>
                </div>
              )}

              {/* Away Team Tab */}
              {!state.hideScoreboard && (
                <div className="flex items-center gap-3.5 px-6 h-full border-r border-slate-800/80 relative overflow-visible">
                  {/* Floating Cards system on top of scoreboard */}
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1 z-50 overflow-visible">
                    {Array.from({ length: state.stats.yellowCardsAway }).map((_, i) => (
                      <motion.div 
                        key={`y-away-wc-${i}`}
                        initial={{ scale: 0, y: 10 }}
                        animate={{ scale: 1, y: 0 }}
                        className="w-3.5 bg-yellow-400 h-5 rounded-[2px] shadow-lg shadow-black/80 border border-yellow-300"
                        title="Yellow Card"
                      />
                    ))}
                    {Array.from({ length: state.stats.redCardsAway }).map((_, i) => (
                      <motion.div 
                        key={`r-away-wc-${i}`}
                        initial={{ scale: 0, y: 10 }}
                        animate={{ scale: 1, y: 0 }}
                        className="w-3.5 bg-red-600 h-5 rounded-[2px] shadow-lg shadow-black/80 border border-red-500 animate-pulse"
                        title="Red Card"
                      />
                    ))}
                  </div>

                  <span className="font-mono font-black text-5xl tracking-widest text-white uppercase">
                    {state.settings.awayTeamShort}
                  </span>
                  <div 
                    className="w-[22px] h-[22px] rounded-full border-2 border-slate-950 ring-2 ring-white/20 shadow-inner shrink-0 mr-1.5"
                    style={{ backgroundColor: state.settings.awayColor || '#3B82F6' }}
                  />
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
              {(!state.hideTimer || state.timer.customStatus) && (
                <div className={`flex flex-col items-center justify-center bg-amber-500/95 px-6 h-full ${state.timer.customStatus ? 'min-w-[180px]' : 'min-w-[130px]'} ${!state.hideScoreboard ? 'rounded-r-2xl' : 'rounded-2xl'}`}>
                  {state.timer.customStatus ? (
                    <span className="text-sm sm:text-base font-black font-sans text-slate-950 uppercase tracking-wider text-center animate-pulse select-none">
                      {state.timer.customStatus}
                    </span>
                  ) : (
                    <>
                      <span className="text-[11px] uppercase font-mono tracking-widest text-amber-950 font-black">
                        {activePeriodLabel(state.timer.period)}
                      </span>
                      <div className="flex items-center gap-0.5">
                        <span className="text-2xl font-black font-mono text-slate-950 tracking-wider">
                          {formatTime(state.timer.timeSeconds)}
                        </span>
                        {state.timer.injuryTimeMinutes > 0 && (
                          <span className="bg-slate-950 text-amber-400 text-xs font-black px-1.5 py-0.5 rounded ml-1.5">
                            +{state.timer.injuryTimeMinutes}
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
              </motion.div>
            </div>
          </div>
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
                <span className="text-xs uppercase font-mono tracking-widest text-slate-400 font-black">
                  {state.activeCard.cardType === 'yellow' ? 'Yellow Card' : 'Red Card'}
                </span>
                <span className="text-xl font-black text-white leading-tight mt-1">
                  {state.activeCard.player}
                </span>
                <span className="text-sm text-blue-400 font-mono mt-1.5 font-bold">
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
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="absolute bottom-16 left-16 pointer-events-none z-50"
            id="obs-var-popup"
          >
            <div className="w-[320px] bg-slate-950/95 border-2 border-red-600 rounded-xl p-0.5 shadow-[0_0_30px_rgba(220,38,38,0.3)] overflow-hidden">
              <div className="bg-slate-950 rounded-lg p-3.5 relative">
                {/* Scanline effect */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-950/10 to-transparent animate-pulse pointer-events-none" />
                
                {/* Header */}
                <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                  <div className="p-1.5 bg-red-600 text-white rounded animate-pulse">
                    <Tv2 className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase font-mono tracking-wider text-red-500 block">Video Assistant Referee</span>
                    <h2 className="text-sm font-black text-white tracking-tight uppercase">{state.activeVAR.type.replace('_', ' ')}</h2>
                  </div>
                </div>

                {/* Sub message */}
                <p className="mt-2.5 text-slate-200 font-bold text-xs text-center border border-slate-800/80 bg-slate-900/40 py-2 px-3 rounded">
                  {state.activeVAR.customMessage || "Decision Pending - Checking Logs"}
                </p>

                {/* Pulsing Alert Light */}
                <div className="flex justify-center items-center gap-1.5 mt-2.5 text-[9px] font-mono uppercase tracking-wider text-red-400">
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-ping inline-block" />
                  <span>Reviewing Replay</span>
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
                  <span className="text-sm font-black uppercase font-mono text-blue-500 tracking-wider">
                    {state.lineups.activeLineupView === 'vs' ? 'Tactical Clash' : 'Starting Lineup'}
                  </span>
                  <h1 className="text-5xl font-black text-white mt-1.5">
                    {state.lineups.activeLineupView === 'vs' 
                      ? `${state.settings.homeTeam} VS ${state.settings.awayTeam}` 
                      : state.lineups.activeLineupView === 'home' ? state.settings.homeTeam : state.settings.awayTeam
                    }
                  </h1>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-sm font-mono font-bold text-slate-400 block">FORMATION</span>
                    <span className="text-2xl font-black text-white font-mono">
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
                      <div className="col-span-5 bg-gradient-to-b from-blue-950/20 to-slate-900/40 rounded-3xl border border-slate-800/80 p-6 flex flex-col justify-center items-center relative overflow-hidden shadow-xl min-h-[380px]">
                        {/* Huge Square Team Emblem */}
                        <div className="w-48 h-48 rounded-2xl p-0.5 bg-gradient-to-tr from-blue-500 to-indigo-500 shadow-2xl shadow-blue-500/10 mb-5">
                          <div className="w-full h-full rounded-2xl bg-slate-950 overflow-hidden relative border-4 border-slate-950 flex items-center justify-center p-4">
                            {state.settings.homeLogo ? (
                              isImageUrl(state.settings.homeLogo) ? (
                                <img src={state.settings.homeLogo} alt="" className="max-w-full max-h-full object-contain rounded-lg" referrerPolicy="no-referrer" />
                              ) : (
                                <span className="text-7xl leading-none">{state.settings.homeLogo}</span>
                              )
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-500">
                                <span className="text-5xl font-black">{state.settings.homeTeamShort || 'H'}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Team Info Details */}
                        <div className="text-center w-full">
                          <span className="text-[11px] font-mono text-blue-400 uppercase tracking-widest block leading-none mb-1.5 font-black">HOME CLUB</span>
                          <h2 className="text-3xl font-black text-white uppercase tracking-tight leading-tight mb-2 truncate px-2">{state.settings.homeTeam}</h2>
                          
                          <div className="flex flex-col items-center justify-center gap-1 font-mono text-xs text-slate-400">
                            {state.lineups.homeCoach && (
                              <div className="bg-slate-950/60 border border-slate-800/60 px-3 py-1 rounded-full flex items-center gap-1.5">
                                <span className="text-slate-500 text-[10px] uppercase font-bold">COACH:</span>
                                <span className="text-white font-bold">{state.lineups.homeCoach}</span>
                              </div>
                            )}
                            {homeCaptain && (
                              <div className="bg-slate-950/40 border border-slate-850/60 px-3 py-1 rounded-full flex items-center gap-1.5 mt-1">
                                <span className="text-amber-400 text-[10px] uppercase font-bold">CAPTAIN:</span>
                                <span className="text-slate-300 font-bold">{homeCaptain.name} (#{homeCaptain.number})</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Middle (Col 1): Big VS Graphic */}
                      <div className="col-span-1 flex flex-col items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 border border-blue-500 flex items-center justify-center shadow-xl shadow-blue-500/20 text-center relative animate-pulse">
                          <span className="font-sans font-black text-white italic text-lg tracking-wider font-bold">VS</span>
                          <div className="absolute -inset-1 rounded-full border border-blue-500/30 pointer-events-none" />
                        </div>
                      </div>

                      {/* Right Side (Col 5): Away Team Panel */}
                      <div className="col-span-5 bg-gradient-to-b from-blue-950/20 to-slate-900/40 rounded-3xl border border-slate-800/80 p-6 flex flex-col justify-center items-center relative overflow-hidden shadow-xl min-h-[380px]">
                        {/* Huge Square Team Emblem */}
                        <div className="w-48 h-48 rounded-2xl p-0.5 bg-gradient-to-tr from-blue-500 to-indigo-500 shadow-2xl shadow-blue-500/10 mb-5">
                          <div className="w-full h-full rounded-2xl bg-slate-950 overflow-hidden relative border-4 border-slate-950 flex items-center justify-center p-4">
                            {state.settings.awayLogo ? (
                              isImageUrl(state.settings.awayLogo) ? (
                                <img src={state.settings.awayLogo} alt="" className="max-w-full max-h-full object-contain rounded-lg" referrerPolicy="no-referrer" />
                              ) : (
                                <span className="text-7xl leading-none">{state.settings.awayLogo}</span>
                              )
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-500">
                                <span className="text-5xl font-black">{state.settings.awayTeamShort || 'A'}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Team Info Details */}
                        <div className="text-center w-full">
                          <span className="text-[11px] font-mono text-blue-400 uppercase tracking-widest block leading-none mb-1.5 font-black">AWAY CLUB</span>
                          <h2 className="text-3xl font-black text-white uppercase tracking-tight leading-tight mb-2 truncate px-2">{state.settings.awayTeam}</h2>
                          
                          <div className="flex flex-col items-center justify-center gap-1 font-mono text-xs text-slate-400">
                            {state.lineups.awayCoach && (
                              <div className="bg-slate-950/60 border border-slate-800/60 px-3 py-1 rounded-full flex items-center gap-1.5">
                                <span className="text-slate-500 text-[10px] uppercase font-bold">COACH:</span>
                                <span className="text-white font-bold">{state.lineups.awayCoach}</span>
                              </div>
                            )}
                            {awayCaptain && (
                              <div className="bg-slate-950/40 border border-slate-850/60 px-3 py-1 rounded-full flex items-center gap-1.5 mt-1">
                                <span className="text-amber-400 text-[10px] uppercase font-bold">CAPTAIN:</span>
                                <span className="text-slate-300 font-bold">{awayCaptain.name} (#{awayCaptain.number})</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })() : (() => {
                  const view = state.lineups.activeLineupView; // 'home' or 'away'
                  const isHome = view === 'home';
                  const teamName = isHome ? state.settings.homeTeam : state.settings.awayTeam;
                  const teamLogo = isHome ? state.settings.homeLogo : state.settings.awayLogo;
                  const teamColor = isHome ? state.settings.homeColor : state.settings.awayColor;
                  const coach = isHome ? state.lineups.homeCoach : state.lineups.awayCoach;
                  const formation = isHome ? state.lineups.homeFormation : state.lineups.awayFormation;
                  const roster = isHome ? state.lineups.homeStartingXI : state.lineups.awayStartingXI;
                  const subs = (isHome ? state.lineups.homeSubs : state.lineups.awaySubs) || [];
                  const validSubs = subs.filter(s => s.name && s.name.trim() !== '');

                  return (
                    <div className="grid grid-cols-12 gap-6 my-2 flex-1 items-stretch overflow-hidden z-10 w-full animate-fade-in" id="lineup-team-layout">
                      {/* Left Panel: Substitutes List & Coach (Matches Spanish Reference) */}
                      <div className="col-span-12 lg:col-span-4 flex flex-col bg-slate-950/80 backdrop-blur-md rounded-3xl border border-slate-800/80 p-5 h-full justify-between shadow-2xl relative overflow-hidden">
                        {/* Left vertical strip indicating team color */}
                        <div 
                          className="absolute left-0 inset-y-0 w-2.5 rounded-l-3xl"
                          style={{ backgroundColor: teamColor || '#EF4444' }}
                        />
                        
                        <div className="flex flex-col flex-1 min-h-0 pl-2">
                          <div className="flex items-center gap-2 border-b border-slate-800/85 pb-2.5 mb-3">
                            <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                            <h3 className="text-xs font-black uppercase font-mono text-teal-400 tracking-wider">
                              SUBSTITUTES
                            </h3>
                          </div>

                          {/* Substitutes scrollable content */}
                          <div className="flex flex-col gap-1.5 overflow-y-auto pr-1 flex-1 min-h-0">
                            {validSubs.length > 0 ? (
                              validSubs.map((sub: Player, subIdx: number) => (
                                <motion.div 
                                  key={sub.id || subIdx}
                                  initial={{ opacity: 0, x: -15 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: subIdx * 0.03 }}
                                  className="flex items-center gap-3 py-1.5 border-b border-slate-900/40 hover:bg-slate-900/30 px-2 rounded-lg transition-all shrink-0"
                                >
                                  <span className="text-xs font-mono font-black text-teal-400 w-5 text-right">{sub.number}</span>
                                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-black bg-slate-900 text-slate-400 text-center w-8 leading-none">
                                    {sub.position}
                                  </span>
                                  <span className="text-xs font-black text-white uppercase truncate flex-1 tracking-wide">
                                    {sub.name}
                                  </span>
                                </motion.div>
                              ))
                            ) : (
                              <div className="flex items-center justify-center py-10 text-slate-500 font-mono text-[11px] italic">
                                No substitutes designated
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Head Coach Display Section */}
                        <div className="border-t border-slate-800/80 pt-4 mt-4 bg-slate-950/45 -mx-5 -mb-5 p-5 pl-7">
                          <span className="text-[9px] font-mono font-black text-teal-400 tracking-wider block uppercase mb-1 leading-none">
                            HEAD COACH
                          </span>
                          <span className="text-xl font-black text-white uppercase tracking-tight block">
                            {coach || 'UNASSIGNED'}
                          </span>
                        </div>
                      </div>

                      {/* Right Panel: Vertical Tactical Pitch */}
                      <div className="col-span-12 lg:col-span-8 flex flex-col bg-slate-950/60 backdrop-blur-md rounded-3xl border border-slate-800/80 p-4 h-full relative overflow-hidden shadow-2xl justify-between">
                        {/* Top banner displaying the team title card */}
                        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5 mb-2.5">
                          <div className="flex items-center gap-3">
                            {teamLogo && (
                              isImageUrl(teamLogo) ? (
                                <img 
                                  src={teamLogo} 
                                  alt="" 
                                  className="w-10 h-10 rounded-full border border-slate-700 bg-slate-900 object-cover" 
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <span className="text-3xl leading-none">{teamLogo}</span>
                              )
                            )}
                            <div>
                              <span className="text-[9px] font-mono text-slate-400 block uppercase leading-none mb-1">STARTING XI</span>
                              <h2 className="text-xl font-black text-white uppercase tracking-tight leading-none">{teamName}</h2>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-1 font-mono">
                            <div className="text-right">
                              <span className="text-[8px] text-slate-400 block uppercase leading-none font-bold">FORMATION</span>
                              <span className="text-sm font-black text-teal-400 font-mono leading-none">
                                {formation}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Field Arena (Vertical orientation, GK at bottom, FW at top) */}
                        <div className="relative w-full h-[450px] bg-gradient-to-b from-emerald-950/30 to-emerald-900/10 rounded-2xl border border-slate-800/80 overflow-hidden shadow-inner flex-1">
                          {/* Pitch Stripes Pattern */}
                          <div className="absolute inset-0 flex flex-col pointer-events-none opacity-25">
                            {[...Array(10)].map((_, stripeIdx) => (
                              <div key={stripeIdx} className={`flex-1 ${stripeIdx % 2 === 0 ? 'bg-emerald-900/20' : 'bg-transparent'}`} />
                            ))}
                          </div>

                          {/* SVG Tactical Pitch Lines */}
                          <div className="absolute inset-0 pointer-events-none">
                            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                              {/* Outer Line */}
                              <rect x="4" y="4" width="92" height="92" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
                              {/* Center Line */}
                              <line x1="4" y1="50" x2="96" y2="50" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
                              {/* Center Circle */}
                              <circle cx="50" cy="50" r="14" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
                              {/* Penalty Box Top */}
                              <rect x="22" y="4" width="56" height="18" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
                              <rect x="36" y="4" width="28" height="6" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
                              <path d="M 36 22 A 14 14 0 0 0 64 22" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
                              
                              {/* Penalty Box Bottom */}
                              <rect x="22" y="78" width="56" height="18" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
                              <rect x="36" y="90" width="28" height="6" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
                              <path d="M 36 78 A 14 14 0 0 1 64 78" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />

                              {/* Corner Arcs */}
                              <path d="M 4 8 A 4 4 0 0 0 8 4" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
                              <path d="M 92 4 A 4 4 0 0 0 96 8" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
                              <path d="M 8 96 A 4 4 0 0 0 4 92" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
                              <path d="M 96 92 A 4 4 0 0 0 92 96" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
                            </svg>
                          </div>

                          {/* Player Circles placed on coordinates */}
                          {roster.slice(0, state.lineups.rosterSize || 11).map((player: Player, playerIdx: number) => {
                            const posX = Math.max(7, Math.min(93, player.y));
                            const posY = Math.max(10, Math.min(90, 100 - player.x));
                            return (
                              <motion.div
                                key={player.id || playerIdx}
                                initial={{ opacity: 0, scale: 0.7 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: playerIdx * 0.04, duration: 0.35, type: 'spring', stiffness: 80 }}
                                className="absolute flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2 z-20 group"
                                style={{ left: `${posX}%`, top: `${posY}%` }}
                              >
                                <div className="relative mb-1 shadow-2xl">
                                  {player.photoUrl ? (
                                    <div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-tr from-amber-400 to-yellow-300 shadow-xl">
                                      <div className="w-full h-full rounded-full bg-slate-900 overflow-hidden relative">
                                        <img src={player.photoUrl} alt={player.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                      </div>
                                    </div>
                                  ) : (
                                    <div 
                                      className="w-11 h-11 rounded-full border-2 border-white shadow-xl flex items-center justify-center relative transition-transform group-hover:scale-105"
                                      style={{
                                        background: `radial-gradient(circle, ${teamColor || '#EF4444'} 0%, #020617 100%)`
                                      }}
                                    >
                                      <span className="text-white font-mono font-black text-sm drop-shadow">
                                        {player.number}
                                      </span>
                                      <div className="absolute inset-0 rounded-full border border-white/25 pointer-events-none" />
                                    </div>
                                  )}

                                  {/* Captain Badge */}
                                  {player.isCaptain && (
                                    <div className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-amber-500 border border-slate-950 flex items-center justify-center text-[8px] font-black text-slate-950 shadow-md font-mono">
                                      C
                                    </div>
                                  )}
                                </div>

                                {/* Player Name Label Card */}
                                <div className="flex items-center bg-slate-950 rounded border border-slate-800/80 shadow-2xl overflow-hidden max-w-[110px]">
                                  <div 
                                    className="text-white font-black px-1 py-0.5 text-[8px] font-mono text-center min-w-[16px] border-r border-slate-800"
                                    style={{ backgroundColor: teamColor || '#EF4444' }}
                                  >
                                    {player.number}
                                  </div>
                                  <div className="text-white font-bold px-1.5 py-0.5 uppercase truncate text-[8px] font-sans">
                                    {player.name.split(' ').pop() || player.name}
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })()}
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
                  <span className="text-sm uppercase font-mono tracking-widest text-emerald-400 font-black">
                    {state.activeSubstitution.team === 'home' ? state.settings.homeTeam : state.settings.awayTeam}
                  </span>
                </div>

                {/* Player IN (Green Arrow Up) */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-mono font-bold">PLAYER IN</span>
                    <span className="text-lg font-black text-emerald-400 mt-0.5">{state.activeSubstitution.playerIn}</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <span className="text-lg font-bold">▲</span>
                  </div>
                </div>

                {/* Player OUT (Red Arrow Down) */}
                <div className="flex items-center justify-between border-t border-slate-900/60 pt-3">
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-mono font-bold">PLAYER OUT</span>
                    <span className="text-lg font-black text-red-400 mt-0.5">{state.activeSubstitution.playerOut}</span>
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
              <div className="flex flex-col gap-4.5">
                {/* Possession Stat */}
                <div className="flex flex-col">
                  <div className="flex justify-between items-end text-slate-200 mb-1.5 font-mono">
                    <span className="text-lg font-black text-white">{state.stats.possessionHome}%</span>
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest font-sans">POSSESSION</span>
                    <span className="text-lg font-black text-white">{100 - state.stats.possessionHome}%</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
                    <div style={{ width: `${state.stats.possessionHome}%` }} className="bg-blue-500 h-full" />
                    <div style={{ width: `${100 - state.stats.possessionHome}%` }} className="bg-slate-400 h-full" />
                  </div>
                </div>

                {/* Shots Stat */}
                <div className="flex flex-col">
                  <div className="flex justify-between items-end text-slate-200 mb-1.5 font-mono">
                    <span className="text-lg font-black text-white">{state.stats.shotsHome}</span>
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest font-sans">TOTAL SHOTS</span>
                    <span className="text-lg font-black text-white">{state.stats.shotsAway}</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
                    <div style={{ width: `${(state.stats.shotsHome / (state.stats.shotsHome + state.stats.shotsAway || 1)) * 100}%` }} className="bg-blue-500 h-full" />
                    <div style={{ width: `${(state.stats.shotsAway / (state.stats.shotsHome + state.stats.shotsAway || 1)) * 100}%` }} className="bg-slate-400 h-full" />
                  </div>
                </div>

                {/* Shots On Target */}
                <div className="flex flex-col">
                  <div className="flex justify-between items-end text-slate-200 mb-1.5 font-mono">
                    <span className="text-lg font-black text-white">{state.stats.shotsOnTargetHome}</span>
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest font-sans">SHOTS ON TARGET</span>
                    <span className="text-lg font-black text-white">{state.stats.shotsOnTargetAway}</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
                    <div style={{ width: `${(state.stats.shotsOnTargetHome / (state.stats.shotsOnTargetHome + state.stats.shotsOnTargetAway || 1)) * 100}%` }} className="bg-blue-500 h-full" />
                    <div style={{ width: `${(state.stats.shotsOnTargetAway / (state.stats.shotsOnTargetHome + state.stats.shotsOnTargetAway || 1)) * 100}%` }} className="bg-slate-400 h-full" />
                  </div>
                </div>

                {/* corners */}
                <div className="flex flex-col">
                  <div className="flex justify-between items-end text-slate-200 mb-1.5 font-mono">
                    <span className="text-lg font-black text-white">{state.stats.cornersHome}</span>
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest font-sans">CORNERS</span>
                    <span className="text-lg font-black text-white">{state.stats.cornersAway}</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
                    <div style={{ width: `${(state.stats.cornersHome / (state.stats.cornersHome + state.stats.cornersAway || 1)) * 100}%` }} className="bg-blue-500 h-full" />
                    <div style={{ width: `${(state.stats.cornersAway / (state.stats.cornersHome + state.stats.cornersAway || 1)) * 100}%` }} className="bg-slate-400 h-full" />
                  </div>
                </div>

                {/* Expected Goals xG */}
                <div className="flex flex-col">
                  <div className="flex justify-between items-end text-slate-200 mb-1.5 font-mono">
                    <span className="text-lg font-black text-white">{state.stats.xGHome.toFixed(2)}</span>
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest font-sans">Expected Goals (xG)</span>
                    <span className="text-lg font-black text-white">{state.stats.xGAway.toFixed(2)}</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
                    <div style={{ width: `${(state.stats.xGHome / (state.stats.xGHome + state.stats.xGAway || 1)) * 100}%` }} className="bg-blue-500 h-full" />
                    <div style={{ width: `${(state.stats.xGAway / (state.stats.xGHome + state.stats.xGAway || 1)) * 100}%` }} className="bg-slate-400 h-full" />
                  </div>
                </div>

                {/* Fouls */}
                <div className="flex flex-col">
                  <div className="flex justify-between items-end text-slate-200 mb-1.5 font-mono">
                    <span className="text-lg font-black text-white">{state.stats.foulsHome}</span>
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest font-sans">FOULS COMMITTED</span>
                    <span className="text-lg font-black text-white">{state.stats.foulsAway}</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
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
            <div className="bg-slate-950/95 border-l-[8px] border-blue-500 rounded-r-3xl px-10 py-7 shadow-2xl shadow-black/95 flex flex-col min-w-[550px] max-w-[800px]">
              <span className="text-xs font-mono tracking-[0.25em] text-blue-400 font-black uppercase">
                {state.activeLowerThird.type} info
              </span>
              <h2 className="text-4xl font-black text-white mt-2 leading-none uppercase tracking-tight">
                {state.activeLowerThird.title}
              </h2>
              <p className="text-lg text-slate-300 font-bold mt-2">
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
                  <div className="w-full h-full flex items-center justify-center text-blue-500 bg-blue-500/10 rounded-xl">
                    <Trophy className="w-8 h-8 stroke-[1.5]" />
                  </div>
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
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: 'spring', damping: 22 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none z-50 origin-bottom w-[95%] max-w-[900px] flex flex-col items-center gap-1.5 select-none"
            id="obs-penalty-popup"
          >
            {/* Main Scoreboard Bar */}
            <div className="w-full bg-gradient-to-r from-red-950 via-rose-900 to-red-950 border border-amber-500/20 rounded-t-xl shadow-2xl flex items-center h-14">
              
              {/* Home Team (Left Half) */}
              <div className="flex-1 flex items-center justify-end gap-3 px-6 h-full">
                {state.settings.homeLogo && (
                  isImageUrl(state.settings.homeLogo) ? (
                    <img 
                      src={state.settings.homeLogo} 
                      alt="" 
                      className="w-8 h-5.5 object-cover rounded shadow-md border border-white/20" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="text-2xl leading-none flex items-center justify-center w-7 h-7">{state.settings.homeLogo}</span>
                  )
                )}
                <div 
                  className="w-[18px] h-[18px] rounded-full border-2 border-slate-950 ring-2 ring-white/20 shadow-inner shrink-0 ml-1.5"
                  style={{ backgroundColor: state.settings.homeColor || '#EF4444' }}
                />
                <span className="font-sans font-black text-white text-base sm:text-xl tracking-wider uppercase truncate">
                  {state.settings.homeTeam}
                </span>
              </div>

              {/* Center Penalty Score Box */}
              <div className="w-44 flex items-center justify-center h-full bg-black/45 border-x border-white/10 relative px-2">
                <div className="flex items-center gap-3">
                  {/* Home Penalty Goals */}
                  <span className="text-3xl font-mono font-black text-white px-2 tracking-tight">
                    {state.penaltyShootout.homeAttempts.filter(x => x === 'goal').length}
                  </span>
                  
                  {/* Central Tournament Logo / Emblem */}
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center shadow-2xl border-2 border-amber-400/40 p-1.5 select-none shrink-0 z-10 relative">
                    {state.settings.competitionLogo ? (
                      isImageUrl(state.settings.competitionLogo) ? (
                        <img 
                          src={state.settings.competitionLogo} 
                          alt="Tournament Logo" 
                          className="w-full h-full object-contain rounded-full" 
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="text-white font-sans font-black text-sm leading-none text-center">
                          {state.settings.competitionLogo}
                        </span>
                      )
                    ) : (
                      <Trophy className="w-7 h-7 text-amber-400 stroke-[2.5]" />
                    )}
                  </div>

                  {/* Away Penalty Goals */}
                  <span className="text-3xl font-mono font-black text-white px-2 tracking-tight">
                    {state.penaltyShootout.awayAttempts.filter(x => x === 'goal').length}
                  </span>
                </div>
              </div>

              {/* Away Team (Right Half) */}
              <div className="flex-1 flex items-center justify-start gap-3 px-6 h-full">
                <span className="font-sans font-black text-white text-base sm:text-xl tracking-wider uppercase truncate">
                  {state.settings.awayTeam}
                </span>
                <div 
                  className="w-[18px] h-[18px] rounded-full border-2 border-slate-950 ring-2 ring-white/20 shadow-inner shrink-0 mr-1.5"
                  style={{ backgroundColor: state.settings.awayColor || '#3B82F6' }}
                />
                {state.settings.awayLogo && (
                  isImageUrl(state.settings.awayLogo) ? (
                    <img 
                      src={state.settings.awayLogo} 
                      alt="" 
                      className="w-8 h-5.5 object-cover rounded shadow-md border border-white/20" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="text-2xl leading-none flex items-center justify-center w-7 h-7">{state.settings.awayLogo}</span>
                  )
                )}
              </div>
            </div>

            {/* Bottom Panel with Penalty Indicators and Sponsor Banner */}
            <div className="w-full bg-slate-950/95 border-x border-b border-slate-800 rounded-b-xl px-6 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xl">
              
              {/* Home Team Attempts (Left) */}
              <div className="flex items-center gap-2 flex-1 justify-center sm:justify-end">
                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.max(5, state.penaltyShootout.homeAttempts.length, state.penaltyShootout.awayAttempts.length) }, (_, idx) => {
                    const res = state.penaltyShootout.homeAttempts[idx];
                    return (
                      <div 
                        key={`home-p-${idx}`} 
                        className="relative flex items-center justify-center w-6 h-6 select-none"
                      >
                        <div 
                          className={`w-5 h-5 rotate-45 flex items-center justify-center transition-all duration-300 rounded-[3px] border ${
                            res === 'goal' 
                              ? 'bg-emerald-500 border-emerald-400 text-white shadow-md shadow-emerald-500/20' 
                              : res === 'miss' 
                                ? 'bg-red-600 border-red-500 text-white shadow-md shadow-red-600/20' 
                                : 'bg-slate-900 border-slate-700 text-slate-500'
                          }`}
                        >
                          <span className="-rotate-45 block text-[10px] font-mono font-black">
                            {idx + 1}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Central Sponsor Badge */}
              <div className="flex items-center justify-center">
                <div className="bg-blue-600/90 text-white font-mono font-black text-xs px-6 py-1 rounded-full shadow-md border border-blue-400/20 uppercase tracking-widest max-w-[350px] truncate select-none">
                  {state.settings.leagueName || 'TOURNAMENT'}
                </div>
              </div>

              {/* Away Team Attempts (Right) */}
              <div className="flex items-center gap-2 flex-1 justify-center sm:justify-start">
                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.max(5, state.penaltyShootout.homeAttempts.length, state.penaltyShootout.awayAttempts.length) }, (_, idx) => {
                    const res = state.penaltyShootout.awayAttempts[idx];
                    return (
                      <div 
                        key={`away-p-${idx}`} 
                        className="relative flex items-center justify-center w-6 h-6 select-none"
                      >
                        <div 
                          className={`w-5 h-5 rotate-45 flex items-center justify-center transition-all duration-300 rounded-[3px] border ${
                            res === 'goal' 
                              ? 'bg-emerald-500 border-emerald-400 text-white shadow-md shadow-emerald-500/20' 
                              : res === 'miss' 
                                ? 'bg-red-600 border-red-500 text-white shadow-md shadow-red-600/20' 
                                : 'bg-slate-900 border-slate-700 text-slate-500'
                          }`}
                        >
                          <span className="-rotate-45 block text-[10px] font-mono font-black">
                            {idx + 1}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Winner Celebration Banner */}
            {state.penaltyShootout.winner && (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-500 rounded-full px-8 py-2 text-slate-950 font-black text-sm uppercase tracking-widest mt-2 shadow-2xl flex items-center gap-2 animate-bounce select-none border border-yellow-300"
              >
                <Sparkles className="w-4 h-4 text-slate-950 fill-slate-950 animate-pulse" />
                <span>Winner: {state.penaltyShootout.winner === 'home' ? state.settings.homeTeam : state.settings.awayTeam} 🎉</span>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------------------------------------------------- */}
      {/* 11.5. WINNER TEAM ANNOUNCEMENT GRAPHIC */}
      {/* ---------------------------------------------------- */}
      <AnimatePresence>
        {state.activeWinnerAnnounce && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 80 }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 w-full max-w-5xl px-6 z-[100] pointer-events-none"
            id="obs-winner-overlay"
          >
            {/* Subtle premium gold radial ambient light glow underneath banner */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/10 to-amber-500/0 blur-2xl opacity-75 rounded-full pointer-events-none" />

            {/* Premium Glassmorphism Horizontal Banner Container */}
            <div className="relative w-full bg-gradient-to-r from-slate-950/95 via-slate-900/98 to-slate-950/95 border-2 border-amber-500/50 rounded-2xl p-4.5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] shadow-amber-500/5 backdrop-blur-md flex items-center justify-between gap-6 overflow-hidden">
              
              {/* Premium top gold linear strip indicator */}
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
              
              {/* Left Section: Trophy Container & Title */}
              <div className="flex items-center gap-4.5 shrink-0">
                {(() => {
                  const winner = state.activeWinnerAnnounce.winner;
                  const teamLogo = winner === 'home' ? state.settings.homeLogo : (winner === 'away' ? state.settings.awayLogo : null);
                  
                  if (teamLogo) {
                    if (isImageUrl(teamLogo)) {
                      return (
                        <img 
                          src={teamLogo} 
                          alt="" 
                          className="w-14 h-14 object-cover rounded-xl border-2 border-amber-500 shadow-lg shadow-amber-500/30 shrink-0" 
                          referrerPolicy="no-referrer"
                        />
                      );
                    } else {
                      return (
                        <div className="w-14 h-14 bg-slate-950 border-2 border-amber-500 rounded-xl flex items-center justify-center text-3xl shadow-lg shrink-0">
                          {teamLogo}
                        </div>
                      );
                    }
                  }
                  return (
                    <motion.div 
                      animate={{ rotate: [0, -8, 8, -4, 4, 0], scale: [1, 1.05, 1] }}
                      transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 3.5 }}
                      className="w-14 h-14 bg-gradient-to-br from-amber-400 via-yellow-300 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30 border border-amber-200 shrink-0"
                    >
                      <Trophy className="w-7 h-7 text-slate-950 stroke-[2.5]" />
                    </motion.div>
                  );
                })()}
                <div className="flex flex-col text-left">
                  <span className="text-amber-400 font-mono text-[9px] font-black uppercase tracking-[0.25em] leading-none mb-1.5">
                    {state.activeWinnerAnnounce.winner === 'draw' ? 'MATCH COMPLETED' : 'CONGRATULATIONS'}
                  </span>
                  <span className="text-white text-xl font-black uppercase tracking-tight leading-none flex items-center gap-2">
                    {state.activeWinnerAnnounce.winner === 'draw' ? 'HONOURS EVEN' : (state.activeWinnerAnnounce.customTitle === 'CHAMPION IS' ? 'CHAMPION IS' : 'WINNER IS')}
                  </span>
                </div>
              </div>

              {/* Center Section: Main Champion Display with Highlighted Logo */}
              <div className="flex items-center gap-4 px-6 py-2 bg-slate-950/70 border border-amber-500/20 rounded-xl relative overflow-hidden flex-1 justify-center max-w-md shadow-inner">
                {/* Gold diagonal shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/5 to-transparent -skew-x-12 translate-x-[-100%] animate-[shimmer_3.5s_infinite]" />
                
                {state.activeWinnerAnnounce.winner === 'home' && (
                  <div className="flex items-center gap-3.5">
                    {state.settings.homeLogo && (
                      isImageUrl(state.settings.homeLogo) ? (
                        <img 
                          src={state.settings.homeLogo} 
                          alt="" 
                          className="w-11 h-11 object-cover rounded-full border-2 border-amber-400/60 shadow-md shrink-0" 
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="text-3xl shrink-0">{state.settings.homeLogo}</span>
                      )
                    )}
                    <div className="text-left">
                      <h1 className="text-2xl font-black text-white uppercase tracking-tight leading-none">
                        {state.settings.homeTeam}
                      </h1>
                      <span className="text-[9px] font-mono text-amber-400 font-black tracking-widest uppercase leading-none block mt-1.5">
                        {state.activeWinnerAnnounce.customTitle === 'CHAMPION IS' ? 'CHAMPIONS' : 'WINNERS'}
                      </span>
                    </div>
                  </div>
                )}

                {state.activeWinnerAnnounce.winner === 'away' && (
                  <div className="flex items-center gap-3.5">
                    {state.settings.awayLogo && (
                      isImageUrl(state.settings.awayLogo) ? (
                        <img 
                          src={state.settings.awayLogo} 
                          alt="" 
                          className="w-11 h-11 object-cover rounded-full border-2 border-amber-400/60 shadow-md shrink-0" 
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="text-3xl shrink-0">{state.settings.awayLogo}</span>
                      )
                    )}
                    <div className="text-left">
                      <h1 className="text-2xl font-black text-white uppercase tracking-tight leading-none">
                        {state.settings.awayTeam}
                      </h1>
                      <span className="text-[9px] font-mono text-amber-400 font-black tracking-widest uppercase leading-none block mt-1.5">
                        {state.activeWinnerAnnounce.customTitle === 'CHAMPION IS' ? 'CHAMPIONS' : 'WINNERS'}
                      </span>
                    </div>
                  </div>
                )}

                {state.activeWinnerAnnounce.winner === 'draw' && (
                  <div className="flex items-center gap-3.5">
                    <div className="flex items-center gap-1.5 shrink-0">
                      {isImageUrl(state.settings.homeLogo) ? <img src={state.settings.homeLogo} alt="" className="w-7 h-7 object-cover rounded-full" referrerPolicy="no-referrer" /> : <span className="text-xl">{state.settings.homeLogo}</span>}
                      <span className="text-slate-500 font-black text-[10px]">VS</span>
                      {isImageUrl(state.settings.awayLogo) ? <img src={state.settings.awayLogo} alt="" className="w-7 h-7 object-cover rounded-full" referrerPolicy="no-referrer" /> : <span className="text-xl">{state.settings.awayLogo}</span>}
                    </div>
                    <div className="text-left">
                      <h1 className="text-base font-black text-white uppercase tracking-tight leading-none">
                        {state.settings.homeTeam} & {state.settings.awayTeam}
                      </h1>
                      <span className="text-[9px] font-mono text-amber-400 font-black tracking-widest uppercase leading-none block mt-1.5">MATCH COMPLETED (TIE)</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Section: Score breakdown card & Metadata */}
              <div className="flex flex-col items-end gap-1.5 shrink-0 text-right">
                <div className="bg-slate-950/90 border border-slate-800/80 rounded-xl py-1.5 px-4.5 flex items-center justify-center gap-3 shadow-inner">
                  <span className="font-mono text-[10px] font-black text-slate-400 uppercase tracking-wider">{state.settings.homeTeamShort}</span>
                  <span className="font-mono text-xl font-black text-white bg-slate-900 px-2 py-0.5 rounded border border-slate-800/60">{state.scoreboard.homeScore}</span>
                  <span className="text-slate-500 font-bold text-sm">:</span>
                  <span className="font-mono text-xl font-black text-white bg-slate-900 px-2 py-0.5 rounded border border-slate-800/60">{state.scoreboard.awayScore}</span>
                  <span className="font-mono text-[10px] font-black text-slate-400 uppercase tracking-wider">{state.settings.awayTeamShort}</span>
                  {(state.penaltyShootout.winner || state.penaltyShootout.homeAttempts.length > 0 || state.penaltyShootout.awayAttempts.length > 0) && (
                    <span className="text-amber-400 font-mono text-xs font-black bg-slate-900 border border-amber-500/30 px-1.5 py-0.5 rounded ml-1 animate-pulse">
                      ({state.penaltyShootout.homeAttempts.filter(x => x === 'goal').length}-{state.penaltyShootout.awayAttempts.filter(x => x === 'goal').length})
                    </span>
                  )}
                </div>
                <span className="text-[9px] text-slate-400 font-mono tracking-widest uppercase block leading-none">
                  {state.settings.leagueName} • {state.settings.location}
                </span>
              </div>

            </div>
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
            className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/85 z-[90] flex flex-col justify-between p-16 text-center pointer-events-none select-none"
            id="obs-welcome-overlay"
          >
            {/* Ambient glowing orbs */}
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />
            
            {/* Subtle background overlay pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff04_1px,transparent_1px)] [background-size:24px_24px] opacity-60 pointer-events-none" />

            {/* Cinematic top header */}
            <div className="flex flex-col items-center gap-4 mt-4 z-10">
              {state.settings.competitionLogo && (
                isImageUrl(state.settings.competitionLogo) ? (
                  <img 
                    src={state.settings.competitionLogo} 
                    alt="" 
                    className="w-24 h-24 object-contain drop-shadow-[0_0_20px_rgba(59,130,246,0.4)]" 
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="text-6xl leading-none">{state.settings.competitionLogo}</span>
                )
              )}
              <div>
                <span className="text-blue-400 font-mono text-xs uppercase tracking-[0.4em] font-black block mb-1">
                  LIVE BROADCAST PRE-SHOW
                </span>
                <h1 className="text-5xl font-black text-white tracking-wider uppercase leading-none">
                  {state.settings.leagueName}
                </h1>
                <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mt-2 block">
                  {state.settings.season || '2026/2027'} EDITION
                </span>
              </div>
            </div>

            {/* Giant Matchup Face-off (Middle Section) */}
            <div className="flex items-center justify-center gap-16 my-auto z-10">
              {/* Home Side */}
              <div className="flex flex-col items-center w-[380px]">
                <div className="w-80 h-80 rounded-[2.5rem] p-1.5 bg-gradient-to-tr from-blue-500 to-indigo-500 shadow-[0_20px_50px_rgba(59,130,246,0.15)] mb-6 transition-transform duration-300 hover:scale-105">
                  <div className="w-full h-full rounded-[2.3rem] bg-slate-950 overflow-hidden relative border-4 border-slate-950 flex items-center justify-center p-8">
                    {state.settings.homeLogo ? (
                      isImageUrl(state.settings.homeLogo) ? (
                        <img src={state.settings.homeLogo} alt="" className="max-w-full max-h-full object-contain rounded-2xl" referrerPolicy="no-referrer" />
                      ) : (
                        <span className="text-9xl leading-none">{state.settings.homeLogo}</span>
                      )
                    ) : (
                      <span className="text-8xl font-black font-mono text-slate-600">{state.settings.homeTeamShort || 'H'}</span>
                    )}
                  </div>
                </div>
                <h2 className="text-4xl font-black text-white uppercase tracking-tight truncate w-full text-center">
                  {state.settings.homeTeam}
                </h2>
              </div>

              {/* Massive VS Indicator */}
              <div className="flex flex-col items-center">
                <div className="px-10 py-5 bg-gradient-to-b from-amber-950/60 to-red-950/60 border-2 border-orange-500/40 rounded-2xl shadow-[0_0_50px_rgba(239,68,68,0.3)] animate-pulse flex items-center justify-center">
                  <span className="text-5xl font-black font-mono tracking-[0.1em] pl-2 uppercase bg-clip-text text-transparent bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400 drop-shadow-[0_2px_10px_rgba(239,68,68,0.5)]">
                    VS
                  </span>
                </div>
              </div>

              {/* Away Side */}
              <div className="flex flex-col items-center w-[380px]">
                <div className="w-80 h-80 rounded-[2.5rem] p-1.5 bg-gradient-to-tr from-blue-500 to-indigo-500 shadow-[0_20px_50px_rgba(59,130,246,0.15)] mb-6 transition-transform duration-300 hover:scale-105">
                  <div className="w-full h-full rounded-[2.3rem] bg-slate-950 overflow-hidden relative border-4 border-slate-950 flex items-center justify-center p-8">
                    {state.settings.awayLogo ? (
                      isImageUrl(state.settings.awayLogo) ? (
                        <img src={state.settings.awayLogo} alt="" className="max-w-full max-h-full object-contain rounded-2xl" referrerPolicy="no-referrer" />
                      ) : (
                        <span className="text-9xl leading-none">{state.settings.awayLogo}</span>
                      )
                    ) : (
                      <span className="text-8xl font-black font-mono text-slate-600">{state.settings.awayTeamShort || 'A'}</span>
                    )}
                  </div>
                </div>
                <h2 className="text-4xl font-black text-white uppercase tracking-tight truncate w-full text-center">
                  {state.settings.awayTeam}
                </h2>
              </div>
            </div>

            {/* Welcome banner text */}
            <div className="mb-6 z-10">
              <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 uppercase tracking-[0.1em] animate-pulse">
                WELCOME TO THE MATCH
              </span>
              <p className="text-xs text-slate-400 mt-2.5 font-mono uppercase tracking-widest max-w-xl mx-auto leading-relaxed">
                The action is about to begin. Adjust your audio, sit back, and enjoy the coverage.
              </p>
            </div>

            {/* Stadium details footer */}
            <div className="grid grid-cols-3 divide-x divide-slate-850 gap-4 w-full border-t border-slate-800/80 pt-6 text-xs font-mono text-slate-400 z-10 mb-4 max-w-4xl mx-auto">
              <div className="px-2 text-center">
                <span className="text-[10px] text-slate-500 block uppercase mb-1 font-bold">STADIUM VENUE</span>
                <span className="text-white font-bold text-sm uppercase">{state.settings.location}</span>
              </div>
              <div className="px-2 text-center">
                <span className="text-[10px] text-slate-500 block uppercase mb-1 font-bold">KICKOFF TIME</span>
                <span className="text-white font-bold text-sm uppercase">{state.settings.kickoffTime}</span>
              </div>
              <div className="px-2 text-center">
                <span className="text-[10px] text-slate-500 block uppercase mb-1 font-bold">MATCH REFEREE</span>
                <span className="text-white font-bold text-sm uppercase">{state.settings.referee}</span>
              </div>
            </div>
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
