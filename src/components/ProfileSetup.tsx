import React, { useState, useRef } from 'react';
import { useAuth, UserProfile } from '../contexts/AuthContext.js';
import { 
  User, Trophy, Sparkles, Cpu, Volume2, Check, ArrowRight, Camera, 
  KeyRound, Calendar, Laptop, ShieldCheck, Mail, Phone, Upload, UserCheck
} from 'lucide-react';
import { motion } from 'motion/react';

interface ProfileSetupProps {
  onClose?: () => void;
}

export default function ProfileSetup({ onClose }: ProfileSetupProps) {
  const { user, userProfile, saveProfile, uploadProfilePhoto, profileLoading, logout, isMockAuth } = useAuth();
  
  // Field States
  const [firstName, setFirstName] = useState(userProfile?.firstName || user?.displayName?.split(' ')[0] || '');
  const [lastName, setLastName] = useState(userProfile?.lastName || user?.displayName?.split(' ')[1] || '');
  const [username, setUsername] = useState(userProfile?.username || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  
  // Security Update State
  const [newPassword, setNewPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<string | null>(null);

  // Preference States
  const [role, setRole] = useState(userProfile?.role || 'Operator');
  const [favoriteSport, setFavoriteSport] = useState(userProfile?.favoriteSport || 'Football/Soccer');
  const [fpsMode, setFpsMode] = useState<'30' | '60'>(userProfile?.fpsMode || '60');
  const [audioCues, setAudioCues] = useState(userProfile?.audioCues ?? true);
  
  // Status States
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // File Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sports = [
    'Football/Soccer',
    'Basketball',
    'Tennis',
    'Esports',
    'Other / General',
  ];

  // Drag & Drop Handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleUploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await handleUploadFile(e.target.files[0]);
    }
  };

  const handleUploadFile = async (file: File) => {
    // Validate image type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }
    // Limit to 4MB
    if (file.size > 4 * 1024 * 1024) {
      setError('Profile picture file size must not exceed 4MB.');
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const url = await uploadProfilePhoto(file);
      setSuccess('Profile picture updated successfully!');
      console.log('Avatar uploaded:', url);
    } catch (err: any) {
      setError(err?.message || 'Failed to upload profile picture.');
    } finally {
      setUploading(false);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setPasswordStatus(null);

    if (!firstName.trim() || !lastName.trim()) {
      setError('Please provide your first name and last name.');
      return;
    }

    if (!username.trim()) {
      setError('Please provide a unique username.');
      return;
    }

    try {
      // 1. Save standard profile fields to Firestore
      await saveProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        username: username.trim(),
        phone: phone.trim(),
        role,
        favoriteSport,
        fpsMode,
        audioCues,
      });

      // 2. Handle Password update if filled out
      if (newPassword.trim()) {
        if (newPassword.length < 6) {
          throw new Error('Your new security password must be at least 6 characters.');
        }

        if (!isMockAuth && user) {
          await user.updatePassword(newPassword);
        }
        setPasswordStatus('Security password updated successfully!');
        setNewPassword('');
      }

      setSuccess('Broadcaster profile changes saved successfully.');
    } catch (err: any) {
      setError(err?.message || 'Failed to save profile. Please re-authenticate and try again.');
    }
  };

  return (
    <div className={`${onClose ? 'fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 overflow-y-auto' : 'min-h-screen bg-slate-950'} text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8`} id="profile-setup-container">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row my-4">
        
        {/* Left Side Panel: Read-only Profile Details & Quick Actions */}
        <div className="md:w-5/12 bg-gradient-to-b from-blue-900/90 to-slate-950 p-6 md:p-8 flex flex-col justify-between text-white relative border-r border-slate-800 shrink-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.1),transparent)]" />
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-blue-300 border border-white/5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Broadcaster Node</span>
            </div>
            
            <h2 className="text-xl font-black tracking-tight mt-5 leading-tight uppercase">
              Operator Account
            </h2>
            <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
              Real-time workspace options, stream roles, custom audio telemetry indicators, and credentials.
            </p>

            {/* Read-Only Stats Info Card */}
            <div className="mt-6 flex flex-col gap-3 bg-slate-950/40 border border-white/5 p-4 rounded-2xl text-[10px] font-mono text-slate-300">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="truncate" title={userProfile?.email || user?.email}>Email: <strong className="text-white">{userProfile?.email || user?.email}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>Joined: <strong className="text-white">{userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : 'N/A'}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Laptop className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">Node IP/OS: <strong className="text-white">{userProfile?.os || 'N/A'}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>Verification: <strong className="text-emerald-400">{userProfile?.emailVerified ? 'VERIFIED' : 'PENDING'}</strong></span>
              </div>
            </div>
          </div>

          {/* User Signout footer */}
          <div className="relative z-10 mt-10 md:mt-0 pt-4 border-t border-slate-900">
            <div className="flex items-center gap-3">
              {userProfile?.photoURL ? (
                <img 
                  src={userProfile.photoURL} 
                  alt={userProfile.firstName} 
                  className="w-10 h-10 rounded-full border border-white/10 object-cover" 
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-indigo-500 text-white font-black text-sm flex items-center justify-center">
                  {userProfile?.firstName?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
              <div className="text-left leading-tight">
                <p className="text-xs font-black truncate max-w-[130px]">{userProfile?.firstName} {userProfile?.lastName}</p>
                <p className="text-[10px] text-slate-400 truncate max-w-[130px]">@{userProfile?.username || 'broadcaster'}</p>
              </div>
            </div>
            
            <button 
              onClick={logout}
              className="mt-4 text-[10px] text-slate-400 hover:text-white transition-colors underline underline-offset-4 font-mono font-bold block"
            >
              Sign out of this operator node
            </button>
          </div>
        </div>

        {/* Right Side Panel: Edit Profile Forms */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto max-h-[85vh]">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            
            {/* Status indicators */}
            {error && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 flex items-start gap-2.5">
                <span className="font-bold shrink-0">Exception:</span>
                <p className="text-[11px] text-rose-300 leading-normal">{error}</p>
              </div>
            )}
            {success && (
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <p className="text-[11px] text-emerald-300 leading-normal">{success}</p>
              </div>
            )}

            {/* Profile Avatar drag & drop */}
            <div>
              <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-blue-400" />
                <span>Broadcaster Profile Avatar</span>
              </span>
              
              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={triggerFileSelect}
                className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all flex flex-col sm:flex-row items-center justify-center gap-4 ${
                  dragActive 
                    ? 'border-blue-500 bg-blue-500/5' 
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-950/90'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />

                <div className="relative">
                  {userProfile?.photoURL ? (
                    <img 
                      src={userProfile.photoURL} 
                      alt="Avatar" 
                      className="w-16 h-16 rounded-full border border-slate-800 object-cover" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center font-black text-lg">
                      {firstName?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                <div className="text-left leading-normal">
                  <div className="flex items-center gap-1 text-xs font-bold text-white">
                    <Upload className="w-3.5 h-3.5 text-blue-400" />
                    <span>Click or Drag photo to update avatar</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">JPEG, PNG or GIF up to 4MB sizes. Syncs with Storage.</p>
                </div>
              </div>
            </div>

            {/* Names row */}
            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition-all font-medium"
                />
              </div>
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition-all font-medium"
                />
              </div>
            </div>

            {/* Username & Phone Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Broadcaster Handle</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[11px] font-mono font-bold text-slate-500">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="broadcaster_jdoe"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl pl-8 pr-3.5 py-2.5 text-xs text-white outline-none font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Contact Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 019-2834"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl pl-9.5 pr-3.5 py-2.5 text-xs text-white outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Secure Password Update Section */}
            <div className="border-t border-slate-800/80 pt-4 mt-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-blue-400" />
                <span>Update Node Security Password</span>
              </label>
              
              <div className="relative">
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new security password (leave empty to keep unchanged)"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition-all placeholder:text-slate-600 font-medium"
                />
              </div>
              {passwordStatus && (
                <p className="text-[10px] text-emerald-400 mt-1.5 font-bold font-sans">✓ {passwordStatus}</p>
              )}
            </div>

            {/* Favorite Sport */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-blue-400" />
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-800/80 pt-4">
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
            <div className="flex gap-2.5 mt-4 pt-4 border-t border-slate-800/80">
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold text-xs py-3.5 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={profileLoading}
                className="flex-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-slate-800 disabled:to-slate-800 text-white font-bold text-xs py-3.5 rounded-xl shadow-lg hover:shadow-blue-500/10 cursor-pointer disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {profileLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>Save Broadcast Configuration</span>
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
