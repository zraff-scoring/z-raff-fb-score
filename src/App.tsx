import React, { useEffect, useState } from 'react';
import ControlPanel from './components/ControlPanel.js';
import GraphicsOutput from './components/GraphicsOutput.js';
import { AuthProvider } from './contexts/AuthContext.js';
import { Lock, Eye, EyeOff, ShieldAlert, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';

function PasswordGate({ onUnlock }: { onUnlock: () => void }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'Arabi45#') {
      setSuccess(true);
      setError('');
      setTimeout(() => {
        onUnlock();
      }, 800);
    } else {
      setError('Access Denied. Incorrect security password.');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Decorative ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-8 relative z-10 shadow-2xl"
      >
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-14 h-14 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center justify-center mb-4 shadow-inner relative group">
            <div className="absolute inset-0 bg-blue-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            {success ? (
              <CheckCircle className="w-6 h-6 text-emerald-400 animate-pulse" />
            ) : (
              <Lock className="w-6 h-6 text-blue-400 group-hover:scale-110 transition-transform" />
            )}
          </div>
          
          <h1 className="text-xl font-bold tracking-tight text-white mb-1">
            Interface Locked
          </h1>
          <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-xs">
            This workspace is locked. Please enter the master system key to gain authorization.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Enter Access Password"
                className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 hover:border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 text-white rounded-xl text-xs font-medium placeholder-slate-600 transition-all outline-none"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-[11px] text-red-400 font-medium leading-relaxed"
            >
              <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </motion.div>
          )}

          <button
            type="submit"
            disabled={success || !password}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] cursor-pointer disabled:opacity-50"
          >
            {success ? 'Decryption Successful...' : 'Unlock Console'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

function AppContent() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [isUnlocked, setIsUnlocked] = useState(() => {
    return localStorage.getItem('zraff_app_unlocked') === 'true';
  });

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  // OBS Overlay output is publicly accessible without login requirements
  if (currentPath.includes('/output')) {
    return <GraphicsOutput />;
  }

  // If not unlocked, enforce the password gate screen
  if (!isUnlocked) {
    return (
      <PasswordGate 
        onUnlock={() => {
          localStorage.setItem('zraff_app_unlocked', 'true');
          setIsUnlocked(true);
        }} 
      />
    );
  }

  // Fully enter workspace directly
  return (
    <ControlPanel 
      onLock={() => {
        localStorage.removeItem('zraff_app_unlocked');
        setIsUnlocked(false);
      }} 
    />
  );
}

export default function App() {
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      if (reason) {
        const msg = String(reason.message || reason);
        if (
          msg.includes('WebSocket') || 
          msg.includes('websocket') || 
          msg.includes('ws:') || 
          msg.includes('closed without opened')
        ) {
          event.preventDefault();
        }
      }
    };

    const handleGlobalError = (event: ErrorEvent) => {
      const msg = String(event.message || event.error);
      if (
        msg.includes('WebSocket') || 
        msg.includes('websocket') || 
        msg.includes('ws:') || 
        msg.includes('closed without opened')
      ) {
        event.preventDefault();
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleGlobalError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleGlobalError);
    };
  }, []);

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
