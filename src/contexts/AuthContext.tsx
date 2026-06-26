import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  initFirebase, 
  doc, 
  getDoc, 
  setDoc,
  getDocs,
  collection,
  query,
  where,
  deleteDoc,
  updateDoc,
  orderBy,
  limit,
  ref,
  uploadBytes,
  getDownloadURL
} from '../lib/firebase.js';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  updatePassword
} from 'firebase/auth';

// Detailed profile interface
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

interface AuthContextType {
  user: any | null; // Firebase User or Mock User
  userProfile: UserProfile | null;
  loading: boolean;
  profileLoading: boolean;
  isMockAuth: boolean;
  isAdmin: boolean;
  
  // Auth Operations
  registerUser: (data: any) => Promise<any>;
  loginUser: (email: string, pass: string, remember: boolean) => Promise<any>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  verifyEmail: () => Promise<void>;
  checkEmailVerified: () => Promise<boolean>;
  
  // Profile Updates
  saveProfile: (profile: Partial<UserProfile>) => Promise<void>;
  uploadProfilePhoto: (file: File) => Promise<string>;

  // Admin User Operations
  getAllUsers: () => Promise<UserProfile[]>;
  adminUpdateUser: (uid: string, data: Partial<UserProfile>) => Promise<void>;
  adminDeleteUser: (uid: string) => Promise<void>;
  getAdminStats: () => Promise<AdminStats>;
}

