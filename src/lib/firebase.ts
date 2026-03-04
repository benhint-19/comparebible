// ---------------------------------------------------------------------------
// Firebase client-side initialization
// ---------------------------------------------------------------------------

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | undefined;

/**
 * Returns the Firebase client app, initializing it on first call.
 * Safe to call multiple times -- returns the existing instance.
 * Only works client-side.
 */
export function getFirebaseApp(): FirebaseApp {
  if (typeof window === "undefined") {
    throw new Error("getFirebaseApp() must only be called on the client side");
  }

  if (!app) {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  }

  return app;
}

/**
 * Returns the Firebase Auth instance (lazy-loaded).
 * Import firebase/auth dynamically to keep the initial bundle small.
 */
export async function getFirebaseAuth() {
  const { getAuth } = await import("firebase/auth");
  return getAuth(getFirebaseApp());
}

/**
 * Returns the Firestore instance (lazy-loaded).
 * Import firebase/firestore dynamically to keep the initial bundle small.
 */
export async function getFirebaseFirestore() {
  const { getFirestore } = await import("firebase/firestore");
  return getFirestore(getFirebaseApp());
}
