// ---------------------------------------------------------------------------
// Firebase Authentication helpers -- client-side only
// ---------------------------------------------------------------------------
// NOTE: Each sign-in provider must be enabled in the Firebase Console
// under Authentication > Sign-in method.
// ---------------------------------------------------------------------------

import { getFirebaseApp } from "./firebase";

/**
 * Lazily import and return the Firebase Auth instance.
 * Uses dynamic import to keep the auth module out of the initial bundle.
 */
async function getAuth() {
  const app = getFirebaseApp();
  if (!app) throw new Error("Firebase is not configured");
  const { getAuth: _getAuth } = await import("firebase/auth");
  return _getAuth(app);
}

// ---------------------------------------------------------------------------
// Email / Password
// ---------------------------------------------------------------------------

/**
 * Create a new account with email and password.
 */
export async function signUpWithEmail(
  email: string,
  password: string,
): Promise<void> {
  const { createUserWithEmailAndPassword } = await import("firebase/auth");
  const auth = await getAuth();
  await createUserWithEmailAndPassword(auth, email, password);
}

/**
 * Sign in an existing user with email and password.
 */
export async function signInWithEmail(
  email: string,
  password: string,
): Promise<void> {
  const { signInWithEmailAndPassword } = await import("firebase/auth");
  const auth = await getAuth();
  await signInWithEmailAndPassword(auth, email, password);
}

/**
 * Send a password-reset email to the given address.
 */
export async function resetPassword(email: string): Promise<void> {
  const { sendPasswordResetEmail } = await import("firebase/auth");
  const auth = await getAuth();
  await sendPasswordResetEmail(auth, email);
}

// ---------------------------------------------------------------------------
// Google
// ---------------------------------------------------------------------------

/**
 * Sign in with Google via popup (web) or native SDK (Capacitor).
 */
export async function signInWithGoogle(): Promise<void> {
  const isNative = await isNativePlatform();

  if (isNative) {
    // Use Capacitor Firebase Auth plugin for native Google Sign-In
    const { FirebaseAuthentication } = await import(
      "@capacitor-firebase/authentication"
    );
    const { GoogleAuthProvider, signInWithCredential } = await import(
      "firebase/auth"
    );
    const result = await FirebaseAuthentication.signInWithGoogle();
    // Sync the native credential with the web Firebase Auth instance
    const auth = await getAuth();
    const credential = GoogleAuthProvider.credential(
      result.credential?.idToken,
    );
    await signInWithCredential(auth, credential);
  } else {
    const { GoogleAuthProvider, signInWithPopup } = await import(
      "firebase/auth"
    );
    const auth = await getAuth();
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  }
}

// ---------------------------------------------------------------------------
// Apple
// ---------------------------------------------------------------------------

/**
 * Sign in with Apple via popup (web) or native SDK (Capacitor).
 */
export async function signInWithApple(): Promise<void> {
  const isNative = await isNativePlatform();

  if (isNative) {
    const { FirebaseAuthentication } = await import(
      "@capacitor-firebase/authentication"
    );
    const { OAuthProvider, signInWithCredential } = await import(
      "firebase/auth"
    );
    const result = await FirebaseAuthentication.signInWithApple();
    const auth = await getAuth();
    const provider = new OAuthProvider("apple.com");
    const credential = provider.credential({
      idToken: result.credential?.idToken ?? "",
    });
    await signInWithCredential(auth, credential);
  } else {
    const { OAuthProvider, signInWithPopup } = await import("firebase/auth");
    const auth = await getAuth();
    const provider = new OAuthProvider("apple.com");
    await signInWithPopup(auth, provider);
  }
}

// ---------------------------------------------------------------------------
// Anonymous
// ---------------------------------------------------------------------------

/**
 * Sign in anonymously -- gives the user a persistent uid for sync
 * without requiring an account.
 */
export async function signInAnonymously(): Promise<void> {
  const { signInAnonymously: _signInAnon } = await import("firebase/auth");
  const auth = await getAuth();
  await _signInAnon(auth);
}

// ---------------------------------------------------------------------------
// Delete account
// ---------------------------------------------------------------------------

/**
 * Delete the current user's Firestore data and then their Firebase Auth account.
 * Throws auth/requires-recent-login if the session is too old.
 */
export async function deleteUserAccount(): Promise<void> {
  const { deleteUser } = await import("firebase/auth");
  const auth = await getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("No user is signed in");

  // Delete synced Firestore data first
  try {
    const sync = await import("./sync");
    await sync.deleteAllUserData(user.uid);
  } catch (err) {
    console.warn("[Auth] Failed to delete Firestore data:", err);
    // Continue with account deletion even if Firestore cleanup fails
  }

  // Delete the Firebase Auth account (may throw requires-recent-login)
  await deleteUser(user);
}

// ---------------------------------------------------------------------------
// Sign out & auth state
// ---------------------------------------------------------------------------

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
  const { isFirebaseConfigured } = await import("./firebase");
  if (!isFirebaseConfigured()) {
    // Firebase not configured — call back with null and return a no-op unsubscribe
    callback(null);
    return () => {};
  }

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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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
