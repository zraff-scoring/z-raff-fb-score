import { useState } from 'react';
import { Layout, Activity, EyeOff, Sparkles, Share2, CreditCard, ArrowLeftRight, Tv2, Video } from 'lucide-react';
import { BroadcastState, LowerThirdGraphic, VARGraphic } from '../types.js';

interface OverlaysCategoryProps {
  state: BroadcastState;
  updateState: (updater: BroadcastState | ((prev: BroadcastState) => BroadcastState)) => void;
  triggerReplay: () => void;
}

export default function OverlaysCategory({ state, updateState, triggerReplay }: OverlaysCategoryProps) {
  // Lower thirds
  const [ltType, setLtType] = useState<LowerThirdGraphic['type']>('player');
  const [ltTitle, setLtTitle] = useState('');
  const [ltSubtitle, setLtSubtitle] = useState('');
  const [ltAnim, setLtAnim] = useState<LowerThirdGraphic['animationType']>('slide-left');

  // Cards
  const [cardTeam, setCardTeam] = useState<'home' | 'away'>('home');
  const [cardPlayer, setCardPlayer] = useState('');
  const [cardType, setCardType] = useState<'yellow' | 'red'>('yellow');
  const [cardMinute, setCardMinute] = useState(45);

  // Substitutions
  const [subTeam, setSubTeam] = useState<'home' | 'away'>('home');
  const [subPlayerIn, setSubPlayerIn] = useState('');
  const [subPlayerOut, setSubPlayerOut] = useState('');
  const [subMinute, setSubMinute] = useState(45);

  // VAR
  const [varMessage, setVarMessage] = useState('');

  // Sponsor
  const [sponsorType, setSponsorType] = useState<'banner' | 'logo-rotation' | 'card' | null>(null);
  const [sponsorName, setSponsorName] = useState('');
  const [sponsorLogo, setSponsorLogo] = useState('');
  const [sponsorText, setSponsorText] = useState('');

  // Socials
  const [socialPlatform, setSocialPlatform] = useState<'instagram' | 'facebook' | 'tiktok' | 'youtube' | 'custom' | null>(null);
  const [socialHandle, setSocialHandle] = useState('');
  const [socialText, setSocialText] = useState('');

  const triggerLowerThird = () => {
    updateState((prev) => ({
      ...prev,
      activeLowerThird: {
        type: ltType,
        title: ltTitle || 'Broadcast Name',
        subtitle: ltSubtitle || 'Bio or details',
        animationType: ltAnim,
      }
    }));
  };

  const adjustStat = (statName: keyof typeof state.stats, value: number | boolean) => {
    updateState((prev) => ({
      ...prev,
      stats: {
        ...prev.stats,
        [statName]: value,
      }
    }));
  };

  const toggleStatsView = () => {
    updateState((prev) => ({
      ...prev,
      stats: {
        ...prev.stats,
        activeStatsView: !prev.stats.activeStatsView,
      }
    }));
  };

  const triggerCardPopup = () => {
    updateState((prev) => {
      const nextStats = { ...prev.stats };
      if (cardType === 'yellow') {
        if (cardTeam === 'home') {
          nextStats.yellowCardsHome = (nextStats.yellowCardsHome || 0) + 1;
        } else {
          nextStats.yellowCardsAway = (nextStats.yellowCardsAway || 0) + 1;
        }
      } else {
        if (cardTeam === 'home') {
          nextStats.redCardsHome = (nextStats.redCardsHome || 0) + 1;
        } else {
          nextStats.redCardsAway = (nextStats.redCardsAway || 0) + 1;
        }
      }

      return {
        ...prev,
        stats: nextStats,
        activeCard: {
          team: cardTeam,
          player: cardPlayer || 'Unidentified Player',
          cardType,
          minute: cardMinute,
        }
      };
    });

    setTimeout(() => {
      updateState((prev) => ({ ...prev, activeCard: null }));
    }, 6000);
  };

  const triggerSubPopup = () => {
    updateState((prev) => ({
      ...prev,
      activeSubstitution: {
        team: subTeam,
        playerIn: subPlayerIn || 'Sub In',
        playerOut: subPlayerOut || 'Sub Out',
        minute: subMinute,
      }
    }));

    setTimeout(() => {
      updateState((prev) => ({ ...prev, activeSubstitution: null }));
    }, 7000);
  };

  const triggerVARPopup = (type: VARGraphic['type']) => {
    updateState((prev) => ({
      ...prev,
      activeVAR: {
        type,
        customMessage: varMessage || `Reviewing incident for potential outcome`,
      }
    }));
  };

  const triggerSponsor = () => {
    updateState((prev) => ({
      ...prev,
      activeSponsor: {
        type: sponsorType,
        logoUrl: sponsorLogo || '⭐',
        sponsorName: sponsorName || 'Sponsor Name',
        promoText: sponsorText || 'Promo Text Details',
      }
    }));
  };

  const triggerSocial = () => {
    updateState((prev) => ({
      ...prev,
      activeSocial: {
        platform: socialPlatform,
        handle: socialHandle || '@handle',
        promoText: socialText || 'Follow for updates!',
      }
    }));
  };

  return (
    <div className="flex flex-col gap-8">
      
      {/* SECTION 1: LOWER THIRDS & BROADCAST STATS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LOWER THIRD CONTROL PANEL */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Layout className="w-5 h-5 text-blue-500 animate-pulse" />
                <h2 className="text-lg font-black text-white">Lower Thirds System</h2>
              </div>
              {state.activeLowerThird && (
                <button 
                  onClick={() => updateState((prev) => ({ ...prev, activeLowerThird: null }))}
                  className="px-3 py-1.5 text-xs rounded-xl font-bold flex items-center gap-1 bg-red-600 hover:bg-red-500 text-white shadow shadow-red-600/10 transition-colors cursor-pointer"
                  id="btn-l3-hide"
                >
                  <EyeOff className="w-3.5 h-3.5" /> Hide L3
                </button>
              )}
            </div>

            <div className="flex flex-col gap-3.5">
              <div className="grid grid-cols-2 gap-3.5">
                <div className="flex flex-col">
                  <label className="text-[10px] font-mono tracking-wider text-slate-400 uppercase mb-1.5 font-bold">Graphic Type</label>
                  <select 
                    value={ltType}
                    onChange={(e) => setLtType(e.target.value as LowerThirdGraphic['type'])}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 w-full text-white"
                    id="l3-select-type"
                  >
                    <option value="player">Player Name</option>
                    <option value="coach">Head Coach</option>
                    <option value="commentator">Commentator</option>
                    <option value="official">Match Official</option>
                    <option value="custom">Custom Info Card</option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="text-[10px] font-mono tracking-wider text-slate-400 uppercase mb-1.5 font-bold">Animation Style</label>
                  <select 
                    value={ltAnim}
                    onChange={(e) => setLtAnim(e.target.value as LowerThirdGraphic['animationType'])}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 w-full text-white"
                    id="l3-select-anim"
                  >
                    <option value="slide-left">Slide In Left</option>
                    <option value="slide-right">Slide In Right</option>
                    <option value="fade">Smooth Fade</option>
                    <option value="reveal-3d">3D Rotate Reveal</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="flex flex-col">
                  <label className="text-[10px] font-mono tracking-wider text-slate-400 uppercase mb-1.5 font-bold">Main Header / Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Martin Ødegaard" 
                    value={ltTitle}
                    onChange={(e) => setLtTitle(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 w-full text-white"
                    id="l3-input-title"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[10px] font-mono tracking-wider text-slate-400 uppercase mb-1.5 font-bold">Sub-Header / Bio</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Captain • Arsenal FC" 
                    value={ltSubtitle}
                    onChange={(e) => setLtSubtitle(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 w-full text-white"
                    id="l3-input-subtitle"
                  />
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={triggerLowerThird}
            className="w-full mt-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-600/15 cursor-pointer uppercase tracking-wider"
            id="btn-l3-trigger"
          >
            <Layout className="w-4 h-4" /> TRIGGER LOWER THIRD ON-AIR
          </button>
        </div>

        {/* BROADCAST STATS ENGINE */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-black text-white">Match Stats & Analytics</h2>
            </div>
            <button 
              onClick={toggleStatsView}
              className={`px-3 py-1.5 rounded-lg font-black text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                state.stats.activeStatsView ? 'bg-red-600 text-white shadow-lg' : 'bg-blue-600 text-white'
              }`}
              id="btn-stats-toggle"
            >
              <EyeOff className="w-3.5 h-3.5" />
              {state.stats.activeStatsView ? 'HIDE STATS GRAPHIC' : 'SHOW STATS OVERLAY'}
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {/* Possession */}
            <div className="flex flex-col">
              <div className="flex justify-between text-xs font-mono font-bold text-slate-400 mb-1.5">
                <span>{state.settings.homeTeam.substring(0, 3).toUpperCase()}: {state.stats.possessionHome}%</span>
                <span className="uppercase text-[10px] tracking-wider font-sans">Ball Possession</span>
                <span>{state.settings.awayTeam.substring(0, 3).toUpperCase()}: {100 - state.stats.possessionHome}%</span>
              </div>
              <input 
                type="range" 
                min="20" 
                max="80" 
                value={state.stats.possessionHome}
                onChange={(e) => adjustStat('possessionHome', parseInt(e.target.value) || 50)}
                className="w-full accent-blue-500 bg-slate-950 h-2 rounded-full cursor-pointer"
                id="stats-possession-slider"
              />
            </div>

            {/* Total Shots */}
            <div className="grid grid-cols-3 items-center gap-2">
              <span className="text-xs font-bold text-slate-300 uppercase font-mono">Total Shots</span>
              <div className="flex items-center justify-between gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                <span className="text-xs font-mono font-bold text-white">{state.stats.shotsHome}</span>
                <div className="flex gap-1">
                  <button onClick={() => adjustStat('shotsHome', Math.max(0, state.stats.shotsHome - 1))} className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center text-xs text-white hover:bg-slate-700 cursor-pointer">-</button>
                  <button onClick={() => adjustStat('shotsHome', state.stats.shotsHome + 1)} className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center text-xs text-white hover:bg-slate-700 cursor-pointer">+</button>
                </div>
              </div>
              <div className="flex items-center justify-between gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                <span className="text-xs font-mono font-bold text-white">{state.stats.shotsAway}</span>
                <div className="flex gap-1">
                  <button onClick={() => adjustStat('shotsAway', Math.max(0, state.stats.shotsAway - 1))} className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center text-xs text-white hover:bg-slate-700 cursor-pointer">-</button>
                  <button onClick={() => adjustStat('shotsAway', state.stats.shotsAway + 1)} className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center text-xs text-white hover:bg-slate-700 cursor-pointer">+</button>
                </div>
              </div>
            </div>

            {/* Shots On Target */}
            <div className="grid grid-cols-3 items-center gap-2">
              <span className="text-xs font-bold text-slate-300 uppercase font-mono">On Target</span>
              <div className="flex items-center justify-between gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                <span className="text-xs font-mono font-bold text-white">{state.stats.shotsOnTargetHome}</span>
                <div className="flex gap-1">
                  <button onClick={() => adjustStat('shotsOnTargetHome', Math.max(0, state.stats.shotsOnTargetHome - 1))} className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center text-xs text-white hover:bg-slate-700 cursor-pointer">-</button>
                  <button onClick={() => adjustStat('shotsOnTargetHome', state.stats.shotsOnTargetHome + 1)} className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center text-xs text-white hover:bg-slate-700 cursor-pointer">+</button>
                </div>
              </div>
              <div className="flex items-center justify-between gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                <span className="text-xs font-mono font-bold text-white">{state.stats.shotsOnTargetAway}</span>
                <div className="flex gap-1">
                  <button onClick={() => adjustStat('shotsOnTargetAway', Math.max(0, state.stats.shotsOnTargetAway - 1))} className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center text-xs text-white hover:bg-slate-700 cursor-pointer">-</button>
                  <button onClick={() => adjustStat('shotsOnTargetAway', state.stats.shotsOnTargetAway + 1)} className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center text-xs text-white hover:bg-slate-700 cursor-pointer">+</button>
                </div>
              </div>
            </div>

            {/* Expected Goals */}
            <div className="grid grid-cols-3 items-center gap-2">
              <span className="text-xs font-bold text-slate-300 uppercase font-mono">Expected xG</span>
              <div className="flex items-center justify-between gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                <span className="text-xs font-mono font-bold text-white">{state.stats.xGHome.toFixed(2)}</span>
                <div className="flex gap-1">
                  <button onClick={() => adjustStat('xGHome', Math.max(0, state.stats.xGHome - 0.1))} className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center text-xs text-white hover:bg-slate-700 cursor-pointer">-</button>
                  <button onClick={() => adjustStat('xGHome', state.stats.xGHome + 0.1)} className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center text-xs text-white hover:bg-slate-700 cursor-pointer">+</button>
                </div>
              </div>
              <div className="flex items-center justify-between gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                <span className="text-xs font-mono font-bold text-white">{state.stats.xGAway.toFixed(2)}</span>
                <div className="flex gap-1">
                  <button onClick={() => adjustStat('xGAway', Math.max(0, state.stats.xGAway - 0.1))} className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center text-xs text-white hover:bg-slate-700 cursor-pointer">-</button>
                  <button onClick={() => adjustStat('xGAway', state.stats.xGAway + 0.1)} className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center text-xs text-white hover:bg-slate-700 cursor-pointer">+</button>
                </div>
              </div>
            </div>

            {/* Corners */}
            <div className="grid grid-cols-3 items-center gap-2">
              <span className="text-xs font-bold text-slate-300 uppercase font-mono">Corners</span>
              <div className="flex items-center justify-between gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                <span className="text-xs font-mono font-bold text-white">{state.stats.cornersHome}</span>
                <div className="flex gap-1">
                  <button onClick={() => adjustStat('cornersHome', Math.max(0, state.stats.cornersHome - 1))} className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center text-xs text-white hover:bg-slate-700 cursor-pointer">-</button>
                  <button onClick={() => adjustStat('cornersHome', state.stats.cornersHome + 1)} className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center text-xs text-white hover:bg-slate-700 cursor-pointer">+</button>
                </div>
              </div>
              <div className="flex items-center justify-between gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                <span className="text-xs font-mono font-bold text-white">{state.stats.cornersAway}</span>
                <div className="flex gap-1">
                  <button onClick={() => adjustStat('cornersAway', Math.max(0, state.stats.cornersAway - 1))} className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center text-xs text-white hover:bg-slate-700 cursor-pointer">-</button>
                  <button onClick={() => adjustStat('cornersAway', state.stats.cornersAway + 1)} className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center text-xs text-white hover:bg-slate-700 cursor-pointer">+</button>
                </div>
              </div>
            </div>

            {/* Fouls */}
            <div className="grid grid-cols-3 items-center gap-2">
              <span className="text-xs font-bold text-slate-300 uppercase font-mono">Fouls</span>
              <div className="flex items-center justify-between gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                <span className="text-xs font-mono font-bold text-white">{state.stats.foulsHome}</span>
                <div className="flex gap-1">
                  <button onClick={() => adjustStat('foulsHome', Math.max(0, state.stats.foulsHome - 1))} className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center text-xs text-white hover:bg-slate-700 cursor-pointer">-</button>
                  <button onClick={() => adjustStat('foulsHome', state.stats.foulsHome + 1)} className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center text-xs text-white hover:bg-slate-700 cursor-pointer">+</button>
                </div>
              </div>
              <div className="flex items-center justify-between gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                <span className="text-xs font-mono font-bold text-white">{state.stats.foulsAway}</span>
                <div className="flex gap-1">
                  <button onClick={() => adjustStat('foulsAway', Math.max(0, state.stats.foulsAway - 1))} className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center text-xs text-white hover:bg-slate-700 cursor-pointer">-</button>
                  <button onClick={() => adjustStat('foulsAway', state.stats.foulsAway + 1)} className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center text-xs text-white hover:bg-slate-700 cursor-pointer">+</button>
                </div>
              </div>
            </div>

            {/* Yellow Cards */}
            <div className="grid grid-cols-3 items-center gap-2">
              <span className="text-xs font-bold text-slate-300 uppercase font-mono">Yellow Cards</span>
              <div className="flex items-center justify-between gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                <span className="text-xs font-mono font-bold text-white">{state.stats.yellowCardsHome}</span>
                <div className="flex gap-1">
                  <button onClick={() => adjustStat('yellowCardsHome', Math.max(0, state.stats.yellowCardsHome - 1))} className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center text-xs text-white hover:bg-slate-700 cursor-pointer">-</button>
                  <button onClick={() => adjustStat('yellowCardsHome', state.stats.yellowCardsHome + 1)} className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center text-xs text-white hover:bg-slate-700 cursor-pointer">+</button>
                </div>
              </div>
              <div className="flex items-center justify-between gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                <span className="text-xs font-mono font-bold text-white">{state.stats.yellowCardsAway}</span>
                <div className="flex gap-1">
                  <button onClick={() => adjustStat('yellowCardsAway', Math.max(0, state.stats.yellowCardsAway - 1))} className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center text-xs text-white hover:bg-slate-700 cursor-pointer">-</button>
                  <button onClick={() => adjustStat('yellowCardsAway', state.stats.yellowCardsAway + 1)} className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center text-xs text-white hover:bg-slate-700 cursor-pointer">+</button>
                </div>
              </div>
            </div>

            {/* Red Cards */}
            <div className="grid grid-cols-3 items-center gap-2">
              <span className="text-xs font-bold text-slate-300 uppercase font-mono">Red Cards</span>
              <div className="flex items-center justify-between gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                <span className="text-xs font-mono font-bold text-white">{state.stats.redCardsHome}</span>
                <div className="flex gap-1">
                  <button onClick={() => adjustStat('redCardsHome', Math.max(0, state.stats.redCardsHome - 1))} className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center text-xs text-white hover:bg-slate-700 cursor-pointer">-</button>
                  <button onClick={() => adjustStat('redCardsHome', state.stats.redCardsHome + 1)} className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center text-xs text-white hover:bg-slate-700 cursor-pointer">+</button>
                </div>
              </div>
              <div className="flex items-center justify-between gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                <span className="text-xs font-mono font-bold text-white">{state.stats.redCardsAway}</span>
                <div className="flex gap-1">
                  <button onClick={() => adjustStat('redCardsAway', Math.max(0, state.stats.redCardsAway - 1))} className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center text-xs text-white hover:bg-slate-700 cursor-pointer">-</button>
                  <button onClick={() => adjustStat('redCardsAway', state.stats.redCardsAway + 1)} className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center text-xs text-white hover:bg-slate-700 cursor-pointer">+</button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* SECTION 2: IN-GAME EVENTS (SUBSTITUTIONS, CARDS & VAR checks) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CARDS SYSTEM */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-yellow-500 fill-yellow-500/10" />
                <h2 className="text-base font-black text-white">Broadcast Cards</h2>
              </div>
              {state.activeCard && (
                <button 
                  onClick={() => updateState((prev) => ({ ...prev, activeCard: null }))}
                  className="px-2.5 py-1 text-[10px] rounded-lg font-bold flex items-center gap-1 bg-red-600 hover:bg-red-500 text-white cursor-pointer"
                  id="btn-cards-hide"
                >
                  <EyeOff className="w-3.5 h-3.5" /> Hide
                </button>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-850">
                <button 
                  onClick={() => setCardType('yellow')}
                  className={`py-1.5 rounded-lg text-[10px] font-black transition-all cursor-pointer uppercase ${
                    cardType === 'yellow' ? 'bg-yellow-500 text-slate-950 shadow' : 'text-slate-400'
                  }`}
                  id="btn-cards-select-yellow"
                >
                  Yellow Card
                </button>
                <button 
                  onClick={() => setCardType('red')}
                  className={`py-1.5 rounded-lg text-[10px] font-black transition-all cursor-pointer uppercase ${
                    cardType === 'red' ? 'bg-red-600 text-white shadow' : 'text-slate-400'
                  }`}
                  id="btn-cards-select-red"
                >
                  Red Card
                </button>
              </div>

              <div className="flex flex-col">
                <label className="text-[10px] font-mono tracking-wider text-slate-400 uppercase mb-1 font-bold">Player Carded</label>
                <input 
                  type="text" 
                  placeholder="e.g. William Saliba" 
                  value={cardPlayer}
                  onChange={(e) => setCardPlayer(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 w-full text-white"
                  id="cards-player-name"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col">
                  <label className="text-[10px] font-mono tracking-wider text-slate-400 uppercase mb-1 font-bold">Team</label>
                  <select 
                    value={cardTeam}
                    onChange={(e) => setCardTeam(e.target.value as 'home' | 'away')}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500 w-full text-white"
                    id="cards-select-team"
                  >
                    <option value="home">{state.settings.homeTeam || 'Home'}</option>
                    <option value="away">{state.settings.awayTeam || 'Away'}</option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="text-[10px] font-mono tracking-wider text-slate-400 uppercase mb-1 font-bold">Minute</label>
                  <input 
                    type="number" 
                    value={cardMinute}
                    onChange={(e) => setCardMinute(parseInt(e.target.value) || 0)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500 w-full text-white font-mono"
                    id="cards-minute"
                  />
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={triggerCardPopup}
            className={`w-full mt-5 py-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer uppercase ${
              cardType === 'yellow' ? 'bg-yellow-500 hover:bg-yellow-400 text-slate-950' : 'bg-red-600 hover:bg-red-500 text-white'
            }`}
            id="btn-cards-trigger"
          >
            <CreditCard className="w-4 h-4" /> Trigger Card Popup
          </button>
        </div>

        {/* SUBSTITUTIONS POPUP */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ArrowLeftRight className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-black text-white">Substitutions Board</h2>
              </div>
              {state.activeSubstitution && (
                <button 
                  onClick={() => updateState((prev) => ({ ...prev, activeSubstitution: null }))}
                  className="px-2.5 py-1 text-[10px] rounded-lg font-bold flex items-center gap-1 bg-red-600 hover:bg-red-500 text-white cursor-pointer"
                  id="btn-subs-hide"
                >
                  <EyeOff className="w-3.5 h-3.5" /> Hide
                </button>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col">
                <label className="text-[10px] font-mono tracking-wider text-slate-400 uppercase mb-1 font-bold">Substitution Team</label>
                <select 
                  value={subTeam}
                  onChange={(e) => setSubTeam(e.target.value as 'home' | 'away')}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 w-full text-white"
                  id="subs-select-team"
                >
                  <option value="home">{state.settings.homeTeam || 'Home'}</option>
                  <option value="away">{state.settings.awayTeam || 'Away'}</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col">
                  <label className="text-[10px] font-mono tracking-wider text-slate-400 uppercase mb-1 font-bold">Player Coming IN</label>
                  <input 
                    type="text" 
                    placeholder="In Player Name" 
                    value={subPlayerIn}
                    onChange={(e) => setSubPlayerIn(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 w-full text-white"
                    id="subs-player-in"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[10px] font-mono tracking-wider text-slate-400 uppercase mb-1 font-bold">Player Coming OUT</label>
                  <input 
                    type="text" 
                    placeholder="Out Player Name" 
                    value={subPlayerOut}
                    onChange={(e) => setSubPlayerOut(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 w-full text-white"
                    id="subs-player-out"
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-[10px] font-mono tracking-wider text-slate-400 uppercase mb-1 font-bold">Match Minute</label>
                <input 
                  type="number" 
                  value={subMinute}
                  onChange={(e) => setSubMinute(parseInt(e.target.value) || 0)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500 w-full text-white font-mono"
                  id="subs-minute"
                />
              </div>
            </div>
          </div>

          <button 
            onClick={triggerSubPopup}
            className="w-full mt-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer uppercase"
            id="btn-subs-trigger"
          >
            <ArrowLeftRight className="w-4 h-4" /> Trigger Substitution
          </button>
        </div>

        {/* VAR CHECKS GRAPHICS */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Tv2 className="w-5 h-5 text-indigo-400" />
                <h2 className="text-base font-black text-white">VAR Review Panel</h2>
              </div>
              {state.activeVAR && (
                <button 
                  onClick={() => updateState((prev) => ({ ...prev, activeVAR: null }))}
                  className="px-2.5 py-1 text-[10px] rounded-lg font-bold flex items-center gap-1 bg-red-600 hover:bg-red-500 text-white cursor-pointer"
                  id="btn-var-hide"
                >
                  <EyeOff className="w-3.5 h-3.5" /> Hide
                </button>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col">
                <label className="text-[10px] font-mono tracking-wider text-slate-400 uppercase mb-1 font-bold">Custom VAR Check Description</label>
                <input 
                  type="text" 
                  placeholder="e.g. Checking possible offside on goal" 
                  value={varMessage}
                  onChange={(e) => setVarMessage(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 w-full text-white"
                  id="var-message-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-1.5 mt-1">
                <button 
                  onClick={() => triggerVARPopup('OFFSIDE_REVIEW')}
                  className="py-2 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-lg text-[10px] font-black uppercase cursor-pointer"
                  id="btn-var-offside"
                >
                  Checking Offside
                </button>
                <button 
                  onClick={() => triggerVARPopup('PENALTY_REVIEW')}
                  className="py-2 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-lg text-[10px] font-black uppercase cursor-pointer"
                  id="btn-var-penalty"
                >
                  Checking Penalty
                </button>
                <button 
                  onClick={() => triggerVARPopup('CHECK')}
                  className="py-2 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-lg text-[10px] font-black uppercase cursor-pointer"
                  id="btn-var-card"
                >
                  Red Card Check
                </button>
                <button 
                  onClick={() => triggerVARPopup('GOAL_REVIEW')}
                  className="py-2 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-lg text-[10px] font-black uppercase cursor-pointer"
                  id="btn-var-goal"
                >
                  Checking Goal
                </button>
              </div>
            </div>
          </div>

          <span className="text-[9px] text-slate-500 mt-4 leading-tight block text-center">
            Clicking a VAR button pushes a slow-burn live review screen on the overlay to build suspense.
          </span>
        </div>

      </div>

      {/* SECTION 3: SPONSORSHIPS, SOCIAL PROMOS & VIDEO REPLAYS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SPONSOR ADS */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-500" />
                <h2 className="text-base font-black text-white">Sponsor Displays</h2>
              </div>
              {state.activeSponsor?.type && (
                <button 
                  onClick={() => updateState((prev) => ({ ...prev, activeSponsor: { ...prev.activeSponsor, type: null } }))}
                  className="px-2.5 py-1 text-[10px] rounded-lg font-bold flex items-center gap-1 bg-red-600 hover:bg-red-500 text-white cursor-pointer"
                  id="btn-sponsor-hide"
                >
                  <EyeOff className="w-3.5 h-3.5" /> Hide Ad
                </button>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col">
                  <label className="text-[10px] font-mono tracking-wider text-slate-400 uppercase mb-1 font-bold font-mono">Ad Type</label>
                  <select 
                    value={sponsorType || ''}
                    onChange={(e) => setSponsorType((e.target.value || null) as any)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-blue-500 w-full text-white font-medium"
                    id="sponsor-select-type"
                  >
                    <option value="">No Active Ad (Hide)</option>
                    <option value="banner">Floating Top Banner</option>
                    <option value="logo-rotation">Rotating Logo Card</option>
                    <option value="card">Sponsor Showcase Card</option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="text-[10px] font-mono tracking-wider text-slate-400 uppercase mb-1 font-bold">Sponsor Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Nike" 
                    value={sponsorName}
                    onChange={(e) => setSponsorName(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-blue-500 w-full text-white"
                    id="sponsor-name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col">
                  <label className="text-[10px] font-mono tracking-wider text-slate-400 uppercase mb-1 font-bold">Logo (Direct Image Link)</label>
                  <div className="flex gap-1.5">
                    <input 
                      type="text" 
                      placeholder="e.g. https://domain.com/logo.png" 
                      value={sponsorLogo}
                      onChange={(e) => setSponsorLogo(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-blue-500 text-white font-mono"
                      id="sponsor-logo"
                    />
                  </div>
                </div>
                <div className="flex flex-col">
                  <label className="text-[10px] font-mono tracking-wider text-slate-400 uppercase mb-1 font-bold">Promo Subtitle</label>
                  <input 
                    type="text" 
                    placeholder="Just Do It." 
                    value={sponsorText}
                    onChange={(e) => setSponsorText(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-blue-500 w-full text-white font-medium"
                    id="sponsor-text"
                  />
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={triggerSponsor}
            className="w-full mt-5 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer uppercase font-sans tracking-wide"
            id="btn-sponsor-trigger"
          >
            Update Sponsor Display State
          </button>
        </div>

        {/* SOCIAL HANDLES */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-blue-400" />
                <h2 className="text-base font-black text-white">Social Media Promotion</h2>
              </div>
              {state.activeSocial?.platform && (
                <button 
                  onClick={() => updateState((prev) => ({ ...prev, activeSocial: { ...prev.activeSocial, platform: null } }))}
                  className="px-2.5 py-1 text-[10px] rounded-lg font-bold flex items-center gap-1 bg-red-600 hover:bg-red-500 text-white cursor-pointer"
                  id="btn-socials-hide"
                >
                  <EyeOff className="w-3.5 h-3.5" /> Hide Social
                </button>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col">
                  <label className="text-[10px] font-mono tracking-wider text-slate-400 uppercase mb-1 font-bold">Platform</label>
                  <select 
                    value={socialPlatform || ''}
                    onChange={(e) => setSocialPlatform((e.target.value || null) as any)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-blue-500 w-full text-white"
                    id="socials-platform"
                  >
                    <option value="">No Active Social (Hide)</option>
                    <option value="instagram">Instagram</option>
                    <option value="facebook">Facebook</option>
                    <option value="tiktok">TikTok</option>
                    <option value="youtube">YouTube</option>
                    <option value="custom">Custom Promotion</option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="text-[10px] font-mono tracking-wider text-slate-400 uppercase mb-1 font-bold">Handle</label>
                  <input 
                    type="text" 
                    placeholder="e.g. @zraff_sports" 
                    value={socialHandle}
                    onChange={(e) => setSocialHandle(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-blue-500 w-full text-white font-mono"
                    id="socials-handle"
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-[10px] font-mono tracking-wider text-slate-400 uppercase mb-1 font-bold">Promotion Callout Text</label>
                <input 
                  type="text" 
                  placeholder="Follow for live highlights!" 
                  value={socialText}
                  onChange={(e) => setSocialText(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 w-full text-white"
                  id="socials-text"
                />
              </div>
            </div>
          </div>

          <button 
            onClick={triggerSocial}
            className="w-full mt-5 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer uppercase font-sans tracking-wide"
            id="btn-socials-trigger"
          >
            Update Social Overlay State
          </button>
        </div>

        {/* OBS STINGER TRANSITIONS & VIDEO REPLAYS */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
              <Video className="w-5 h-5 text-red-500 animate-pulse" />
              <h2 className="text-base font-black text-white">OBS Replay Stinger</h2>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Launches an instant motion-graphic wipe across the live OBS Browser output. Builds excitement during dynamic reviews or action highlights.
            </p>
          </div>

          <button 
            onClick={triggerReplay}
            disabled={state.activeReplay}
            className={`w-full py-4 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
              state.activeReplay 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                : 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/10'
            }`}
            id="btn-overlays-stinger"
          >
            <Video className="w-4 h-4 fill-current" /> 
            {state.activeReplay ? 'STINGER ACTIVE ON-AIR' : 'TRIGGER STINGER TRANSITION'}
          </button>
        </div>

      </div>

    </div>
  );
}