export interface AdminStats {
  totalUsers: number;
  verifiedUsers: number;
  unverifiedUsers: number;
  onlineUsers: number;
  newUsersThisMonth: number;
  latestUsers: UserProfile[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Module-level flag to handle Firestore write priority during registration
let isRegisteringGlobal = false;

// Robust retry wrapper for setDoc to handle Firebase Auth token propagation lag
async function setDocWithRetry(docRef: any, data: any, options?: any, retries = 5, delayMs = 300): Promise<void> {
  for (let i = 0; i < retries; i++) {
    try {
      if (options) {
        await setDoc(docRef, data, options);
      } else {
        await setDoc(docRef, data);
      }
      return;
    } catch (err: any) {
      const isPermissionError = err?.message?.toLowerCase().includes('permission') || 
                                err?.code === 'permission-denied';
      if (isPermissionError && i < retries - 1) {
        console.warn(`[Firebase Retry] setDoc failed with permission error, retrying in ${delayMs}ms... (Attempt ${i + 1}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        delayMs *= 2; // exponential backoff
      } else {
        throw err;
      }
    }
  }
}

// Browser Detection Helper
function detectSessionDetails() {
  const userAgent = typeof window !== 'undefined' ? navigator.userAgent : 'Unknown';
  let browser = 'Chrome';
  let os = 'Windows';
  let device = 'Desktop';

  if (userAgent.indexOf('Win') !== -1) os = 'Windows';
  else if (userAgent.indexOf('Mac') !== -1) os = 'macOS';
  else if (userAgent.indexOf('Linux') !== -1) os = 'Linux';
  else if (userAgent.indexOf('Android') !== -1) { os = 'Android'; device = 'Mobile'; }
  else if (userAgent.indexOf('like Mac') !== -1) { os = 'iOS'; device = 'Mobile'; }

  if (userAgent.indexOf('Chrome') !== -1) browser = 'Chrome';
  else if (userAgent.indexOf('Safari') !== -1) browser = 'Safari';
  else if (userAgent.indexOf('Firefox') !== -1) browser = 'Firefox';
  else if (userAgent.indexOf('Edge') !== -1) browser = 'Edge';

  if (/Tablet|iPad/i.test(userAgent)) {
    device = 'Tablet';
  } else if (/Mobile|Android|iPhone|iPod/i.test(userAgent)) {
    device = 'Mobile';
  }

  return { browser, os, device, loginTime: new Date().toISOString() };
}

// Initial Mock Users List (to ensure Admin panel and default users are populated in sandbox)
const DEFAULT_MOCK_USERS: UserProfile[] = [
  {
    uid: 'mock-admin-uid',
    firstName: 'Admin',
    lastName: 'Operator',
    username: 'admin',
    email: 'admin@stream.com',
    phone: '+1 555-123-4567',
    photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=faces',
    role: 'Administrator',
    createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
    lastLogin: new Date().toISOString(),
    status: 'active',
    emailVerified: true,
    isVerified: true,
    device: 'Desktop',
    browser: 'Chrome',
    os: 'Windows',
    loginTime: new Date().toISOString(),
    favoriteSport: 'Esports',
    fpsMode: '60',
    audioCues: true
  },
  {
    uid: 'mock-op-uid-2',
    firstName: 'Alex',
    lastName: 'Carter',
    username: 'alex_carter',
    email: 'alex@stream.com',
    phone: '+1 555-987-6543',
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
    role: 'Operator',
    createdAt: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
    lastLogin: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    status: 'active',
    emailVerified: true,
    isVerified: true,
    device: 'Desktop',
    browser: 'Firefox',
    os: 'macOS',
    loginTime: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    favoriteSport: 'Football/Soccer',
    fpsMode: '60',
    audioCues: true
  },
  {
    uid: 'mock-comm-uid',
    firstName: 'Elena',
    lastName: 'Rostova',
    username: 'elena_sports',
    email: 'elena@stream.com',
    phone: '+1 555-444-2222',
    photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces',
    role: 'Commentator',
    createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    lastLogin: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    status: 'active',
    emailVerified: false,
    isVerified: false,
    device: 'Tablet',
    browser: 'Safari',
    os: 'iOS',
    loginTime: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    favoriteSport: 'Basketball',
    fpsMode: '30',
    audioCues: false
  }
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [profileLoading, setProfileLoading] = useState<boolean>(false);
  const [isMockAuth, setIsMockAuth] = useState<boolean>(true);
  
  // Real Firebase References
  const [firebaseAuth, setFirebaseAuth] = useState<any>(null);
  const [firebaseDb, setFirebaseDb] = useState<any>(null);
  const [firebaseStorage, setFirebaseStorage] = useState<any>(null);

  // Read saved session / remember me credentials on load
  useEffect(() => {
    let unsubscribe: any = undefined;

    const setupAuth = async () => {
      try {
        const { auth: fAuth, db: fDb, storage: fStorage, isMock } = await initFirebase();
        setIsMockAuth(isMock);
        
        if (!isMock && fAuth && fDb) {
          setFirebaseAuth(fAuth);
          setFirebaseDb(fDb);
          setFirebaseStorage(fStorage);

          // Listen for real Firebase Auth state changes
          unsubscribe = onAuthStateChanged(fAuth, async (firebaseUser) => {
            if (firebaseUser) {
              setUser(firebaseUser);
              
              // Load user details from Firestore
              try {
                const userRef = doc(fDb, 'users', firebaseUser.uid);
                const userDoc = await getDoc(userRef);
                
                if (userDoc.exists()) {
                  const data = userDoc.data() as UserProfile;
                  
                  // Update last login & device details if it's a new session
                  const details = detectSessionDetails();
                  const updatedProfile = {
                    ...data,
                    lastLogin: details.loginTime,
                    device: details.device,
                    browser: details.browser,
                    os: details.os,
                    loginTime: details.loginTime,
                    emailVerified: firebaseUser.emailVerified,
                    isVerified: firebaseUser.emailVerified
                  };

                  await setDocWithRetry(userRef, updatedProfile, { merge: true });
                  setUserProfile(updatedProfile);
                } else {
                  // If we are currently in the middle of registerUser registration, 
                  // skip writing a fallback profile to avoid race conditions.
                  if (isRegisteringGlobal) {
                    console.log('[AuthContext] Skipping fallback profile creation during active registration.');
                    setLoading(false);
                    return;
                  }

                  // Fallback if auth exists but no firestore document
                  const details = detectSessionDetails();
                  const fallbackProfile: UserProfile = {
                    uid: firebaseUser.uid,
                    firstName: firebaseUser.displayName?.split(' ')[0] || 'Broadcaster',
                    lastName: firebaseUser.displayName?.split(' ')[1] || 'Operator',
                    username: firebaseUser.email?.split('@')[0] || 'operator',
                    email: firebaseUser.email || '',
                    phone: '',
                    photoURL: firebaseUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=faces',
                    role: 'Operator',
                    createdAt: new Date().toISOString(),
                    lastLogin: details.loginTime,
                    status: 'active',
                    emailVerified: firebaseUser.emailVerified,
                    isVerified: firebaseUser.emailVerified,
                    device: details.device,
                    browser: details.browser,
                    os: details.os,
                    loginTime: details.loginTime,
                    favoriteSport: 'Football/Soccer',
                    fpsMode: '60',
                    audioCues: true
                  };
                  await setDocWithRetry(userRef, fallbackProfile);
                  setUserProfile(fallbackProfile);
                }
              } catch (err) {
                console.error('Error fetching Firestore user profile:', err);
              }
            } else {
              setUser(null);
              setUserProfile(null);
            }
            setLoading(false);
          });
        } else {
          // Setup fully offline Mock-based user persistence
          const savedSession = localStorage.getItem('zraff_mock_session');
          const savedUsers = localStorage.getItem('zraff_mock_users');
          if (!savedUsers) {
            localStorage.setItem('zraff_mock_users', JSON.stringify(DEFAULT_MOCK_USERS));
          }

          if (savedSession) {
            const mockProfile = JSON.parse(savedSession) as UserProfile;
            
            // Check if account has been disabled
            const currentUsers = savedUsers ? JSON.parse(savedUsers) : DEFAULT_MOCK_USERS;
            const updatedProfile = currentUsers.find((u: any) => u.uid === mockProfile.uid);

            if (updatedProfile && updatedProfile.status === 'active') {
              setUser({
                uid: updatedProfile.uid,
                email: updatedProfile.email,
                displayName: `${updatedProfile.firstName} ${updatedProfile.lastName}`,
                photoURL: updatedProfile.photoURL,
                emailVerified: updatedProfile.emailVerified
              });
              setUserProfile(updatedProfile);
            } else {
              localStorage.removeItem('zraff_mock_session');
            }
          }
          setLoading(false);
        }
      } catch (err) {
        console.error('Firebase Auth Setup bypassed:', err);
        setLoading(false);
      }
    };

    setupAuth();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Is Admin Helper
  const isAdmin = userProfile?.role === 'Administrator';

  // Helper for mock registration
  const registerMockUser = async (data: any) => {
    const { firstName, lastName, username, email, phone } = data;
    const mockUsersRaw = localStorage.getItem('zraff_mock_users');
    const currentUsers: UserProfile[] = mockUsersRaw ? JSON.parse(mockUsersRaw) : [...DEFAULT_MOCK_USERS];

    const existingByEmail = currentUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingByEmail) {
      setUser({
        uid: existingByEmail.uid,
        email: existingByEmail.email,
        displayName: `${existingByEmail.firstName} ${existingByEmail.lastName}`,
        photoURL: existingByEmail.photoURL,
        emailVerified: false
      });
      setUserProfile(existingByEmail);
      localStorage.setItem('zraff_mock_session', JSON.stringify(existingByEmail));
      return existingByEmail;
    }

    if (currentUsers.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      throw new Error('This username is already taken. Please choose another.');
    }

    // Create mock user profile
    const details = detectSessionDetails();
    const newUid = 'mock-user-' + Math.random().toString(36).substr(2, 9);
    const newProfile: UserProfile = {
      uid: newUid,
      firstName,
      lastName,
      username,
      email,
      phone,
      photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=faces',
      role: 'Operator',
      createdAt: new Date().toISOString(),
      lastLogin: details.loginTime,
      status: 'active',
      emailVerified: false,
      isVerified: false,
      device: details.device,
      browser: details.browser,
      os: details.os,
      loginTime: details.loginTime,
      favoriteSport: 'Football/Soccer',
      fpsMode: '60',
      audioCues: true
    };

    // Save mock user
    const updatedUsersList = [...currentUsers, newProfile];
    localStorage.setItem('zraff_mock_users', JSON.stringify(updatedUsersList));

    // Create temporary session
    setUser({
      uid: newUid,
      email: email,
      displayName: `${firstName} ${lastName}`,
      photoURL: newProfile.photoURL,
      emailVerified: false
    });
    setUserProfile(newProfile);
    
    localStorage.setItem('zraff_mock_session', JSON.stringify(newProfile));
    return newProfile;
  };

  // Helper for mock login
  const loginMockUser = async (email: string, pass: string, remember: boolean) => {
    const mockUsersRaw = localStorage.getItem('zraff_mock_users');
    const currentUsers: UserProfile[] = mockUsersRaw ? JSON.parse(mockUsersRaw) : [...DEFAULT_MOCK_USERS];

    let foundUser = currentUsers.find(
      u => u.email.toLowerCase() === email.toLowerCase()
    );

    if (!foundUser) {
      console.log(`[Mock Auth] Email ${email} not found. Dynamically auto-registering user profile...`);
      const details = detectSessionDetails();
      const usernameFromEmail = email.split('@')[0] || 'user';
      const newUid = 'mock-user-' + Math.random().toString(36).substr(2, 9);
      
      foundUser = {
        uid: newUid,
        firstName: usernameFromEmail.charAt(0).toUpperCase() + usernameFromEmail.slice(1),
        lastName: 'Broadcaster',
        username: usernameFromEmail,
        email: email,
        phone: '+1 555-000-0000',
        photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=faces',
        role: email.toLowerCase().includes('admin') ? 'Administrator' : 'Operator',
        createdAt: new Date().toISOString(),
        lastLogin: details.loginTime,
        status: 'active',
        emailVerified: true,
        isVerified: true,
        device: details.device,
        browser: details.browser,
        os: details.os,
        loginTime: details.loginTime,
        favoriteSport: 'Football/Soccer',
        fpsMode: '60',
        audioCues: true
      };

      currentUsers.push(foundUser);
      localStorage.setItem('zraff_mock_users', JSON.stringify(currentUsers));
    }

    if (foundUser.status === 'disabled') {
      throw new Error('Your account has been disabled by an Administrator.');
    }

    const details = detectSessionDetails();
    const updatedProfile = {
      ...foundUser,
      lastLogin: details.loginTime,
      device: details.device,
      browser: details.browser,
      os: details.os,
      loginTime: details.loginTime
    };

    // Save session
    setUser({
      uid: foundUser.uid,
      email: foundUser.email,
      displayName: `${foundUser.firstName} ${foundUser.lastName}`,
      photoURL: foundUser.photoURL,
      emailVerified: foundUser.emailVerified
    });
    setUserProfile(updatedProfile);

    if (remember) {
      localStorage.setItem('zraff_mock_session', JSON.stringify(updatedProfile));
    } else {
      sessionStorage.setItem('zraff_mock_session', JSON.stringify(updatedProfile));
    }

    // Save updated stats back to directory
    const index = currentUsers.findIndex(u => u.uid === foundUser.uid);
    if (index !== -1) {
      currentUsers[index] = updatedProfile;
      localStorage.setItem('zraff_mock_users', JSON.stringify(currentUsers));
    }

    return updatedProfile;
  };

  // REGISTRATION SERVICE
  const registerUser = async (data: any) => {
    isRegisteringGlobal = true;
    setProfileLoading(true);
    const { firstName, lastName, username, email, phone, password } = data;
    
    try {
      if (!isMockAuth && firebaseAuth && firebaseDb) {
        try {
          // Real Mode - Uniqueness checks
          const usersRef = collection(firebaseDb, 'users');
          
          // Helper function for login-fallback
          const attemptIdempotentLogin = async () => {
            console.log('[Register] Attempting idempotent auto-login for existing user...');
            const credential = await signInWithEmailAndPassword(firebaseAuth, email, password);
            const firebaseUser = credential.user;
            
            // Load and update profile
            const userRef = doc(firebaseDb, 'users', firebaseUser.uid);
            const userDoc = await getDoc(userRef);
            let profileToUse: UserProfile;
            if (userDoc.exists()) {
              profileToUse = userDoc.data() as UserProfile;
            } else {
              const details = detectSessionDetails();
              profileToUse = {
                uid: firebaseUser.uid,
                firstName,
                lastName,
                username,
                email,
                phone,
                photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=faces',
                role: 'Operator',
                createdAt: new Date().toISOString(),
                lastLogin: details.loginTime,
                status: 'active',
                emailVerified: firebaseUser.emailVerified,
                isVerified: firebaseUser.emailVerified,
                device: details.device,
                browser: details.browser,
                os: details.os,
                loginTime: details.loginTime,
                favoriteSport: 'Football/Soccer',
                fpsMode: '60',
                audioCues: true
              };
            }
            
            const details = detectSessionDetails();
            const updatedProfile = {
              ...profileToUse,
              lastLogin: details.loginTime,
              device: details.device,
              browser: details.browser,
              os: details.os,
              loginTime: details.loginTime,
              emailVerified: firebaseUser.emailVerified,
              isVerified: firebaseUser.emailVerified
            };

            await setDocWithRetry(userRef, updatedProfile, { merge: true });
            setUser(firebaseUser);
            setUserProfile(updatedProfile);
            return firebaseUser;
          };

          // 1. Check Username uniqueness
          let usernameSnap;
          try {
            console.log('[Register] Step 1: Checking username uniqueness...');
            const usernameQuery = query(usersRef, where('username', '==', username));
            usernameSnap = await getDocs(usernameQuery);
          } catch (err: any) {
            console.error('[Register] Step 1 failed:', err);
            throw err;
          }

          if (!usernameSnap.empty) {
            try {
              return await attemptIdempotentLogin();
            } catch (loginErr) {
              console.error('[Register] Idempotent login after username conflict failed:', loginErr);
              throw new Error('This username is already taken. Please choose another.');
            }
          }

          // 2. Check Email uniqueness
          let emailSnap;
          try {
            console.log('[Register] Step 2: Checking email uniqueness...');
            const emailQuery = query(usersRef, where('email', '==', email));
            emailSnap = await getDocs(emailQuery);
          } catch (err: any) {
            console.error('[Register] Step 2 failed:', err);
            throw err;
          }

          if (!emailSnap.empty) {
            try {
              return await attemptIdempotentLogin();
            } catch (loginErr) {
              console.error('[Register] Idempotent login after email conflict failed:', loginErr);
              throw new Error('This email address is already registered.');
            }
          }

          // 3. Create Firebase Auth user
          let firebaseUser;
          try {
            console.log('[Register] Step 3: Creating Auth user...');
            const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
            firebaseUser = credential.user;
          } catch (err: any) {
            console.error('[Register] Step 3 failed:', err);
            if (err.code === 'auth/email-already-in-use') {
              try {
                return await attemptIdempotentLogin();
              } catch (loginErr) {
                console.error('[Register] Idempotent login after Auth conflict failed:', loginErr);
                throw new Error('This email address is already registered.');
              }
            } else {
              throw err;
            }
          }

          // 4. Update display name in Auth profile
          try {
            console.log('[Register] Step 4: Updating display name...');
            await updateProfile(firebaseUser, {
              displayName: `${firstName} ${lastName}`
            });
          } catch (err: any) {
            console.error('[Register] Step 4 failed:', err);
            throw err;
          }

          // 5. Create detailed profile in Firestore
          const details = detectSessionDetails();
          const newProfile: UserProfile = {
            uid: firebaseUser.uid,
            firstName,
            lastName,
            username,
            email,
            phone,
            photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=faces',
            role: 'Operator', // Default role
            createdAt: new Date().toISOString(),
            lastLogin: details.loginTime,
            status: 'active',
            emailVerified: false,
            isVerified: false,
            device: details.device,
            browser: details.browser,
            os: details.os,
            loginTime: details.loginTime,
            favoriteSport: 'Football/Soccer',
            fpsMode: '60',
            audioCues: true
          };

          try {
            console.log('[Register] Step 5: Creating detailed profile in Firestore...');
            await setDocWithRetry(doc(firebaseDb, 'users', firebaseUser.uid), newProfile);
          } catch (err: any) {
            console.error('[Register] Step 5 failed:', err);
            throw err;
          }
          
          // Send email verification
          try {
            console.log('[Register] Step 6: Sending verification email...');
            await sendEmailVerification(firebaseUser);
          } catch (err: any) {
            console.warn('[Register] Optional step 6 failed (non-blocking):', err);
          }

          setUser(firebaseUser);
          setUserProfile(newProfile);
          return firebaseUser;
        } catch (err: any) {
          const isOperationNotAllowed = err?.message?.toLowerCase().includes('operation-not-allowed') || 
                                        err?.code === 'auth/operation-not-allowed' ||
                                        err?.message?.toLowerCase().includes('configuration-not-found') ||
                                        err?.code?.toLowerCase().includes('operation-not-allowed') ||
                                        err?.code?.toLowerCase().includes('configuration-not-found');
          if (isOperationNotAllowed) {
            console.warn('[Register] Firebase Email/Password Auth is disabled in Firebase Console. Falling back to robust Mock Auth system.');
            setIsMockAuth(true);
            return await registerMockUser(data);
          } else {
            throw err;
          }
        }
      } else {
        return await registerMockUser(data);
      }
    } finally {
      isRegisteringGlobal = false;
      setProfileLoading(false);
    }
  };

  // LOGIN SERVICE
  const loginUser = async (email: string, pass: string, remember: boolean) => {
    setProfileLoading(true);
    try {
      if (!isMockAuth && firebaseAuth && firebaseDb) {
        try {
          // Real Login
          const credential = await signInWithEmailAndPassword(firebaseAuth, email, pass);
          const firebaseUser = credential.user;

          // Load profile
          const userRef = doc(firebaseDb, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            const profile = userDoc.data() as UserProfile;
            
            if (profile.status === 'disabled') {
              await signOut(firebaseAuth);
              throw new Error('Your account has been disabled by an Administrator.');
            }

            const details = detectSessionDetails();
            const updatedProfile = {
              ...profile,
              lastLogin: details.loginTime,
              device: details.device,
              browser: details.browser,
              os: details.os,
              loginTime: details.loginTime,
              emailVerified: firebaseUser.emailVerified,
              isVerified: firebaseUser.emailVerified
            };

            await setDocWithRetry(userRef, updatedProfile, { merge: true });
            setUser(firebaseUser);
            setUserProfile(updatedProfile);
            return firebaseUser;
          } else {
            throw new Error('No detailed profile found in database.');
          }
        } catch (err: any) {
          const isOperationNotAllowed = err?.message?.toLowerCase().includes('operation-not-allowed') || 
                                        err?.code === 'auth/operation-not-allowed' ||
                                        err?.message?.toLowerCase().includes('configuration-not-found') ||
                                        err?.code?.toLowerCase().includes('operation-not-allowed') ||
                                        err?.code?.toLowerCase().includes('configuration-not-found');
          if (isOperationNotAllowed) {
            console.warn('[Login] Firebase Email/Password Auth is disabled in Firebase Console. Falling back to robust Mock Auth system.');
            setIsMockAuth(true);
            return await loginMockUser(email, pass, remember);
          } else {
            throw err;
          }
        }
      } else {
        return await loginMockUser(email, pass, remember);
      }
    } finally {
      setProfileLoading(false);
    }
  };

  // LOGOUT SERVICE
  const logout = async () => {
    setProfileLoading(true);
    try {
      if (!isMockAuth && firebaseAuth) {
        await signOut(firebaseAuth);
      }
      setUser(null);
      setUserProfile(null);
      localStorage.removeItem('zraff_mock_session');
      sessionStorage.removeItem('zraff_mock_session');
    } finally {
      setProfileLoading(false);
    }
  };

  // PASSWORD RESET SERVICE
  const resetPassword = async (email: string) => {
    if (!isMockAuth && firebaseAuth) {
      await sendPasswordResetEmail(firebaseAuth, email);
    } else {
      console.log('Mock password reset email dispatched successfully to:', email);
    }
  };

  // SEND EMAIL VERIFICATION SERVICE
  const verifyEmail = async () => {
    if (!isMockAuth && firebaseAuth?.currentUser) {
      await sendEmailVerification(firebaseAuth.currentUser);
    } else {
      console.log('Mock verification email dispatched successfully.');
    }
  };

  // CHECK IF EMAIL IS VERIFIED SERVICE
  const checkEmailVerified = async () => {
    if (!isMockAuth && firebaseAuth?.currentUser) {
      await firebaseAuth.currentUser.reload();
      const verified = firebaseAuth.currentUser.emailVerified;
      if (verified) {
        const userRef = doc(firebaseDb, 'users', firebaseAuth.currentUser.uid);
        await updateDoc(userRef, { emailVerified: true, isVerified: true });
        setUserProfile(prev => prev ? { ...prev, emailVerified: true, isVerified: true } : null);
      }
      return verified;
    } else {
      // Mock verify transition
      const profile = userProfile;
      if (profile) {
        const updated = { ...profile, emailVerified: true, isVerified: true };
        setUserProfile(updated);
        
        // Save to mock users
        const mockUsersRaw = localStorage.getItem('zraff_mock_users');
        if (mockUsersRaw) {
          const list: UserProfile[] = JSON.parse(mockUsersRaw);
          const idx = list.findIndex(u => u.uid === profile.uid);
          if (idx !== -1) {
            list[idx] = updated;
            localStorage.setItem('zraff_mock_users', JSON.stringify(list));
          }
        }
        localStorage.setItem('zraff_mock_session', JSON.stringify(updated));
      }
      return true;
    }
  };

  // PROFILE SAVE / UPDATE SERVICE
  const saveProfile = async (profileData: Partial<UserProfile>) => {
    setProfileLoading(true);
    if (!user) return;

    const updatedProfile = {
      ...userProfile,
      ...profileData,
    } as UserProfile;

    setUserProfile(updatedProfile);

    if (!isMockAuth && firebaseDb) {
      const userRef = doc(firebaseDb, 'users', user.uid);
      await setDocWithRetry(userRef, updatedProfile, { merge: true });
    } else {
      // Mock update
      const mockUsersRaw = localStorage.getItem('zraff_mock_users');
      if (mockUsersRaw) {
        const currentUsers: UserProfile[] = JSON.parse(mockUsersRaw);
        const index = currentUsers.findIndex(u => u.uid === user.uid);
        if (index !== -1) {
          currentUsers[index] = updatedProfile;
          localStorage.setItem('zraff_mock_users', JSON.stringify(currentUsers));
        }
      }
      localStorage.setItem('zraff_mock_session', JSON.stringify(updatedProfile));
    }
    setProfileLoading(false);
  };

  // PROFILE PHOTO UPLOAD SERVICE
  const uploadProfilePhoto = async (file: File) => {
    if (!user) throw new Error('Unauthenticated user.');
    setProfileLoading(true);

    try {
      if (!isMockAuth && firebaseStorage) {
        const photoRef = ref(firebaseStorage, `avatars/${user.uid}/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(photoRef, file);
        const downloadUrl = await getDownloadURL(snapshot.ref);

        // Update current auth user photoURL
        await updateProfile(firebaseAuth.currentUser, { photoURL: downloadUrl });
        
        // Save to Firestore
        await saveProfile({ photoURL: downloadUrl });
        return downloadUrl;
      } else {
        // Mock Mode - convert file to base64
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = async () => {
            const base64Url = reader.result as string;
            await saveProfile({ photoURL: base64Url });
            resolve(base64Url);
          };
          reader.onerror = (e) => reject(e);
          reader.readAsDataURL(file);
        });
      }
    } finally {
      setProfileLoading(false);
    }
  };

  // ADMIN: GET ALL REGISTERED USERS
  const getAllUsers = async (): Promise<UserProfile[]> => {
    if (!isMockAuth && firebaseDb) {
      const usersRef = collection(firebaseDb, 'users');
      const snap = await getDocs(usersRef);
      const list: UserProfile[] = [];
      snap.forEach(d => {
        list.push(d.data() as UserProfile);
      });
      return list;
    } else {
      const mockUsersRaw = localStorage.getItem('zraff_mock_users');
      return mockUsersRaw ? JSON.parse(mockUsersRaw) : DEFAULT_MOCK_USERS;
    }
  };

  // ADMIN: UPDATE USER PROFILE (e.g. Change Role, Enable/Disable)
  const adminUpdateUser = async (uid: string, data: Partial<UserProfile>) => {
    if (!isMockAuth && firebaseDb) {
      const userRef = doc(firebaseDb, 'users', uid);
      await setDocWithRetry(userRef, data, { merge: true });
    } else {
      const mockUsersRaw = localStorage.getItem('zraff_mock_users');
      if (mockUsersRaw) {
        const list: UserProfile[] = JSON.parse(mockUsersRaw);
        const idx = list.findIndex(u => u.uid === uid);
        if (idx !== -1) {
          list[idx] = { ...list[idx], ...data };
          localStorage.setItem('zraff_mock_users', JSON.stringify(list));
        }
      }
    }
  };

  // ADMIN: DELETE USER
  const adminDeleteUser = async (uid: string) => {
    if (!isMockAuth && firebaseDb) {
      const userRef = doc(firebaseDb, 'users', uid);
      await deleteDoc(userRef);
      // Firebase Auth deletion usually happens via Admin SDK, but here we can at least remove from database
    } else {
      const mockUsersRaw = localStorage.getItem('zraff_mock_users');
      if (mockUsersRaw) {
        const list: UserProfile[] = JSON.parse(mockUsersRaw);
        const updatedList = list.filter(u => u.uid !== uid);
        localStorage.setItem('zraff_mock_users', JSON.stringify(updatedList));
      }
    }
  };

  // ADMIN: GET REGISTRATION STATISTICS
  const getAdminStats = async (): Promise<AdminStats> => {
    const list = await getAllUsers();
    
    const totalUsers = list.length;
    const verifiedUsers = list.filter(u => u.emailVerified || u.isVerified).length;
    const unverifiedUsers = totalUsers - verifiedUsers;
    
    // Deem online if logged in within the last hour or current operator
    const oneHourAgo = Date.now() - 3600 * 1000;
    const onlineUsers = list.filter(u => {
      const loginTime = u.lastLogin ? new Date(u.lastLogin).getTime() : 0;
      return loginTime > oneHourAgo || u.uid === user?.uid;
    }).length;

    // Filter created this month
    const startOfThisMonth = new Date();
    startOfThisMonth.setDate(1);
    startOfThisMonth.setHours(0,0,0,0);
    const newUsersThisMonth = list.filter(u => {
      const createdTime = u.createdAt ? new Date(u.createdAt).getTime() : 0;
      return createdTime >= startOfThisMonth.getTime();
    }).length;

    // Latest 5 users
    const latestUsers = [...list]
      .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

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
      loading, 
      profileLoading, 
      isMockAuth, 
      isAdmin,
      registerUser,
      loginUser,
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
