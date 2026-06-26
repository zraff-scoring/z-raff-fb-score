import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.js';
import { Tv, ShieldAlert, LogIn, Sparkles, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function Login() {
  const { loginWithGoogle, isMockAuth } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const isIframe = typeof window !== 'undefined' && window.self !== window.top;

  const handleSignIn = async () => {
    setError(null);
    setIsSigningIn(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.error('Sign-in error details:', err);
      if (isIframe) {
        setError(
          'Google Sign-In is blocked inside this iframe preview. Please click the "Open in New Tab" button below or in the top-right corner to authenticate.'
        );
      } else {
        setError(err?.message || 'Failed to sign in with Google. Please try again.');
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Visual background details */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.08),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(16,185,129,0.04),transparent_50%)]" />
      
      {/* Decorative Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md z-10"
      >
        {/* Logo Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-gradient-to-br from-blue-600/20 to-blue-500/10 border border-blue-500/20 text-blue-400 rounded-2xl shadow-xl shadow-blue-500/5 mb-4">
            <Tv className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-white uppercase tracking-wider">
            Z-Raff Overlay System
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Live Stream Graphics & Scoreboard Controller
          </p>
        </div>

        {/* Authentication Card */}
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-3xl p-8 shadow-2xl shadow-black/40">
          <h2 className="text-sm font-black text-white uppercase tracking-wider mb-2">
            Broadcaster Gateway
          </h2>
          <p className="text-xs text-slate-400 mb-6">
            Authentication is required to view and modify overlay configurations. Please sign in to proceed.
          </p>

          {isIframe && !isMockAuth && (
            <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-400 flex flex-col gap-2">
              <div className="flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="font-bold">Iframe Preview Restricted</span>
              </div>
              <p className="text-[10px] text-slate-300 leading-relaxed pl-6.5">
                Modern browser security policies block Google Auth popups inside iframe previews. Please click below to open the application in a new tab where sign-in will work perfectly.
              </p>
              <a
                href={window.location.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 self-start inline-flex items-center gap-1.5 text-[10px] bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 px-3.5 py-1.5 rounded-lg font-bold transition-colors ml-6.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Open in New Tab & Sign In</span>
              </a>
            </div>
          )}

          {error && (
            <div className="mb-6 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Sign In Button */}
          <button
            onClick={handleSignIn}
            disabled={isSigningIn}
            className="w-full py-3.5 px-5 bg-white hover:bg-slate-100 text-slate-950 disabled:opacity-50 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-3 cursor-pointer shadow-lg active:scale-[0.98]"
          >
            {isSigningIn ? (
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                <g transform="matrix(1, 0, 0, 1, 0, 0)">
                  <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.56h3.3c1.93,-1.78 3.04,-4.4 3.04,-7.53c0,-0.61 -0.06,-1.2 -0.16,-1.73z" fill="#4285F4" />
                  <path d="M12,20.6c2.43,0 4.47,-0.8 5.96,-2.18l-3.3,-2.56c-0.91,0.61 -2.08,0.98 -3.3,0.98c-2.34,0 -4.33,-1.58 -5.04,-3.71H2.94v2.65c1.48,2.94 4.51,4.94 8.02,4.94z" fill="#34A853" />
                  <path d="M6.96,13.13C6.78,12.59 6.78,12.01 6.96,11.47V8.82H2.94c-0.62,1.23 -0.98,2.62 -0.98,4.08s0.36,2.85 0.98,4.08l4.02,-3.13z" fill="#FBBC05" />
                  <path d="M12,6.12c1.32,0 2.51,0.45 3.44,1.35l2.58,-2.58C16.46,3.45 14.43,2.6 12,2.6c-3.51,0 -6.54,2 -8.02,4.94l4.02,3.13c0.71,-2.13 2.7,-3.71 5.04,-3.71z" fill="#EA4335" />
                </g>
              </svg>
            )}
            <span>{isSigningIn ? 'Connecting...' : 'Sign in with Google'}</span>
          </button>

          {/* Sandbox Info Notice */}
          {isMockAuth && (
            <div className="mt-8 bg-slate-950/60 rounded-xl p-4 border border-slate-800/60">
              <div className="flex items-center gap-2 text-blue-400 font-bold text-[10px] uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                <span>Sandbox Mode Enabled</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                The platform's Firebase project is currently in the setup phase. Real Google Authentication will be automatically activated as soon as terms are accepted in the UI.
              </p>
              <div className="mt-2.5 text-[9px] text-emerald-400 font-mono font-bold">
                ✓ Click "Sign in with Google" to bypass and login immediately with a simulated profile!
              </div>
            </div>
          )}
        </div>

        {/* Humble Footer info */}
        <div className="text-center mt-6 text-[10px] text-slate-500 font-medium flex items-center justify-center gap-1">
          <HelpCircle className="w-3 h-3" />
          <span>Need help? Real-time sync keys are preserved in local storage.</span>
        </div>
      </motion.div>
    </div>
  );
}
