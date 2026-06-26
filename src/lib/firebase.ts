import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User,
  Auth
} from 'firebase/auth';
import {
  initializeFirestore,
  getFirestore,
  doc,
  setDoc,
  onSnapshot,
  getDoc,
  Firestore
} from 'firebase/firestore';

// Standard Firebase config structure
export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  firestoreDatabaseId?: string;
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let googleProvider: GoogleAuthProvider | null = null;
let isMock = false;

// Attempt to detect configuration from environment variables
const envConfig: FirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || '',
};

// Check if we have valid environment config
const hasEnvConfig = envConfig.apiKey && envConfig.authDomain && envConfig.projectId;

export async function initFirebase(): Promise<{ auth: Auth | null; db: Firestore | null; isMock: boolean }> {
  if (auth || db || isMock) return { auth, db, isMock };

  if (hasEnvConfig) {
    try {
      if (getApps().length === 0) {
        app = initializeApp(envConfig);
      } else {
        app = getApp();
      }
      auth = getAuth(app);
      db = initializeFirestore(app, {
        experimentalForceLongPolling: true,
      }, envConfig.firestoreDatabaseId || undefined);
      googleProvider = new GoogleAuthProvider();
      isMock = false;
      console.log('Firebase initialized successfully via env variables.');
      return { auth, db, isMock };
    } catch (e) {
      console.error('Failed to initialize Firebase with env config, trying fetch...', e);
    }
  }

  // Fallback: Try to fetch firebase-applet-config.json from the root
  try {
    const response = await fetch('/firebase-applet-config.json');
    if (response.ok) {
      const config = await response.json();
      if (config && config.apiKey && config.projectId) {
        if (getApps().length === 0) {
          app = initializeApp(config);
        } else {
          app = getApp();
        }
        auth = getAuth(app);
        db = initializeFirestore(app, {
          experimentalForceLongPolling: true,
        }, config.firestoreDatabaseId || undefined);
        googleProvider = new GoogleAuthProvider();
        isMock = false;
        console.log('Firebase initialized successfully via firebase-applet-config.json.');
        return { auth, db, isMock };
      }
    }
  } catch (e) {
    // File not found or failed to parse, which is expected before Firebase setup is finished
  }

  // If no config is available, run in fully-functional Mock Mode for testing
  console.warn('Firebase configuration not found. Running in Developer Mock Mode.');
  isMock = true;
  return { auth: null, db: null, isMock: true };
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
      tenantId: auth?.currentUser?.tenantId || null,
      providerInfo: auth?.currentUser?.providerData?.map((provider: any) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export { auth, db, googleProvider, isMock, signInWithPopup, signOut, onAuthStateChanged, doc, setDoc, onSnapshot, getDoc };
export type { User, Firestore };
