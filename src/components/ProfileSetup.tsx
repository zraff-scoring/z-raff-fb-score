import React, { useState } from 'react';
import { useAuth, UserProfile } from '../contexts/AuthContext.js';
import { User, Trophy, Sparkles, Cpu, Volume2, Check, ArrowRight } from 'lucide-react';

interface ProfileSetupProps {
  onClose?: () => void;
}

export default function ProfileSetup({ onClose }: ProfileSetupProps) {
  const { user, userProfile, saveProfile, profileLoading, logout } = useAuth();
  const [displayName, setDisplayName] = useState(userProfile?.displayName || user?.displayName || '');
  const [role, setRole] = useState(userProfile?.role || '');
  const [favoriteSport, setFavoriteSport] = useState(userProfile?.favoriteSport || '');
  const [fpsMode, setFpsMode] = useState<'30' | '60'>(userProfile?.fpsMode || '60');
  const [audioCues, setAudioCues] = useState(userProfile?.audioCues ?? true);
  const [error, setError] = useState<string | null>(null);

  const roles = [
    { id: 'commentator', label: 'Main Commentator', description: 'Driving the narrative of live games' },
    { id: 'designer', label: 'Overlay Designer', description: 'Curating scoreboard layouts & themes' },
    { id: 'admin', label: 'Tournament Admin', description: 'Managing real-time scores and line-ups' },
    { id: 'spectator', label: 'Spectator / Guest', description: 'Monitoring or testing live output' },
  ];

  const sports = [
    'Football/Soccer',
    'Basketball',
    'Tennis',
    'Esports',
    'Other / General',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!displayName.trim()) {
      setError('Please provide a display name.');
      return;
    }
    if (!role) {
      setError('Please select your stream role / specialty.');
      return;
    }
    if (!favoriteSport) {
      setError('Please select a primary sport.');
      return;
    }

    try {
      await saveProfile({
        displayName: displayName.trim(),
        role,
        favoriteSport,
        fpsMode,
        audioCues,
      });
      if (onClose) {
        onClose();
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to save profile. Please try again.');
    }
  };

  return (
    <div className={`${onClose ? 'fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 overflow-y-auto' : 'min-h-screen bg-slate-950'} text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8`} id="profile-setup-container">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row my-4">
        {/* Left Side: Brand Visuals */}
        <div className="md:w-5/12 bg-gradient-to-b from-blue-600/80 to-indigo-900/80 p-6 md:p-8 flex flex-col justify-between text-white relative overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.3),transparent)]" />
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-blue-200 border border-white/5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{onClose ? 'Edit Configuration' : 'Step 2 of 2'}</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight mt-6 leading-tight">
              {onClose ? 'Update Broadcast Settings' : 'Initialize Your Broadcast Profile'}
            </h2>
            <p className="text-xs text-blue-100 mt-2 leading-relaxed">
              Customize your Z-raff Operator deck. These parameters customize overlay performance and telemetry metrics.
            </p>
          </div>

          <div className="relative z-10 mt-12 md:mt-0">
            <div className="flex items-center gap-3">
              {user?.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName || 'Avatar'} 
                  className="w-10 h-10 rounded-full border border-white/20" 
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-indigo-500 text-white font-black text-sm flex items-center justify-center">
                  {user?.displayName?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
              <div className="text-left">
                <p className="text-xs font-black truncate max-w-[150px]">{user?.displayName || 'Operator'}</p>
                <p className="text-[10px] text-blue-200/80 truncate max-w-[150px]">{user?.email}</p>
              </div>
            </div>
            
            {!onClose && (
              <button 
                onClick={logout}
                className="mt-4 text-[10px] text-blue-200 hover:text-white transition-colors underline underline-offset-4 font-mono font-bold block"
              >
                Sign in with another account
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Setup Form */}
        <div className="flex-1 p-6 md:p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 flex items-start gap-2.5">
                <span className="font-bold shrink-0">Error:</span>
                <p className="text-[11px] text-rose-300">{error}</p>
              </div>
            )}

            {/* Display Name */}
            <div>
              <label htmlFor="displayName" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-400" />
                <span>Display Name / Call Sign</span>
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Mike Tyson"
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition-all placeholder:text-slate-600 font-medium"
              />
            </div>

            {/* Specialty / Role */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-blue-400" />
                <span>Stream Role / Specialty</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {roles.map((r) => {
                  const isSelected = role === r.label;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRole(r.label)}
                      className={`text-left p-3 rounded-xl border text-xs transition-all relative ${
                        isSelected 
                          ? 'bg-blue-600/10 border-blue-500/40 text-white shadow-md' 
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2 p-0.5 bg-blue-500 rounded-full text-white">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}
                      <p className={`font-bold ${isSelected ? 'text-blue-400' : 'text-slate-300'}`}>{r.label}</p>
                      <p className="text-[10px] text-slate-500 mt-1 leading-tight">{r.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Primary Sport */}
            <div>
              <label htmlFor="primarySport" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>Primary Broadcast Sport</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {sports.map((sportItem) => {
                  const isSelected = favoriteSport === sportItem;
                  return (
                    <button
                      key={sportItem}
                      type="button"
                      onClick={() => setFavoriteSport(sportItem)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                        isSelected
                          ? 'bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-500/10'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400'
                      }`}
                    >
                      {sportItem}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Performance and Sound Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-800/80 pt-4 mt-1">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-blue-400" />
                  <span>Target Overlay FPS</span>
                </label>
                <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setFpsMode('30')}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                      fpsMode === '30'
                        ? 'bg-slate-800 text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-400'
                    }`}
                  >
                    30 FPS
                  </button>
                  <button
                    type="button"
                    onClick={() => setFpsMode('60')}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                      fpsMode === '60'
                        ? 'bg-slate-800 text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-400'
                    }`}
                  >
                    60 FPS
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Audio Feedback</span>
                </label>
                <button
                  type="button"
                  onClick={() => setAudioCues(!audioCues)}
                  className={`w-full flex items-center justify-between px-3 py-2 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl transition-all ${
                    audioCues ? 'text-white' : 'text-slate-500'
                  }`}
                >
                  <span className="text-xs font-bold">{audioCues ? 'Cues Enabled' : 'Muted'}</span>
                  <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${audioCues ? 'bg-blue-600' : 'bg-slate-800'}`}>
                    <div className={`w-3 h-3 rounded-full bg-white transition-transform ${audioCues ? 'translate-x-4' : 'translate-x-0'}`} />
                  </div>
                </button>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="flex gap-2 mt-3">
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold text-xs py-3 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={profileLoading}
                className="flex-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-slate-800 disabled:to-slate-800 text-white font-bold text-xs py-3 rounded-xl shadow-lg hover:shadow-blue-500/10 cursor-pointer disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {profileLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{onClose ? 'Save Changes' : 'Save Profile & Launch'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
