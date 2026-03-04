// ---------------------------------------------------------------------------
// Firebase Authentication helpers -- client-side only
// ---------------------------------------------------------------------------
// NOTE: Google sign-in requires enabling the Google provider in the
// Firebase Console under Authentication > Sign-in method.
// ---------------------------------------------------------------------------

import { getFirebaseApp } from "./firebase";

/**
 * Lazily import and return the Firebase Auth instance.
 * Uses dynamic import to keep the auth module out of the initial bundle.
 */
async function getAuth() {
  const { getAuth: _getAuth } = await import("firebase/auth");
  return _getAuth(getFirebaseApp());
}

/**
 * Sign in with Google via popup (web) or redirect (Capacitor native).
 */
export async function signInWithGoogle(): Promise<void> {
  const { GoogleAuthProvider, signInWithPopup, signInWithRedirect } =
    await import("firebase/auth");
  const auth = await getAuth();
  const provider = new GoogleAuthProvider();

  // On native Capacitor shells, popup auth doesn't work reliably.
  // Fall back to redirect-based sign-in.
  const isNative = await isNativePlatform();
  if (isNative) {
    await signInWithRedirect(auth, provider);
  } else {
    await signInWithPopup(auth, provider);
  }
}

/**
 * Sign in anonymously -- gives the user a persistent uid for sync
 * without requiring an account.
 */
export async function signInAnonymously(): Promise<void> {
  const { signInAnonymously: _signInAnon } = await import("firebase/auth");
  const auth = await getAuth();
  await _signInAnon(auth);
}

/**
 * Sign the current user out.
 */
export async function signOut(): Promise<void> {
  const { signOut: _signOut } = await import("firebase/auth");
  const auth = await getAuth();
  await _signOut(auth);
}

/**
 * Subscribe to Firebase auth state changes.
 * Returns an unsubscribe function.
 */
export async function onAuthStateChanged(
  callback: (user: { uid: string; email: string | null; displayName: string | null; isAnonymous: boolean } | null) => void,
): Promise<() => void> {
  const { onAuthStateChanged: _onAuth } = await import("firebase/auth");
  const auth = await getAuth();

  return _onAuth(auth, (firebaseUser) => {
    if (firebaseUser) {
      callback({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        isAnonymous: firebaseUser.isAnonymous,
      });
    } else {
      callback(null);
    }
  });
}

/**
 * Detect whether we are running inside a Capacitor native shell.
 */
async function isNativePlatform(): Promise<boolean> {
  try {
    const { Capacitor } = await import("@capacitor/core");
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}
