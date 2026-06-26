import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.js';
import { Tv, ShieldAlert, Sparkles, User, Mail, Phone, Lock, Eye, EyeOff, Check, AlertCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

interface RegistrationProps {
  onBackToLogin: () => void;
  onGoToVerify: () => void;
}

export default function Registration({ onBackToLogin, onGoToVerify }: RegistrationProps) {
  const { registerUser, signInWithGoogle, isMockAuth } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleSignUp = async () => {
    setError(null);
    setIsGoogleLoading(true);
    try {
      const loggedUser = await signInWithGoogle();
      if (loggedUser) {
        if (!loggedUser.emailVerified && !isMockAuth) {
          onGoToVerify();
        }
      }
    } catch (err: any) {
      console.error('Google sign-up error:', err);
      setError(err?.message || 'Google Authentication failed. Please try again.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Strength Checkers
  const getPasswordCriteria = () => {
    const pass = formData.password;
    return {
      length: pass.length >= 6,
      hasUpper: /[A-Z]/.test(pass),
      hasLower: /[a-z]/.test(pass),
      hasNumberOrSpecial: /[\d!@#$%^&*()_+={}[\]:;"'<>,.?/~`|-]/.test(pass)
    };
  };

  const isPasswordStrong = () => {
    const criteria = getPasswordCriteria();
    return criteria.length && criteria.hasUpper && criteria.hasLower && criteria.hasNumberOrSpecial;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 1. Validate required fields
    if (
      !formData.firstName.trim() ||
      !formData.lastName.trim() ||
      !formData.username.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim() ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError('All fields are required. Please fill in the complete form.');
      return;
    }

    // 2. Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }

    // 3. Validate Username format
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(formData.username)) {
      setError('Username must be 3-20 characters and contain only letters, numbers, or underscores.');
      return;
    }

    // 4. Validate password strength
    if (!isPasswordStrong()) {
      setError('Your password is too weak. Please fulfill all security criteria.');
      return;
    }

    // 5. Validate Password match
    if (formData.password !== formData.confirmPassword) {
      setError('Password and Confirm Password do not match.');
      return;
    }

    setLoading(true);
    try {
      await registerUser({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        username: formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        password: formData.password
      });

      // Redirect to Email Verify screen
      onGoToVerify();
    } catch (err: any) {
      console.error('Registration failed:', err);
      setError(err?.message || 'An error occurred during registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const passwordCriteria = getPasswordCriteria();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-y-auto">
      {/* Background radial overlays */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.06),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(99,102,241,0.04),transparent_50%)]" />
      
      {/* Decorative Matrix Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-lg z-10 my-8"
      >
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-gradient-to-br from-blue-600/20 to-indigo-500/10 border border-blue-500/20 text-blue-400 rounded-2xl shadow-xl shadow-blue-500/5 mb-3">
            <Tv className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-black text-white uppercase tracking-wider">
            Broadcaster Registration
          </h1>
          <p className="text-[11px] text-slate-400 mt-1">
            Create an Operator profile to manage live football broadcast streams
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/50">
          
          <button
            onClick={onBackToLogin}
            className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-400 hover:text-white mb-6 bg-slate-950/40 hover:bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800/40 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Gateway</span>
          </button>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            {/* First & Last Name row */}
            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">First Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="John"
                    className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl pl-9.5 pr-3 py-2.5 text-xs text-white outline-none transition-all placeholder:text-slate-700"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Last Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Doe"
                    className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl pl-9.5 pr-3 py-2.5 text-xs text-white outline-none transition-all placeholder:text-slate-700"
                  />
                </div>
              </div>
            </div>

            {/* Username Field */}
            <div>
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Desired Username</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[11px] font-mono font-bold text-slate-500">@</span>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="operator_jdoe"
                  className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl pl-8 pr-3 py-2.5 text-xs text-white outline-none transition-all placeholder:text-slate-700 font-mono"
                />
              </div>
              <p className="text-[9px] text-slate-500 mt-1 leading-normal pl-1">Contains only lowercase letters, numbers or underscores.</p>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="jdoe@broadcast.tv"
                  className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl pl-9.5 pr-3 py-2.5 text-xs text-white outline-none transition-all placeholder:text-slate-700"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 019-2834"
                  className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl pl-9.5 pr-3 py-2.5 text-xs text-white outline-none transition-all placeholder:text-slate-700 font-mono"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Security Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
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

              {/* Password Strength Checklist */}
              {formData.password.length > 0 && (
                <div className="mt-2.5 p-3 bg-slate-950/60 rounded-xl border border-slate-850 flex flex-col gap-1.5">
                  <div className="text-[9px] font-black uppercase text-slate-400 tracking-wider flex items-center justify-between">
                    <span>Password Strength:</span>
                    <span className={isPasswordStrong() ? 'text-emerald-400' : 'text-amber-400'}>
                      {isPasswordStrong() ? 'SECURE' : 'WEAK'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[9px] mt-1">
                    <div className="flex items-center gap-1.5">
                      <div className={`p-0.5 rounded-full ${passwordCriteria.length ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-600'}`}>
                        <Check className="w-2 h-2" />
                      </div>
                      <span className={passwordCriteria.length ? 'text-slate-300' : 'text-slate-600'}>6+ characters</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className={`p-0.5 rounded-full ${passwordCriteria.hasUpper ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-600'}`}>
                        <Check className="w-2 h-2" />
                      </div>
                      <span className={passwordCriteria.hasUpper ? 'text-slate-300' : 'text-slate-600'}>Uppercase letter</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className={`p-0.5 rounded-full ${passwordCriteria.hasLower ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-600'}`}>
                        <Check className="w-2 h-2" />
                      </div>
                      <span className={passwordCriteria.hasLower ? 'text-slate-300' : 'text-slate-600'}>Lowercase letter</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className={`p-0.5 rounded-full ${passwordCriteria.hasNumberOrSpecial ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-600'}`}>
                        <Check className="w-2 h-2" />
                      </div>
                      <span className={passwordCriteria.hasNumberOrSpecial ? 'text-slate-300' : 'text-slate-600'}>Number/Symbol</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl pl-9.5 pr-10 py-2.5 text-xs text-white outline-none transition-all placeholder:text-slate-700"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-white transition-colors cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Register Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white disabled:opacity-50 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-lg active:scale-[0.98]"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span>{loading ? 'Creating Account...' : 'Complete Register'}</span>
            </button>

            <div className="relative flex py-4 items-center">
              <div className="flex-grow border-t border-slate-800"></div>
              <span className="flex-shrink mx-4 text-[9px] text-slate-500 font-bold uppercase tracking-wider">or continue with</span>
              <div className="flex-grow border-t border-slate-800"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignUp}
              disabled={loading || isGoogleLoading}
              className="w-full py-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-lg active:scale-[0.98] disabled:opacity-50"
            >
              {isGoogleLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" width="16" height="16">
                  <path
                    fill="#EA4335"
                    d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.33 0 3.321 2.673 1.391 6.573L5.266 9.765z"
                  />
                  <path
                    fill="#4285F4"
                    d="M24 12.273c0-.818-.082-1.636-.218-2.427H12v4.61h6.736A5.762 5.762 0 0 1 16.2 18.255l3.855 2.99C22.31 19.1 24 15.918 24 12.273z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.266 14.235L1.39 17.427A11.961 11.961 0 0 1 0 12c0-1.927.455-3.755 1.264-5.382l3.963 3.091a7.09 7.09 0 0 0 0 4.526z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.245 0 5.973-1.073 7.964-2.927l-3.855-2.99a7.314 7.314 0 0 1-4.11 1.145c-3.154 0-5.836-2.118-6.79-4.99L1.31 17.31C3.218 21.145 7.273 24 12 24z"
                  />
                </svg>
              )}
              <span>{isGoogleLoading ? 'Connecting...' : 'Sign up with Google'}</span>
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
