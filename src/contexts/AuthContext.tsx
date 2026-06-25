import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  initFirebase, 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  googleProvider,
  User 
} from '../lib/firebase.js';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isMockAuth: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isMockAuth, setIsMockAuth] = useState<boolean>(true);
  const [firebaseAuthInstance, setFirebaseAuthInstance] = useState<any>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const setupAuth = async () => {
      const { auth, isMock } = await initFirebase();
      setIsMockAuth(isMock);

      if (!isMock && auth) {
        setFirebaseAuthInstance(auth);
        unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
          if (firebaseUser) {
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
            });
          } else {
            setUser(null);
          }
          setLoading(false);
        });
      } else {
        // Mock Mode: check local storage for simulated session
        try {
          const savedUser = localStorage.getItem('zraff_mock_user');
          if (savedUser) {
            setUser(JSON.parse(savedUser));
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
      localStorage.removeItem('zraff_mock_user');
    }
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, isMockAuth, loginWithGoogle, logout }}>
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
