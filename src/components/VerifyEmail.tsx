import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.js';
import { Mail, CheckCircle2, ShieldCheck, ArrowRight, RotateCw, LogOut, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface VerifyEmailProps {
  onVerifiedSuccess: () => void;
}

export default function VerifyEmail({ onVerifiedSuccess }: VerifyEmailProps) {
  const { user, verifyEmail, checkEmailVerified, logout, isMockAuth } = useAuth();
  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [checkStatus, setCheckStatus] = useState<string | null>(null);

  // Poll for verification in real mode, or just let them verify manually
  useEffect(() => {
    if (isMockAuth) return;

    const interval = setInterval(async () => {
      try {
        const isVerified = await checkEmailVerified();
        if (isVerified) {
          clearInterval(interval);
          onVerifiedSuccess();
        }
      } catch (e) {
        console.error('Polling error:', e);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isMockAuth]);

  const handleResend = async () => {
    setResending(true);
    setResendStatus(null);
    try {
      await verifyEmail();
      setResendStatus('A fresh verification link has been dispatched to your inbox.');
    } catch (err: any) {
      setResendStatus(err?.message || 'Failed to dispatch verification email.');
    } finally {
      setResending(false);
    }
  };

  const handleCheckNow = async () => {
    setChecking(true);
    setCheckStatus(null);
    try {
      const isVerified = await checkEmailVerified();
      if (isVerified) {
        onVerifiedSuccess();
      } else {
        setCheckStatus('No verification detected yet. Please click the link in your email.');
      }
    } catch (err: any) {
      setCheckStatus(err?.message || 'Verification check failed.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 relative">
      {/* Ambient background details */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(59,130,246,0.06),transparent_50%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md z-10"
      >
        {/* Verification Card */}
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-3xl p-8 shadow-2xl shadow-black/50 text-center">
          
          <div className="inline-flex p-3.5 bg-blue-500/10 text-blue-400 border border-blue-500/15 rounded-2xl shadow-xl shadow-blue-500/5 mb-5 relative">
            <Mail className="w-8 h-8 animate-pulse" />
            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-indigo-500 rounded-full border-2 border-slate-900" />
          </div>

          <h2 className="text-lg font-black text-white uppercase tracking-wider mb-2">
            Confirm Your Email
          </h2>
          
          <p className="text-xs text-slate-300 leading-relaxed mb-6">
            We've dispatched an activation link to <br />
            <strong className="text-blue-400 font-mono text-[11px] select-all">{user?.email || 'your-email@stream.tv'}</strong>. <br />
            Please click the link in that email to authorize this console session.
          </p>

          {/* Feedback Messages */}
          {resendStatus && (
            <div className="mb-5 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-[11px] text-blue-300 text-left">
              {resendStatus}
            </div>
          )}

          {checkStatus && (
            <div className="mb-5 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-300 text-left">
              {checkStatus}
            </div>
          )}

          {/* Action List */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleCheckNow}
              disabled={checking}
              className="w-full py-3 px-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-[0.98]"
            >
              {checking ? (
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ShieldCheck className="w-3.5 h-3.5" />
              )}
              <span>{checking ? 'Checking Status...' : "I've Verified My Email"}</span>
            </button>

            <button
              onClick={handleResend}
              disabled={resending}
              className="w-full py-3 px-5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-750 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {resending ? (
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RotateCw className="w-3.5 h-3.5" />
              )}
              <span>{resending ? 'Resending Link...' : 'Resend Verification Email'}</span>
            </button>
          </div>

          {/* Special Dev-mode Bypass Badge */}
          {isMockAuth && (
            <div className="mt-6 bg-slate-950/60 rounded-xl p-4 border border-slate-850">
              <div className="flex items-center justify-center gap-1.5 text-emerald-400 font-bold text-[10px] uppercase tracking-wider mb-1.5">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                <span>Simulate Verification</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-normal mb-3">
                Since you are running in Dev Sandbox, real email triggers are bypassed. You can instantly simulate verification below.
              </p>
              <button
                onClick={handleCheckNow}
                className="w-full py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verify Instantly (Bypass)</span>
              </button>
            </div>
          )}

          {/* Footer logout to back off */}
          <button
            onClick={logout}
            className="mt-6 text-[10px] font-bold text-slate-500 hover:text-rose-400 transition-colors inline-flex items-center gap-1.5 bg-transparent border-0 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cancel & Return to Login</span>
          </button>

        </div>
      </motion.div>
    </div>
  );
}
