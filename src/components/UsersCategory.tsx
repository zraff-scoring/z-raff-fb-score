import React, { useState, useEffect } from 'react';
import { useAuth, UserProfile, AdminStats } from '../contexts/AuthContext.js';
import { 
  Users, Search, ShieldAlert, BadgeCheck, Cpu, Volume2, Sparkles, RefreshCw, 
  Trash2, Edit, CheckCircle2, XCircle, Eye, Shield, Filter, ArrowDownAZ, 
  ArrowUpZA, Calendar, Laptop, HelpCircle, Phone, Mail, UserPlus, ToggleLeft, ToggleRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function UsersCategory() {
  const { user, isAdmin, getAllUsers, adminUpdateUser, adminDeleteUser, getAdminStats } = useAuth();
  
  // Data States
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [verifyFilter, setVerifyFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date_desc');

  // Modal / Detail States
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  // Form Edit States
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    username: '',
    phone: '',
    role: 'Operator' as 'Administrator' | 'Operator' | 'Commentator' | 'Viewer',
    status: 'active' as 'active' | 'disabled'
  });

  const fetchData = async () => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const users = await getAllUsers();
      setUsersList(users);
      const computedStats = await getAdminStats();
      setStats(computedStats);
    } catch (err: any) {
      console.error('Failed to load administrative user database:', err);
      setError(err?.message || 'Unauthorized database fetch error. Verify Firestore rules.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isAdmin]);

  // Handle Edit Actions
  const handleStartEdit = (op: UserProfile) => {
    setEditingUser(op);
    setEditForm({
      firstName: op.firstName || '',
      lastName: op.lastName || '',
      username: op.username || '',
      phone: op.phone || '',
      role: op.role || 'Operator',
      status: op.status || 'active'
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    
    setActionLoading(editingUser.uid);
    try {
      await adminUpdateUser(editingUser.uid, {
        firstName: editForm.firstName.trim(),
        lastName: editForm.lastName.trim(),
        username: editForm.username.trim(),
        phone: editForm.phone.trim(),
        role: editForm.role,
        status: editForm.status
      });
      setEditingUser(null);
      await fetchData();
    } catch (err: any) {
      alert(err?.message || 'Failed to update broadcaster.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleStatus = async (op: UserProfile) => {
    if (op.uid === user?.uid) {
      alert('You cannot disable your own active administrative session.');
      return;
    }
    setActionLoading(op.uid);
    const newStatus = op.status === 'active' ? 'disabled' : 'active';
    try {
      await adminUpdateUser(op.uid, { status: newStatus as any });
      await fetchData();
    } catch (err: any) {
      alert(err?.message || 'Failed to modify account status.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteClick = async (op: UserProfile) => {
    if (op.uid === user?.uid) {
      alert('You cannot delete your own administrative session.');
      return;
    }
    if (!window.confirm(`Are you absolutely sure you want to permanently delete broadcaster ${op.firstName} ${op.lastName}?`)) {
      return;
    }
    setActionLoading(op.uid);
    try {
      await adminDeleteUser(op.uid);
      await fetchData();
    } catch (err: any) {
      alert(err?.message || 'Failed to remove user account.');
    } finally {
      setActionLoading(null);
    }
  };

  // 1. CLEARANCE CHECK: Non-Admin Guard
  if (!isAdmin) {
    return (
      <div className="bg-slate-900 border border-slate-850 rounded-3xl p-8 shadow-2xl text-center max-w-xl mx-auto my-12" id="clearance-lockout">
        <div className="inline-flex p-4 bg-red-500/10 border border-red-500/15 text-red-400 rounded-2xl shadow-xl shadow-red-500/5 mb-5">
          <ShieldAlert className="w-10 h-10 animate-pulse" />
        </div>
        <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center justify-center gap-2">
          <span>Administrator Clearance Required</span>
        </h2>
        <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
          The Users Directory & administrative controls are locked. Please authenticate with an <strong>Administrator</strong> credentials role to view the broadcaster list, modify user profiles, or disable sessions.
        </p>
        <div className="mt-5 p-3.5 bg-slate-950/60 border border-slate-850 rounded-2xl inline-flex flex-col gap-1.5 items-start text-left text-[11px] font-mono text-slate-400">
          <span className="text-[10px] text-blue-400 font-sans font-black uppercase tracking-wider">Default Developer Sandbox Credentials:</span>
          <span>👤 Email: <strong className="text-white">admin@stream.com</strong></span>
          <span>🔑 Password: <strong className="text-white">pass123</strong></span>
        </div>
      </div>
    );
  }

  // Filter & Sort Engine
  const processedUsers = usersList.filter(u => {
    // Search filter
    const matchesSearch = 
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.phone && u.phone.includes(search));

    // Role Filter
    const matchesRole = roleFilter === 'all' || u.role.toLowerCase() === roleFilter.toLowerCase();
    
    // Status Filter
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;

    // Verification Filter
    const isVerified = u.emailVerified || u.isVerified;
    const matchesVerify = verifyFilter === 'all' || 
      (verifyFilter === 'verified' && isVerified) || 
      (verifyFilter === 'unverified' && !isVerified);

    return matchesSearch && matchesRole && matchesStatus && matchesVerify;
  }).sort((a, b) => {
    if (sortBy === 'name_asc') {
      return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
    }
    if (sortBy === 'name_desc') {
      return `${b.firstName} ${b.lastName}`.localeCompare(`${a.firstName} ${a.lastName}`);
    }
    if (sortBy === 'date_desc') {
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    }
    if (sortBy === 'date_asc') {
      return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
    }
    if (sortBy === 'login_desc') {
      return new Date(b.lastLogin || 0).getTime() - new Date(a.lastLogin || 0).getTime();
    }
    return 0;
  });

  return (
    <div className="flex flex-col gap-6" id="admin-user-management">
      
      {/* 2. ADMIN STATISTICS PANEL */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between shadow">
            <span className="text-[9px] uppercase font-black text-slate-500 tracking-wider block">Total Broadcasters</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-black text-white">{stats.totalUsers}</span>
              <span className="text-[10px] text-slate-500 font-mono">active DB</span>
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between shadow">
            <span className="text-[9px] uppercase font-black text-slate-500 tracking-wider block">Verified Operators</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-black text-emerald-400">{stats.verifiedUsers}</span>
              <span className="text-[10px] text-emerald-600/80 font-mono">
                {stats.totalUsers ? Math.round((stats.verifiedUsers / stats.totalUsers) * 100) : 0}%
              </span>
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between shadow">
            <span className="text-[9px] uppercase font-black text-slate-500 tracking-wider block">Unverified Accounts</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-black text-amber-500">{stats.unverifiedUsers}</span>
              <span className="text-[10px] text-slate-500 font-mono">awaiting check</span>
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between shadow">
            <span className="text-[9px] uppercase font-black text-slate-500 tracking-wider block">Online Operators</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-black text-blue-400">{stats.onlineUsers}</span>
              <span className="text-[10px] text-blue-500 font-mono animate-pulse">● Live</span>
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between shadow col-span-2 md:col-span-1">
            <span className="text-[9px] uppercase font-black text-slate-500 tracking-wider block">Joined This Month</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-black text-white">{stats.newUsersThisMonth}</span>
              <span className="text-[10px] text-slate-500 font-mono">new registrations</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. CORE TABLE CONTAINER */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl">
        
        {/* Title and Refresh */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 text-blue-400 border border-blue-500/15 rounded-2xl">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <span>Broadcaster Administration Console</span>
                <span className="px-2 py-0.5 bg-blue-600/10 text-blue-400 text-[9px] font-mono rounded-full border border-blue-500/10">
                  Secured root access
                </span>
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Query records, change roles, suspend unverified sessions, or delete accounts.
              </p>
            </div>
          </div>

          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs font-bold transition-all border border-slate-700 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Database</span>
          </button>
        </div>

        {/* 4. FILTER BAR */}
        <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-850 flex flex-col gap-3 mb-5">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search broadasters by name, email, phone, handle..."
              className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white outline-none transition-all placeholder:text-slate-600 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            
            {/* Filter by Role */}
            <div className="flex flex-col gap-1">
              <span className="text-[8px] font-black uppercase text-slate-500 tracking-wider pl-1">Role / Specialties</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 px-3 py-2 outline-none cursor-pointer focus:border-blue-500"
              >
                <option value="all">All Roles</option>
                <option value="administrator">Administrator</option>
                <option value="operator">Operator</option>
                <option value="commentator">Commentator</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>

            {/* Filter by Status */}
            <div className="flex flex-col gap-1">
              <span className="text-[8px] font-black uppercase text-slate-500 tracking-wider pl-1">Session Status</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 px-3 py-2 outline-none cursor-pointer focus:border-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="disabled">Disabled / Suspended</option>
              </select>
            </div>

            {/* Filter by Verification */}
            <div className="flex flex-col gap-1">
              <span className="text-[8px] font-black uppercase text-slate-500 tracking-wider pl-1">Email Verification</span>
              <select
                value={verifyFilter}
                onChange={(e) => setVerifyFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 px-3 py-2 outline-none cursor-pointer focus:border-blue-500"
              >
                <option value="all">All Verification</option>
                <option value="verified">Verified Emails</option>
                <option value="unverified">Unverified Emails</option>
              </select>
            </div>

            {/* Sorting */}
            <div className="flex flex-col gap-1">
              <span className="text-[8px] font-black uppercase text-slate-500 tracking-wider pl-1">Sort Broadcasters</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 px-3 py-2 outline-none cursor-pointer focus:border-blue-500"
              >
                <option value="date_desc">Joined (Newest First)</option>
                <option value="date_asc">Joined (Oldest First)</option>
                <option value="login_desc">Last Login (Recent First)</option>
                <option value="name_asc">Name (A-Z)</option>
                <option value="name_desc">Name (Z-A)</option>
              </select>
            </div>

          </div>
        </div>

        {/* 5. USER TABLE */}
        <div className="overflow-x-auto w-full border border-slate-800 rounded-2xl bg-slate-950/40">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-500 font-medium">Scanning Firebase users collection...</p>
            </div>
          ) : processedUsers.length === 0 ? (
            <div className="text-center py-16">
              <Users className="w-10 h-10 text-slate-700 mx-auto mb-3" />
              <h3 className="text-xs font-bold text-slate-300">No Broadcasters Found</h3>
              <p className="text-[11px] text-slate-500 mt-1">Try adjusting your filters or search keywords.</p>
            </div>
          ) : (
            <table className="w-full border-collapse text-left text-xs text-slate-300">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/40 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  <th className="py-3 px-4">Profile</th>
                  <th className="py-3 px-4">Handle</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Email Check</th>
                  <th className="py-3 px-4">Joined Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/60 font-medium">
                {processedUsers.map((op) => {
                  const isSelf = op.uid === user?.uid;
                  const isVerified = op.emailVerified || op.isVerified;
                  return (
                    <tr key={op.uid} className={`hover:bg-slate-900/30 transition-all ${isSelf ? 'bg-blue-950/5' : ''}`}>
                      {/* Photo / Avatar */}
                      <td className="py-3.5 px-4">
                        {op.photoURL ? (
                          <img 
                            src={op.photoURL} 
                            alt={op.firstName} 
                            className="w-8 h-8 rounded-full border border-slate-700 object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-black text-xs flex items-center justify-center">
                            {op.firstName?.[0]?.toUpperCase() || 'U'}
                          </div>
                        )}
                      </td>

                      {/* Name & Handle */}
                      <td className="py-3.5 px-4 font-bold text-white">
                        <div className="flex flex-col">
                          <span>{op.firstName} {op.lastName} {isSelf && <span className="text-[9px] text-blue-400 font-normal ml-1 bg-blue-500/10 px-1.5 py-0.5 rounded">(You)</span>}</span>
                          <span className="text-[10px] text-slate-500 font-mono mt-0.5">@{op.username || 'unknown'}</span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">{op.email}</td>

                      {/* Phone */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">{op.phone || '—'}</td>

                      {/* Role Badge */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                          op.role === 'Administrator' 
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                            : op.role === 'Commentator'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : op.role === 'Operator'
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}>
                          {op.role || 'Operator'}
                        </span>
                      </td>

                      {/* Status Checkbox/Indicator */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleStatus(op)}
                          disabled={actionLoading === op.uid}
                          className="focus:outline-none bg-transparent border-0 p-0"
                          title={op.status === 'active' ? 'Click to Suspend Account' : 'Click to Enable Account'}
                        >
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border transition-all cursor-pointer ${
                            op.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                              : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${op.status === 'active' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                            {op.status === 'active' ? 'Active' : 'Suspended'}
                          </span>
                        </button>
                      </td>

                      {/* Email Verified */}
                      <td className="py-3.5 px-4">
                        {isVerified ? (
                          <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[10px]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Verified</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-amber-500 font-bold text-[10px]">
                            <XCircle className="w-3.5 h-3.5 text-amber-500" />
                            <span>Pending</span>
                          </div>
                        )}
                      </td>

                      {/* Joined Date */}
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[10px]">
                        {op.createdAt ? new Date(op.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' }) : '—'}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          
                          {/* View details */}
                          <button
                            onClick={() => setSelectedUser(op)}
                            className="p-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                            title="View Broadcast Session Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Details */}
                          <button
                            onClick={() => handleStartEdit(op)}
                            className="p-1.5 bg-slate-900 border border-slate-800 hover:border-slate-750 text-blue-400 hover:text-blue-300 rounded-lg transition-colors cursor-pointer"
                            title="Edit User Profile"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Account */}
                          <button
                            onClick={() => handleDeleteClick(op)}
                            disabled={isSelf || actionLoading === op.uid}
                            className="p-1.5 bg-slate-900 border border-slate-800 hover:border-red-500/30 text-rose-400 hover:text-rose-300 rounded-lg transition-colors disabled:opacity-30 cursor-pointer"
                            title={isSelf ? 'Cannot delete yourself' : 'Delete Account'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

      </div>

      {/* 6. MODAL: VIEW TELEMETRY DETAILS */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
                <div className="flex items-center gap-2.5 text-blue-400 font-bold uppercase tracking-wider text-xs">
                  <Laptop className="w-4 h-4" />
                  <span>Broadcaster Telemetry Session</span>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 flex flex-col gap-5">
                <div className="flex items-center gap-4 border-b border-slate-850 pb-4">
                  {selectedUser.photoURL ? (
                    <img 
                      src={selectedUser.photoURL} 
                      alt={selectedUser.firstName} 
                      className="w-12 h-12 rounded-full border border-slate-800 object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-black text-sm flex items-center justify-center">
                      {selectedUser.firstName?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <div className="text-left">
                    <h4 className="text-sm font-black text-white">{selectedUser.firstName} {selectedUser.lastName}</h4>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">UID: {selectedUser.uid}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-850">
                    <span className="text-[8px] uppercase font-black text-slate-500 tracking-wider block">Specialty Sport</span>
                    <span className="text-xs font-bold text-slate-300 mt-1 block">{selectedUser.favoriteSport || 'General Sport / Football'}</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-850">
                    <span className="text-[8px] uppercase font-black text-slate-500 tracking-wider block">Target Render FPS</span>
                    <span className="text-xs font-bold text-slate-300 mt-1 block">{selectedUser.fpsMode || '60'} FPS</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-850">
                    <span className="text-[8px] uppercase font-black text-slate-500 tracking-wider block">Sound Feedback</span>
                    <span className="text-xs font-bold text-slate-300 mt-1 block">{selectedUser.audioCues !== false ? 'Enabled' : 'Muted'}</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-850">
                    <span className="text-[8px] uppercase font-black text-slate-500 tracking-wider block">Phone Number</span>
                    <span className="text-xs font-bold text-slate-300 mt-1 block font-mono">{selectedUser.phone || 'No Phone Registered'}</span>
                  </div>
                </div>

                {/* Session Details */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex flex-col gap-2.5">
                  <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider border-b border-slate-900 pb-1.5 block">Active Node Metadata</span>
                  <div className="grid grid-cols-2 gap-y-2 text-[11px] font-mono">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Laptop className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>Device: <strong className="text-slate-200">{selectedUser.device || 'Desktop'}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Cpu className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>Platform: <strong className="text-slate-200">{selectedUser.os || 'Windows'}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400 col-span-2">
                      <HelpCircle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>Browser Agent: <strong className="text-slate-200">{selectedUser.browser || 'Chrome'}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400 col-span-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>Session Init: <strong className="text-slate-200 text-[10px]">{selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString() : 'Never logged'}</strong></span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 7. MODAL: EDIT USER OVERLAY */}
      <AnimatePresence>
        {editingUser && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-blue-400 font-bold uppercase tracking-wider text-xs">
                  <Edit className="w-4 h-4" />
                  <span>Modify Broadcaster Settings</span>
                </div>
                <button
                  onClick={() => setEditingUser(null)}
                  className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSaveEdit} className="p-6 flex flex-col gap-4">
                
                {/* Names row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">First Name</label>
                    <input
                      type="text"
                      value={editForm.firstName}
                      onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Last Name</label>
                    <input
                      type="text"
                      value={editForm.lastName}
                      onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Username */}
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Username Handle</label>
                  <input
                    type="text"
                    value={editForm.username}
                    onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white outline-none font-mono"
                    required
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Phone Number</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white outline-none font-mono"
                  />
                </div>

                {/* Stream Role */}
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Stream Specialty / Role</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value as any }))}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-2.5 text-xs text-slate-300 outline-none cursor-pointer"
                  >
                    <option value="Administrator">Administrator</option>
                    <option value="Operator">Operator</option>
                    <option value="Commentator">Commentator</option>
                    <option value="Viewer">Viewer</option>
                  </select>
                </div>

                {/* Session Status */}
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Access Permission</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-2.5 text-xs text-slate-300 outline-none cursor-pointer"
                  >
                    <option value="active">Active (Granted Access)</option>
                    <option value="disabled">Suspended (Blocked Access)</option>
                  </select>
                </div>

                {/* Submit Row */}
                <div className="flex gap-2.5 mt-2 pt-4 border-t border-slate-850">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="flex-1 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs py-2.5 font-bold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading === editingUser.uid}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs py-2.5 font-bold transition-all cursor-pointer shadow-lg shadow-blue-500/10"
                  >
                    {actionLoading === editingUser.uid ? 'Saving...' : 'Commit Changes'}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
