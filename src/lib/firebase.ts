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
  collection,
  query,
  getDocs,
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
const cleanEnvVar = (val: string | undefined): string => {
  if (!val) return '';
  const trimmed = val.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
};

const envConfig: FirebaseConfig = {
  apiKey: cleanEnvVar(import.meta.env.VITE_FIREBASE_API_KEY),
  authDomain: cleanEnvVar(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
  projectId: cleanEnvVar(import.meta.env.VITE_FIREBASE_PROJECT_ID),
  storageBucket: cleanEnvVar(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: cleanEnvVar(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
  appId: cleanEnvVar(import.meta.env.VITE_FIREBASE_APP_ID),
  firestoreDatabaseId: cleanEnvVar(import.meta.env.VITE_FIREBASE_DATABASE_ID),
};

// Check if we have valid environment config
const hasEnvConfig = !!(envConfig.apiKey && envConfig.authDomain && envConfig.projectId);

export async function initFirebase(): Promise<{ auth: Auth | null; db: Firestore | null; googleProvider: GoogleAuthProvider | null; isMock: boolean }> {
  if (auth || db || isMock) return { auth, db, googleProvider, isMock };

  console.log('[Firebase Init] hasEnvConfig:', hasEnvConfig, 'envConfig:', {
    ...envConfig,
    apiKey: envConfig.apiKey ? '***' + envConfig.apiKey.slice(-5) : '',
  });

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
      googleProvider.setCustomParameters({
        prompt: 'select_account'
      });
      isMock = false;
      console.log('Firebase initialized successfully via env variables.');
      return { auth, db, googleProvider, isMock };
    } catch (e) {
      console.error('Failed to initialize Firebase with env config, trying fetch...', e);
    }
  }

  // Fallback: Try to fetch firebase-applet-config.json from the root
  try {
    const response = await fetch('/firebase-applet-config.json');
    if (response.ok) {
      const config = await response.json();
      console.log('[Firebase Init] fetched fallback config:', {
        ...config,
        apiKey: config.apiKey ? '***' + config.apiKey.slice(-5) : '',
      });
      if (config && config.apiKey && config.projectId) {
        const cleanedConfig = {
          apiKey: cleanEnvVar(config.apiKey),
          authDomain: cleanEnvVar(config.authDomain),
          projectId: cleanEnvVar(config.projectId),
          storageBucket: cleanEnvVar(config.storageBucket),
          messagingSenderId: cleanEnvVar(config.messagingSenderId),
          appId: cleanEnvVar(config.appId),
          firestoreDatabaseId: cleanEnvVar(config.firestoreDatabaseId),
        };

        if (getApps().length === 0) {
          app = initializeApp(cleanedConfig);
        } else {
          app = getApp();
        }
        auth = getAuth(app);
        db = initializeFirestore(app, {
          experimentalForceLongPolling: true,
        }, cleanedConfig.firestoreDatabaseId || undefined);
        googleProvider = new GoogleAuthProvider();
        googleProvider.setCustomParameters({
          prompt: 'select_account'
        });
        isMock = false;
        console.log('Firebase initialized successfully via firebase-applet-config.json.');
        return { auth, db, googleProvider, isMock };
      }
    }
  } catch (e) {
    console.error('Failed to fetch/parse firebase-applet-config.json fallback:', e);
  }

  // If no config is available, run in fully-functional Mock Mode for testing
  console.warn('Firebase configuration not found. Running in Developer Mock Mode.');
  isMock = true;
  return { auth: null, db: null, googleProvider: null, isMock: true };
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

export { auth, db, googleProvider, isMock, signInWithPopup, signOut, onAuthStateChanged, doc, setDoc, onSnapshot, getDoc, collection, query, getDocs };
export type { User, Firestore };
