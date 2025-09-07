// /src/lib/firebase.js — modular v9, no globals, named exports present
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

/**
 * Configure via env only (recommended).
 * Vite:  VITE_FIREBASE_*
 * CRA:   REACT_APP_FIREBASE_*
 */
const env = (typeof import.meta !== "undefined" && import.meta.env) || (typeof process !== "undefined" ? process.env : {});

const cfg = {
  apiKey: env?.VITE_FIREBASE_API_KEY || env?.REACT_APP_FIREBASE_API_KEY,
  authDomain: env?.VITE_FIREBASE_AUTH_DOMAIN || env?.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: env?.VITE_FIREBASE_PROJECT_ID || env?.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: env?.VITE_FIREBASE_STORAGE_BUCKET || env?.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env?.VITE_FIREBASE_MESSAGING_SENDER_ID || env?.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: env?.VITE_FIREBASE_APP_ID || env?.REACT_APP_FIREBASE_APP_ID,
};

if (!cfg.apiKey || !cfg.projectId) {
  console.warn("[firebase] Missing env config. See .env.firebase.example");
}

const app = getApps().length ? getApp() : initializeApp(cfg);

// ✅ Named exports that your app can import
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// default export of the initialized app (optional usage)
export default app;
