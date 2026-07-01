import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  updatePassword,
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
  where,
  deleteDoc,
  updateDoc,
  orderBy,
  limit,
  Firestore
} from 'firebase/firestore';
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  FirebaseStorage 
} from 'firebase/storage';

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
let storage: FirebaseStorage | null = null;
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

const hardcodedConfig: FirebaseConfig = {
  apiKey: 'AIzaSyCrfNeE0qOy6RbBxa3AjkRJyq3rSj4FLV0',
  authDomain: 'gen-lang-client-0534194369.firebaseapp.com',
  projectId: 'gen-lang-client-0534194369',
  storageBucket: 'gen-lang-client-0534194369.firebasestorage.app',
  messagingSenderId: '969144181415',
  appId: '1:969144181415:web:3abdfe7eb2f913401d7182',
  firestoreDatabaseId: 'ai-studio-zraffsportsgraph-84e8ca8c-f37e-417c-b065-a4d888812ea9',
};

// Check if we have valid environment config
const hasEnvConfig = !!(envConfig.apiKey && envConfig.authDomain && envConfig.projectId);

export async function initFirebase(): Promise<{ auth: Auth | null; db: Firestore | null; storage: FirebaseStorage | null; googleProvider: GoogleAuthProvider | null; isMock: boolean }> {
  if (auth || db || isMock) return { auth, db, storage, googleProvider, isMock };

  let configToUse = envConfig;
  let configType = 'env variables';

  if (hasEnvConfig) {
    configToUse = envConfig;
  } else {
    configToUse = hardcodedConfig;
    configType = 'static hardcoded configuration';
  }

  console.log('[Firebase Init] Initializing via:', configType, 'config:', {
    ...configToUse,
    apiKey: configToUse.apiKey ? '***' + configToUse.apiKey.slice(-5) : '',
  });

  try {
    if (getApps().length === 0) {
      app = initializeApp(configToUse);
    } else {
      app = getApp();
    }
    auth = getAuth(app);
    db = initializeFirestore(app, {
      experimentalForceLongPolling: true,
    }, configToUse.firestoreDatabaseId || undefined);
    try {
      storage = getStorage(app);
    } catch (err) {
      console.error('Failed to initialize Storage:', err);
    }
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({
      prompt: 'select_account'
    });
    isMock = false;
    console.log(`Firebase initialized successfully via ${configType}.`);
    return { auth, db, storage, googleProvider, isMock };
  } catch (e) {
    console.error(`Failed to initialize Firebase with ${configType}, trying fetch fallback...`, e);
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
        try {
          storage = getStorage(app);
        } catch (err) {
          console.error('Failed to initialize Storage in fallback:', err);
        }
        googleProvider = new GoogleAuthProvider();
        googleProvider.setCustomParameters({
          prompt: 'select_account'
        });
        isMock = false;
        console.log('Firebase initialized successfully via firebase-applet-config.json.');
        return { auth, db, storage, googleProvider, isMock };
      }
    }
  } catch (e) {
    console.error('Failed to fetch/parse firebase-applet-config.json fallback:', e);
  }

  // If no config is available, run in fully-functional Mock Mode for testing
  console.warn('Firebase configuration not found. Running in Developer Mock Mode.');
  isMock = true;
  return { auth: null, db: null, storage: null, googleProvider: null, isMock: true };
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

export { 
  auth, 
  db, 
  storage, 
  googleProvider, 
  isMock, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  updatePassword,
  doc, 
  setDoc, 
  onSnapshot, 
  getDoc, 
  collection, 
  query, 
  getDocs,
  where,
  deleteDoc,
  updateDoc,
  orderBy,
  limit,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
};
export type { User, Firestore };
