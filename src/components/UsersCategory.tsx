import React, { useState, useEffect } from 'react';
import { db, collection, getDocs, query, isMock } from '../lib/firebase.js';
import { UserProfile, useAuth } from '../contexts/AuthContext.js';
import { Users, Search, Shield, BadgeCheck, Cpu, Volume2, Sparkles, RefreshCw, AlertCircle, Calendar } from 'lucide-react';

interface OperatorUser extends UserProfile {
  id: string;
  email?: string;
  photoURL?: string;
}

export default function UsersCategory() {
  const { user, isMockAuth } = useAuth();
  const [operators, setOperators] = useState<OperatorUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!isMockAuth && db) {
        // Fetch from Firestore
        const q = query(collection(db, 'user_profiles'));
        const querySnapshot = await getDocs(q);
        const fetchedOperators: OperatorUser[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data() as UserProfile;
          fetchedOperators.push({
            id: doc.id,
            ...data,
          });
        });

        // Ensure current authenticated user is included/updated if they have no profile yet
        if (user && !fetchedOperators.some(o => o.id === user.uid)) {
          fetchedOperators.push({
            id: user.uid,
            displayName: user.displayName || 'Current Operator',
            role: 'Main Commentator',
            favoriteSport: 'Other / General',
            fpsMode: '60',
            audioCues: true,
            setupCompleted: true,
            photoURL: user.photoURL || undefined,
            email: user.email || undefined
          });
        }

        setOperators(fetchedOperators);
      } else {
        // Mock Mode: Generate beautiful simulated operators
        const mockOperators: OperatorUser[] = [
          {
            id: 'mock-user-123',
            displayName: user?.displayName || 'Guest Streamer',
            role: 'Overlay Designer',
            favoriteSport: 'Esports',
            fpsMode: '60',
            audioCues: true,
            setupCompleted: true,
            photoURL: user?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
            email: user?.email || 'developer@example.com'
          },
          {
            id: 'mock-user-456',
            displayName: 'Alex Carter',
            role: 'Main Commentator',
            favoriteSport: 'Football/Soccer',
            fpsMode: '60',
            audioCues: true,
            setupCompleted: true,
            photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
            email: 'alex.commentates@stream.tv'
          },
          {
            id: 'mock-user-789',
            displayName: 'Elena Rostova',
            role: 'Tournament Admin',
            favoriteSport: 'Basketball',
            fpsMode: '30',
            audioCues: false,
            setupCompleted: true,
            photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces',
            email: 'elena.ro@court.org'
          },
          {
            id: 'mock-user-101',
            displayName: 'Marcus Aurelius',
            role: 'Spectator / Guest',
            favoriteSport: 'Tennis',
            fpsMode: '60',
            audioCues: true,
            setupCompleted: true,
            photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces',
            email: 'marcus.emperor@broadcasting.com'
          }
        ];

        // Check if there are saved mock profiles in localStorage
        try {
          if (user) {
            const savedProfile = localStorage.getItem(`zraff_mock_profile_${user.uid}`);
            if (savedProfile) {
              const parsedProfile = JSON.parse(savedProfile);
              const index = mockOperators.findIndex(o => o.id === user.uid);
              if (index !== -1) {
                mockOperators[index] = { ...mockOperators[index], ...parsedProfile };
              }
            }
          }
        } catch (e) {
          console.error(e);
        }

        setOperators(mockOperators);
      }
    } catch (err: any) {
      console.error('Failed to load operators list:', err);
      setError(err?.message || 'Unauthorized or network error. Please ensure Firebase Rules are fully deployed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [user, isMockAuth]);

  const filteredOperators = operators.filter(op => {
    const q = searchQuery.toLowerCase();
    return (
      op.displayName.toLowerCase().includes(q) ||
      op.role.toLowerCase().includes(q) ||
      op.favoriteSport.toLowerCase().includes(q) ||
      (op.email && op.email.toLowerCase().includes(q))
    );
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl" id="users-directory-container">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 text-blue-400 border border-blue-500/15 rounded-2xl">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <span>Firebase Operators Directory</span>
              <span className="px-2 py-0.5 bg-blue-600/10 text-blue-400 text-[9px] font-mono rounded-full border border-blue-500/10">
                {isMockAuth ? 'Developer Dev Mode' : 'Production Firebase Auth'}
              </span>
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Verified broadcasters, overlay designers and commentators registered on Z-raff database.
            </p>
          </div>
        </div>

        <button
          onClick={fetchUsers}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs font-bold transition-all border border-slate-700 disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Directory</span>
        </button>
      </div>

      {/* Warning/Status Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex gap-3">
          <Shield className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-xs font-bold text-blue-200">Firebase Security Rules Verified</h3>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Operator profiles are secured so that users can only write to their own profile, but read permission is globally granted to verified console operators.
            </p>
          </div>
        </div>
        <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl flex gap-3">
          <BadgeCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-xs font-bold text-indigo-200">Current Operator Session</h3>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Logged in as <span className="text-slate-200 font-bold">{user?.email || 'Guest Operator'}</span>. Your specialty is configured to <span className="text-blue-400 font-bold">Main Commentator</span>.
            </p>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter operators by name, stream role, email, or primary sport..."
          className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-2xl pl-11 pr-4 py-3 text-xs text-white outline-none transition-all placeholder:text-slate-600 font-medium"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-xs text-rose-400 flex items-start gap-3 mb-6">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          <div>
            <span className="font-bold">Database Fetch Exception:</span>
            <p className="text-[11px] text-rose-300 mt-1 leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {/* Operator List / Cards Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Scanning Firestore user_profiles collection...</p>
        </div>
      ) : filteredOperators.length === 0 ? (
        <div className="text-center py-16 bg-slate-950/40 rounded-2xl border border-slate-850 border-dashed">
          <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-xs font-bold text-slate-300">No Operators Found</h3>
          <p className="text-[11px] text-slate-500 mt-1">Try adjusting your search criteria or verifying database records.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOperators.map((op) => {
            const isCurrentUser = op.id === user?.uid;
            return (
              <div 
                key={op.id} 
                className={`bg-slate-950/80 rounded-2xl border transition-all duration-300 p-5 relative overflow-hidden flex flex-col justify-between ${
                  isCurrentUser 
                    ? 'border-blue-500/30 bg-gradient-to-b from-blue-950/10 to-slate-950 shadow-md shadow-blue-500/5' 
                    : 'border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* Visual Accent */}
                {isCurrentUser && (
                  <div className="absolute top-0 right-0 px-3 py-1 bg-blue-600 text-white font-black text-[8px] uppercase tracking-widest rounded-bl-xl shadow">
                    Active Operator
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-3.5">
                    {op.photoURL ? (
                      <img 
                        src={op.photoURL} 
                        alt={op.displayName} 
                        className="w-11 h-11 rounded-full border border-slate-800 object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 text-white font-black text-sm flex items-center justify-center shadow">
                        {op.displayName[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                    
                    <div className="text-left leading-tight">
                      <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                        <span className="truncate max-w-[130px]">{op.displayName}</span>
                        {op.setupCompleted && <BadgeCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                      </h4>
                      {op.email && <p className="text-[9px] text-slate-500 font-mono truncate max-w-[130px] mt-0.5">{op.email}</p>}
                    </div>
                  </div>

                  {/* Profile Specs */}
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-900/60">
                    <div className="bg-slate-900/40 p-2.5 rounded-xl border border-slate-900">
                      <span className="text-[8px] uppercase font-black text-slate-500 tracking-wider block">Role / Specialty</span>
                      <span className="text-[10px] font-bold text-slate-300 mt-1 block truncate">{op.role || 'Unspecified'}</span>
                    </div>
                    <div className="bg-slate-900/40 p-2.5 rounded-xl border border-slate-900">
                      <span className="text-[8px] uppercase font-black text-slate-500 tracking-wider block">Favorite Sport</span>
                      <span className="text-[10px] font-bold text-slate-300 mt-1 block truncate">{op.favoriteSport || 'Unspecified'}</span>
                    </div>
                  </div>
                </div>

                {/* Status Bar */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-900/60 text-[9px] text-slate-500">
                  <div className="flex items-center gap-1">
                    <Cpu className="w-3 h-3 text-slate-400" />
                    <span>Overlay FPS: <strong className="text-slate-300">{op.fpsMode || '60'} FPS</strong></span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Volume2 className="w-3 h-3 text-slate-400" />
                    <span>Audio: <strong className="text-slate-300">{op.audioCues !== false ? 'On' : 'Off'}</strong></span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
