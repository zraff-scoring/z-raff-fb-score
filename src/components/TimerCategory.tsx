import { Play, Pause, RotateCcw } from 'lucide-react';
import { BroadcastState, TimerPeriod } from '../types.js';

interface TimerCategoryProps {
  state: BroadcastState;
  updateState: (updater: BroadcastState | ((prev: BroadcastState) => BroadcastState)) => void;
}

export default function TimerCategory({ state, updateState }: TimerCategoryProps) {
  // Timer running state toggle
  const setTimerRunning = (isRunning: boolean) => {
    updateState((prev) => ({
      ...prev,
      timer: { ...prev.timer, isRunning }
    }));
  };

  // Adjust clock seconds helper
  const adjustTimerTime = (amountSeconds: number) => {
    updateState((prev) => ({
      ...prev,
      timer: { ...prev.timer, timeSeconds: Math.max(0, prev.timer.timeSeconds + amountSeconds) }
    }));
  };

  // Skip period and auto-sync starting seconds
  const setTimerPeriod = (period: TimerPeriod) => {
    let seconds = 0;
    if (period === '1ST') seconds = 0;
    if (period === '2ND') seconds = 45 * 60;
    if (period === 'OT1') seconds = 90 * 60;
    if (period === 'OT2') seconds = 105 * 60;
    
    updateState((prev) => ({
      ...prev,
      timer: { ...prev.timer, period, timeSeconds: seconds }
    }));
  };

  // Set injury time minutes
  const setInjuryTime = (minutes: number) => {
    updateState((prev) => ({
      ...prev,
      timer: { ...prev.timer, injuryTimeMinutes: Math.max(0, minutes) }
    }));
  };

  const handleResetMatchClock = () => {
    updateState((prev) => ({
      ...prev,
      timer: {
        timeSeconds: 0,
        isRunning: false,
        period: '1ST',
        injuryTimeMinutes: 0
      }
    }));
  };

  // Time Formatter helper
  const formatTimerTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Play className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
          <h2 className="text-lg font-black text-white">Broadcast Match Clock Controls</h2>
        </div>
        <span className={`px-2.5 py-1 text-xs font-bold rounded-lg font-mono uppercase tracking-wide ${
          state.timer.isRunning 
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 animate-pulse' 
            : 'bg-amber-500/10 text-amber-400 border border-amber-500/25'
        }`}>
          {state.timer.isRunning ? '● RUNNING' : '○ PAUSED'}
        </span>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
        
        {/* BIG DISPLAY CLOCK */}
        <div className="bg-slate-950 px-8 py-6 rounded-2xl border border-slate-850 flex flex-col items-center justify-center min-w-[180px] shadow-inner">
          <span className="text-[10px] font-mono uppercase tracking-widest text-blue-400 mb-1 font-black">
            {state.timer.period} Period
          </span>
          <span className="text-4xl font-black text-white leading-none font-mono tracking-tight select-none">
            {formatTimerTime(state.timer.timeSeconds)}
          </span>
          {state.timer.injuryTimeMinutes > 0 && (
            <span className="text-[11px] font-mono text-emerald-400 font-bold mt-1.5 uppercase bg-emerald-950/20 border border-emerald-500/10 px-2 py-0.5 rounded-full animate-pulse">
              +{state.timer.injuryTimeMinutes} Min Added
            </span>
          )}
        </div>

        {/* TIME ADJUST BUTTONS */}
        <div className="flex-1 w-full flex flex-col gap-3">
          <button 
            onClick={() => setTimerRunning(!state.timer.isRunning)}
            className={`w-full py-4 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer ${
              state.timer.isRunning 
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/10' 
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/10'
            }`}
            id="btn-clock-play-toggle"
          >
            {state.timer.isRunning ? (
              <>
                <Pause className="w-4 h-4 fill-current" /> PAUSE BROADCAST MATCH CLOCK
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" /> START BROADCAST MATCH CLOCK
              </>
            )}
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => adjustTimerTime(-60)}
              className="py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs font-mono font-bold transition-colors cursor-pointer text-center"
              id="btn-clock-minus-1m"
            >
              -1 MINUTE
            </button>
            <button 
              onClick={() => adjustTimerTime(60)}
              className="py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs font-mono font-bold transition-colors cursor-pointer text-center"
              id="btn-clock-plus-1m"
            >
              +1 MINUTE
            </button>
          </div>
        </div>
      </div>

      {/* PERIOD SKIPS */}
      <div className="border-t border-slate-800 pb-5 pt-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-black">
            Skip to Period kickoff (Syncs match seconds)
          </span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {(['1ST', '2ND', 'OT1', 'OT2'] as TimerPeriod[]).map((p) => (
            <button
              key={p}
              onClick={() => setTimerPeriod(p)}
              className={`py-3 rounded-xl text-xs font-mono font-black transition-all cursor-pointer ${
                state.timer.period === p 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/15' 
                  : 'bg-slate-850 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
              id={`btn-clock-period-${p}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* INJURY TIME SCROLL */}
      <div className="border-t border-slate-800 pb-5 pt-4">
        <div className="flex justify-between items-center mb-3">
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-black">
            Injury / Added Time (Manual Input or Slider)
          </span>
          <span className="text-xs font-mono font-black text-emerald-400">
            {state.timer.injuryTimeMinutes} Min Added
          </span>
        </div>
        <div className="flex flex-col gap-4 bg-slate-950 p-4 rounded-xl border border-slate-850">
          <div className="flex items-center gap-4">
            <input 
              type="range" 
              min="0" 
              max={Math.max(15, state.timer.injuryTimeMinutes)} 
              value={state.timer.injuryTimeMinutes}
              onChange={(e) => setInjuryTime(parseInt(e.target.value) || 0)}
              className="flex-1 accent-emerald-500 bg-slate-900 h-2 rounded-full cursor-pointer"
              id="clock-injury-slider"
            />
            
            <div className="flex items-center gap-2 shrink-0">
              <input
                type="number"
                min="0"
                max="99"
                value={state.timer.injuryTimeMinutes === 0 ? "" : state.timer.injuryTimeMinutes}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setInjuryTime(isNaN(val) ? 0 : val);
                }}
                placeholder="0"
                className="w-16 px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-center font-mono font-bold text-white focus:outline-none focus:border-emerald-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-sm"
                id="clock-injury-input"
              />
              <span className="text-[10px] font-mono font-black text-slate-400 uppercase">MIN</span>
            </div>
          </div>

          {/* Quick presets */}
          <div className="flex items-center gap-1.5 border-t border-slate-900/60 pt-3 flex-wrap">
            <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500 font-bold mr-1">Presets:</span>
            {[0, 1, 2, 3, 4, 5, 8, 10].map((mins) => (
              <button
                key={mins}
                onClick={() => setInjuryTime(mins)}
                className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-black transition-colors cursor-pointer ${
                  state.timer.injuryTimeMinutes === mins
                    ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800/60'
                }`}
                id={`btn-injury-preset-${mins}`}
              >
                {mins === 0 ? 'Clear' : `+${mins}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RESET CLOCK BUTTON */}
      <div className="border-t border-slate-800 pt-4 flex justify-end">
        <button 
          onClick={handleResetMatchClock}
          className="px-5 py-2.5 bg-red-950/40 border border-red-900/40 hover:bg-red-900/20 text-red-400 rounded-xl text-xs font-mono font-black transition-all flex items-center gap-1.5 cursor-pointer uppercase"
          id="btn-clock-reset"
        >
          <RotateCcw className="w-4 h-4" /> Reset Match Clock
        </button>
      </div>
    </div>
  );
}
