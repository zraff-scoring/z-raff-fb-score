import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  initFirebase, 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  googleProvider,
  User,
  doc,
  getDoc,
  setDoc
} from '../lib/firebase.js';

export interface UserProfile {
  displayName: string;
  role: string;
  favoriteSport: string;
  fpsMode: '30' | '60';
  audioCues: boolean;
  setupCompleted: boolean;
}

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  profileLoading: boolean;
  isMockAuth: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  saveProfile: (profile: Omit<UserProfile, 'setupCompleted'>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [profileLoading, setProfileLoading] = useState<boolean>(false);
  const [isMockAuth, setIsMockAuth] = useState<boolean>(true);
  const [firebaseAuthInstance, setFirebaseAuthInstance] = useState<any>(null);
  const [firestoreInstance, setFirestoreInstance] = useState<any>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const setupAuth = async () => {
      const { auth, db, isMock } = await initFirebase();
      setIsMockAuth(isMock);

      if (!isMock && auth && db) {
        setFirebaseAuthInstance(auth);
        setFirestoreInstance(db);
        unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
            const currentAuthUser = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
            };
            setUser(currentAuthUser);
            
            // Load Profile from Firestore
            setProfileLoading(true);
            try {
              const docRef = doc(db, 'user_profiles', firebaseUser.uid);
              const docSnap = await getDoc(docRef);
              if (docSnap.exists()) {
                setUserProfile(docSnap.data() as UserProfile);
              } else {
                setUserProfile({
                  displayName: firebaseUser.displayName || '',
                  role: '',
                  favoriteSport: '',
                  fpsMode: '60',
                  audioCues: true,
                  setupCompleted: false,
                });
              }
            } catch (err) {
              console.error('Failed to load user profile from Firestore:', err);
              setUserProfile({
                displayName: firebaseUser.displayName || '',
                role: '',
                favoriteSport: '',
                fpsMode: '60',
                audioCues: true,
                setupCompleted: false,
              });
            } finally {
              setProfileLoading(false);
            }
          } else {
            setUser(null);
            setUserProfile(null);
          }
          setLoading(false);
        });
      } else {
        // Mock Mode: check local storage for simulated session
        try {
          const savedUser = localStorage.getItem('zraff_mock_user');
          if (savedUser) {
            const parsedUser = JSON.parse(savedUser);
            setUser(parsedUser);
            
            // Load mock profile
            const savedProfile = localStorage.getItem(`zraff_mock_profile_${parsedUser.uid}`);
            if (savedProfile) {
              setUserProfile(JSON.parse(savedProfile));
            } else {
              setUserProfile({
                displayName: parsedUser.displayName || 'Guest Streamer',
                role: '',
                favoriteSport: '',
                fpsMode: '60',
                audioCues: true,
                setupCompleted: false,
              });
            }
          }
        } catch (e) {
          console.error('Failed to parse mock user:', e);
        }
        setLoading(false);
      }
    };

    setupAuth();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const loginWithGoogle = async () => {
    setLoading(true);
    if (!isMockAuth && firebaseAuthInstance && googleProvider) {
      try {
        await signInWithPopup(firebaseAuthInstance, googleProvider);
      } catch (error: any) {
        console.error('Google Sign-In Error:', error);
        setLoading(false);
        throw error;
      }
    } else {
      // Simulate Google Sign In with mock user
      const mockUser: AuthUser = {
        uid: 'mock-user-123',
        email: 'developer@example.com',
        displayName: 'Guest Streamer',
        photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
      };
      setUser(mockUser);
      localStorage.setItem('zraff_mock_user', JSON.stringify(mockUser));

      // Set default profile or load existing mock profile
      const savedProfile = localStorage.getItem(`zraff_mock_profile_${mockUser.uid}`);
      if (savedProfile) {
        setUserProfile(JSON.parse(savedProfile));
      } else {
        setUserProfile({
          displayName: mockUser.displayName || 'Guest Streamer',
          role: '',
          favoriteSport: '',
          fpsMode: '60',
          audioCues: true,
          setupCompleted: false,
        });
      }
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    if (!isMockAuth && firebaseAuthInstance) {
      try {
        await signOut(firebaseAuthInstance);
      } catch (error) {
        console.error('Sign-Out Error:', error);
      }
    } else {
      setUser(null);
      setUserProfile(null);
      localStorage.removeItem('zraff_mock_user');
    }
    setLoading(false);
  };

  const saveProfile = async (profileData: Omit<UserProfile, 'setupCompleted'>) => {
    if (!user) throw new Error('No authenticated user');
    setProfileLoading(true);

    const updatedProfile: UserProfile = {
      ...profileData,
      setupCompleted: true,
    };

    if (!isMockAuth && firebaseAuthInstance && firestoreInstance) {
      try {
        const docRef = doc(firestoreInstance, 'user_profiles', user.uid);
        await setDoc(docRef, updatedProfile);
        setUserProfile(updatedProfile);
      } catch (err) {
        console.error('Failed to save user profile to Firestore:', err);
        throw err;
      } finally {
        setProfileLoading(false);
      }
    } else {
      // Mock mode write to local storage
      localStorage.setItem(`zraff_mock_profile_${user.uid}`, JSON.stringify(updatedProfile));
      setUserProfile(updatedProfile);
      setProfileLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, profileLoading, isMockAuth, loginWithGoogle, logout, saveProfile }}>
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
