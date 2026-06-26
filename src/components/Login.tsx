import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.js';
import { Tv, ShieldAlert, LogIn, Lock, Mail, Eye, EyeOff, Sparkles, HelpCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginProps {
  onGoToRegister: () => void;
  onGoToVerify: () => void;
}

export default function Login({ onGoToRegister, onGoToVerify }: LoginProps) {
  const { loginUser, resetPassword, isMockAuth } = useAuth();
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Forgot Password State
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  const isIframe = typeof window !== 'undefined' && window.self !== window.top;

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please provide both email and password.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please provide a valid email format.');
      return;
    }

    setIsLoggingIn(true);
    try {
      const loggedUser = await loginUser(email.trim().toLowerCase(), password, rememberMe);
      
      // If mock user or successfully logged in, redirect based on verification status
      if (loggedUser) {
        if (!loggedUser.emailVerified && !isMockAuth) {
          onGoToVerify();
        }
      }
    } catch (err: any) {
      console.error('Credentials sign-in error:', err);
      setError(err?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResetSuccess(null);

    if (!resetEmail.trim()) {
      setError('Please provide your email address.');
      return;
    }

    setIsResetting(true);
    try {
      await resetPassword(resetEmail.trim().toLowerCase());
      setResetSuccess('An overlay reset link has been dispatched to your email address.');
    } catch (err: any) {
      setError(err?.message || 'Failed to dispatch reset link. Please verify your email.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Visual background details */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.08),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(99,102,241,0.04),transparent_50%)]" />
      
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
          
          {/* FORGOT PASSWORD VIEW */}
          {isForgotPassword ? (
            <div>
              <button
                onClick={() => {
                  setIsForgotPassword(false);
                  setError(null);
                  setResetSuccess(null);
                }}
                className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-white mb-6 bg-slate-950/40 hover:bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800/40 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Return to Login</span>
              </button>

              <h2 className="text-sm font-black text-white uppercase tracking-wider mb-2">
                Restore Account Access
              </h2>
              <p className="text-xs text-slate-400 mb-6">
                Enter your registered broadcaster email to receive a secure recovery password reset link.
              </p>

              {error && (
                <div className="mb-6 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {resetSuccess && (
                <div className="mb-6 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                  <span>{resetSuccess}</span>
                </div>
              )}

              <form onSubmit={handleForgotPasswordSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Broadcaster Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="operator@stream.com"
                      className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl pl-9.5 pr-3 py-2.5 text-xs text-white outline-none transition-all placeholder:text-slate-700"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isResetting}
                  className="w-full py-3 px-5 bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-[0.98]"
                >
                  {isResetting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  <span>{isResetting ? 'Dispatching...' : 'Dispatch Reset Link'}</span>
                </button>
              </form>
            </div>
          ) : (
            
            /* STANDARD CREDENTIALS LOGIN VIEW */
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-wider mb-2">
                Broadcaster Gateway
              </h2>
              <p className="text-xs text-slate-400 mb-6">
                Authentication is required to view and modify overlay configurations. Please sign in to proceed.
              </p>

              {error && (
                <div className="mb-6 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleCredentialsLogin} className="flex flex-col gap-4">
                {/* Email Address */}
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="operator@stream.com"
                      className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl pl-9.5 pr-3 py-2.5 text-xs text-white outline-none transition-all placeholder:text-slate-700"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Password</label>
                    <button
                      type="button"
                      onClick={() => setIsForgotPassword(true)}
                      className="text-[9px] font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-wider cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl pl-9.5 pr-10 py-2.5 text-xs text-white outline-none transition-all placeholder:text-slate-700"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-white transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Remember me row */}
                <div className="flex items-center gap-2 my-1">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 accent-blue-600 bg-slate-950 border-slate-850 rounded focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="rememberMe" className="text-[10px] font-bold text-slate-400 cursor-pointer select-none">
                    Remember me on this operator node
                  </label>
                </div>

                {/* Login buttons row */}
                <div className="grid grid-cols-2 gap-3 mt-1.5">
                  <button
                    type="button"
                    onClick={onGoToRegister}
                    className="w-full py-3 bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-750 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Create Account</span>
                  </button>
                  
                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-[0.98]"
                  >
                    {isLoggingIn ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <LogIn className="w-3.5 h-3.5" />
                    )}
                    <span>{isLoggingIn ? 'Logging in...' : 'Sign In'}</span>
                  </button>
                </div>
              </form>

              {/* Dev Sandbox Guide */}
              {isMockAuth && (
                <div className="mt-6 bg-slate-950/60 rounded-xl p-4 border border-slate-850">
                  <div className="flex items-center gap-2 text-blue-400 font-bold text-[10px] uppercase tracking-wider mb-1 flex-wrap">
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                    <span>Dev Sandbox Active</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal font-medium mb-2.5">
                    For quick review in this environment, bypass credentials or use these mock operators:
                  </p>
                  <div className="flex flex-col gap-1.5 font-mono text-[9px] text-slate-400">
                    <button
                      onClick={() => {
                        setEmail('admin@stream.com');
                        setPassword('pass123');
                      }}
                      className="text-left bg-slate-900 hover:bg-slate-850 p-2 rounded border border-slate-850 text-[10px] transition-colors flex justify-between cursor-pointer"
                    >
                      <span>🔑 Admin: admin@stream.com</span>
                      <span className="text-blue-400 text-[9px] font-sans font-extrabold uppercase">AUTOFILL</span>
                    </button>
                    <button
                      onClick={() => {
                        setEmail('alex@stream.com');
                        setPassword('pass123');
                      }}
                      className="text-left bg-slate-900 hover:bg-slate-850 p-2 rounded border border-slate-850 text-[10px] transition-colors flex justify-between cursor-pointer"
                    >
                      <span>🔑 Operator: alex@stream.com</span>
                      <span className="text-blue-400 text-[9px] font-sans font-extrabold uppercase">AUTOFILL</span>
                    </button>
                  </div>
                </div>
              )}
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
