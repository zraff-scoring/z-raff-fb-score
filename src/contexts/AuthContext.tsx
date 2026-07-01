import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export interface UserProfile {
  uid: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  photoURL: string;
  role: 'Administrator' | 'Operator' | 'Commentator' | 'Viewer';
  createdAt: string;
  lastLogin: string;
  status: 'active' | 'disabled';
  emailVerified: boolean;
  isVerified: boolean;
  device: string;
  browser: string;
  os: string;
  loginTime: string;
  favoriteSport?: string;
  fpsMode?: '30' | '60';
  audioCues?: boolean;
}

export interface AdminStats {
  totalUsers: number;
  verifiedUsers: number;
  unverifiedUsers: number;
  onlineUsers: number;
  newUsersThisMonth: number;
  latestUsers: UserProfile[];
}

interface AuthContextType {
  user: any | null;
  userProfile: UserProfile | null;
  loading: boolean;
  profileLoading: boolean;
  isMockAuth: boolean;
  isAdmin: boolean;
  registerUser: (data: any) => Promise<any>;
  loginUser: (email: string, pass: string, remember: boolean) => Promise<any>;
  signInWithGoogle: () => Promise<any>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  verifyEmail: () => Promise<void>;
  checkEmailVerified: () => Promise<boolean>;
  saveProfile: (profile: Partial<UserProfile>) => Promise<void>;
  uploadProfilePhoto: (file: File) => Promise<string>;
  getAllUsers: () => Promise<UserProfile[]>;
  adminUpdateUser: (uid: string, data: Partial<UserProfile>) => Promise<void>;
  adminDeleteUser: (uid: string) => Promise<void>;
  getAdminStats: () => Promise<AdminStats>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_OPERATOR_PROFILE: UserProfile = {
  uid: 'operator-1',
  firstName: 'Broadcast',
  lastName: 'Operator',
  username: 'operator',
  email: 'operator@stream',
  phone: '+1 (555) 0199',
  photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  role: 'Administrator',
  createdAt: '2026-07-01T12:00:00Z',
  lastLogin: new Date().toISOString(),
  status: 'active',
  emailVerified: true,
  isVerified: true,
  device: 'Primary Console',
  browser: 'Chrome / OBS',
  os: 'Broadcast Host',
  loginTime: new Date().toISOString(),
  favoriteSport: 'Football/Soccer',
  fpsMode: '60',
  audioCues: true,
};

const DEFAULT_MOCK_USERS: UserProfile[] = [
  DEFAULT_OPERATOR_PROFILE,
  {
    uid: 'operator-2',
    firstName: 'Sarah',
    lastName: 'Jones',
    username: 'sarah_stats',
    email: 'sarah@stream',
    phone: '+1 (555) 0244',
    photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    role: 'Operator',
    createdAt: '2026-07-01T12:05:00Z',
    lastLogin: '2026-07-01T12:10:00Z',
    status: 'active',
    emailVerified: true,
    isVerified: true,
    device: 'Mobile Deck',
    browser: 'Safari',
    os: 'iOS',
    loginTime: '2026-07-01T12:10:00Z',
    favoriteSport: 'Basketball',
    fpsMode: '30',
    audioCues: false,
  },
  {
    uid: 'commentator-1',
    firstName: 'John',
    lastName: 'Champion',
    username: 'john_voice',
    email: 'john@stream',
    phone: '+1 (555) 0355',
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    role: 'Commentator',
    createdAt: '2026-07-01T12:15:00Z',
    lastLogin: '2026-07-01T12:18:00Z',
    status: 'active',
    emailVerified: true,
    isVerified: true,
    device: 'Audio Booth',
    browser: 'Firefox',
    os: 'Windows 11',
    loginTime: '2026-07-01T12:18:00Z',
    favoriteSport: 'Football/Soccer',
    fpsMode: '60',
    audioCues: true,
  }
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isUnlocked, setIsUnlocked] = useState(() => {
    return sessionStorage.getItem('zraff_app_unlocked') === 'true';
  });

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Sync isUnlocked state with sessionStorage
  useEffect(() => {
    const checkUnlock = () => {
      const unlocked = sessionStorage.getItem('zraff_app_unlocked') === 'true';
      setIsUnlocked(unlocked);
    };

    window.addEventListener('storage', checkUnlock);
    // Custom event check for same tab sessionStorage changes
    const interval = setInterval(checkUnlock, 1000);

    return () => {
      window.removeEventListener('storage', checkUnlock);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (isUnlocked) {
      // Load operator profile from localStorage or fallback
      try {
        const saved = localStorage.getItem('zraff_operator_profile');
        if (saved) {
          setUserProfile(JSON.parse(saved));
        } else {
          setUserProfile(DEFAULT_OPERATOR_PROFILE);
          localStorage.setItem('zraff_operator_profile', JSON.stringify(DEFAULT_OPERATOR_PROFILE));
        }
      } catch (e) {
        setUserProfile(DEFAULT_OPERATOR_PROFILE);
      }
    } else {
      setUserProfile(null);
    }
  }, [isUnlocked]);

  const user = isUnlocked ? {
    uid: userProfile?.uid || 'operator-1',
    displayName: `${userProfile?.firstName || 'Broadcast'} ${userProfile?.lastName || 'Operator'}`,
    email: userProfile?.email || 'operator@stream',
    photoURL: userProfile?.photoURL || ''
  } : null;

  const registerUser = async (data: any) => {
    return data;
  };

  const loginUser = async (email: string, pass: string, remember: boolean) => {
    sessionStorage.setItem('zraff_app_unlocked', 'true');
    setIsUnlocked(true);
    return DEFAULT_OPERATOR_PROFILE;
  };

  const signInWithGoogle = async () => {
    sessionStorage.setItem('zraff_app_unlocked', 'true');
    setIsUnlocked(true);
    return DEFAULT_OPERATOR_PROFILE;
  };

  const logout = async () => {
    sessionStorage.removeItem('zraff_app_unlocked');
    setIsUnlocked(false);
    setUserProfile(null);
  };

  const resetPassword = async (email: string) => {};
  const verifyEmail = async () => {};
  const checkEmailVerified = async () => true;

  const saveProfile = async (profileData: Partial<UserProfile>) => {
    setProfileLoading(true);
    if (!userProfile) return;

    const updatedProfile = {
      ...userProfile,
      ...profileData,
    } as UserProfile;

    setUserProfile(updatedProfile);
    try {
      localStorage.setItem('zraff_operator_profile', JSON.stringify(updatedProfile));
      
      // Also update the operator's entry in our usersList
      const mockUsersRaw = localStorage.getItem('zraff_mock_users');
      const list: UserProfile[] = mockUsersRaw ? JSON.parse(mockUsersRaw) : DEFAULT_MOCK_USERS;
      const idx = list.findIndex(u => u.uid === updatedProfile.uid);
      if (idx !== -1) {
        list[idx] = updatedProfile;
      } else {
        list.push(updatedProfile);
      }
      localStorage.setItem('zraff_mock_users', JSON.stringify(list));
    } catch (e) {
      console.error('Failed to save profile locally:', e);
    }
    setProfileLoading(false);
  };

  const uploadProfilePhoto = async (file: File) => {
    setProfileLoading(true);
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Url = reader.result as string;
        await saveProfile({ photoURL: base64Url });
        resolve(base64Url);
      };
      reader.onerror = (e) => {
        setProfileLoading(false);
        reject(e);
      };
      reader.readAsDataURL(file);
    });
  };

  const getAllUsers = async (): Promise<UserProfile[]> => {
    try {
      const mockUsersRaw = localStorage.getItem('zraff_mock_users');
      if (mockUsersRaw) {
        return JSON.parse(mockUsersRaw);
      } else {
        localStorage.setItem('zraff_mock_users', JSON.stringify(DEFAULT_MOCK_USERS));
        return DEFAULT_MOCK_USERS;
      }
    } catch (e) {
      return DEFAULT_MOCK_USERS;
    }
  };

  const adminUpdateUser = async (uid: string, data: Partial<UserProfile>) => {
    try {
      const list = await getAllUsers();
      const idx = list.findIndex(u => u.uid === uid);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...data };
        localStorage.setItem('zraff_mock_users', JSON.stringify(list));
        
        // If updating the current logged-in user profile, sync it
        if (uid === userProfile?.uid) {
          setUserProfile(list[idx]);
          localStorage.setItem('zraff_operator_profile', JSON.stringify(list[idx]));
        }
      }
    } catch (e) {
      console.error('Failed to update user administrative status:', e);
    }
  };

  const adminDeleteUser = async (uid: string) => {
    try {
      const list = await getAllUsers();
      const updatedList = list.filter(u => u.uid !== uid);
      localStorage.setItem('zraff_mock_users', JSON.stringify(updatedList));
    } catch (e) {
      console.error('Failed to delete user administratively:', e);
    }
  };

  const getAdminStats = async (): Promise<AdminStats> => {
    const list = await getAllUsers();
    const totalUsers = list.length;
    const verifiedUsers = list.filter(u => u.emailVerified || u.isVerified).length;
    const unverifiedUsers = totalUsers - verifiedUsers;
    const onlineUsers = list.filter(u => u.status === 'active').length;
    const newUsersThisMonth = list.length;
    const latestUsers = [...list].slice(0, 5);

    return {
      totalUsers,
      verifiedUsers,
      unverifiedUsers,
      onlineUsers,
      newUsersThisMonth,
      latestUsers
    };
  };

  return (
    <AuthContext.Provider value={{
      user,
      userProfile,
      loading: false,
      profileLoading,
      isMockAuth: true,
      isAdmin: true,
      registerUser,
      loginUser,
      signInWithGoogle,
      logout,
      resetPassword,
      verifyEmail,
      checkEmailVerified,
      saveProfile,
      uploadProfilePhoto,
      getAllUsers,
      adminUpdateUser,
      adminDeleteUser,
      getAdminStats
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
