"use client";

// Firebase client initialization with optional Emulator Suite support
// Set NEXT_PUBLIC_USE_EMULATORS=1 in env (or use npm script dev:emulators) to connect to local emulators

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  getFirestore,
  connectFirestoreEmulator,
  type Firestore,
} from "firebase/firestore";
import {
  getStorage,
  connectStorageEmulator,
  type FirebaseStorage,
} from "firebase/storage";

// Optionally used if you have callable functions; left here for future use
// import { getFunctions, connectFunctionsEmulator, type Functions } from "firebase/functions";

let app: FirebaseApp | undefined;
let db: Firestore | undefined;
let storage: FirebaseStorage | undefined;
// let functions: Functions | undefined;

function getConfigFromEnv() {
  const cfg = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
  };
  return cfg;
}

export function getFirebase() {
  if (!app) {
    const config = getConfigFromEnv();
    app = getApps().length ? getApps()[0]! : initializeApp(config);

    db = getFirestore(app);
    storage = getStorage(app);
    // functions = getFunctions(app);

    if (process.env.NEXT_PUBLIC_USE_EMULATORS === "1") {
      const host = process.env.NEXT_PUBLIC_EMULATOR_HOST || "127.0.0.1";
      try {
        connectFirestoreEmulator(db, host, Number(process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_PORT) || 8080);
      } catch {}
      try {
        connectStorageEmulator(storage, host, Number(process.env.NEXT_PUBLIC_STORAGE_EMULATOR_PORT) || 9199);
      } catch {}
      // try { connectFunctionsEmulator(functions, host, Number(process.env.NEXT_PUBLIC_FUNCTIONS_EMULATOR_PORT) || 5001); } catch {}
      // Note: Auth emulator can be added later if needed
    }
  }
  return { app: app!, db: db!, storage: storage! };
}
