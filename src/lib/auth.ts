// ---------------------------------------------------------------------------
// Firebase Authentication helpers -- client-side only
// ---------------------------------------------------------------------------
// NOTE: Each sign-in provider must be enabled in the Firebase Console
// under Authentication > Sign-in method.
// ---------------------------------------------------------------------------

import { getFirebaseApp } from "./firebase";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function getAuth() {
  const app = getFirebaseApp();
  if (!app) throw new Error("Firebase is not configured");
  const { getAuth: _getAuth } = await import("firebase/auth");
  return _getAuth(app);
}

// ---------------------------------------------------------------------------
// Magic Link (passwordless email)
// ---------------------------------------------------------------------------

const MAGIC_LINK_STORAGE_KEY = "selah_magic_link_email";

/**
 * Send a magic sign-in link to the given email address.
 * The link will redirect to the app's /auth/callback page.
 */
export async function sendMagicLink(email: string): Promise<void> {
  const { sendSignInLinkToEmail } = await import("firebase/auth");
  const auth = await getAuth();

  // Determine the callback URL based on environment
  const baseUrl = typeof window !== "undefined"
    ? window.location.origin
    : "https://readselah.app";

  const actionCodeSettings = {
    url: `${baseUrl}/auth/callback`,
    handleCodeInApp: true,
  };

  await sendSignInLinkToEmail(auth, email, actionCodeSettings);

  // Save the email locally so we can complete sign-in when they click the link
  if (typeof window !== "undefined") {
    window.localStorage.setItem(MAGIC_LINK_STORAGE_KEY, email);
  }
}

/**
 * Complete magic link sign-in. Call this on the /auth/callback page.
 * Returns true if sign-in was completed, false if the URL isn't a sign-in link.
 */
export async function completeMagicLinkSignIn(): Promise<boolean> {
  const { isSignInWithEmailLink, signInWithEmailLink } = await import("firebase/auth");
  const auth = await getAuth();

  if (!isSignInWithEmailLink(auth, window.location.href)) {
    return false;
  }

  let email = window.localStorage.getItem(MAGIC_LINK_STORAGE_KEY);
  if (!email) {
    // User opened link on a different device — prompt for email
    email = window.prompt("Please enter the email you used to sign in:");
    if (!email) return false;
  }

  await signInWithEmailLink(auth, email, window.location.href);
  window.localStorage.removeItem(MAGIC_LINK_STORAGE_KEY);
  return true;
}

// ---------------------------------------------------------------------------
// Email / Password (kept for settings page)
// ---------------------------------------------------------------------------

export async function signUpWithEmail(email: string, password: string): Promise<void> {
  const { createUserWithEmailAndPassword } = await import("firebase/auth");
  const auth = await getAuth();
  await createUserWithEmailAndPassword(auth, email, password);
}

export async function signInWithEmail(email: string, password: string): Promise<void> {
  const { signInWithEmailAndPassword } = await import("firebase/auth");
  const auth = await getAuth();
  await signInWithEmailAndPassword(auth, email, password);
}

export async function resetPassword(email: string): Promise<void> {
  const { sendPasswordResetEmail } = await import("firebase/auth");
  const auth = await getAuth();
  await sendPasswordResetEmail(auth, email);
}

// ---------------------------------------------------------------------------
// Google (disabled — kept for future use)
// ---------------------------------------------------------------------------

// export async function signInWithGoogle(): Promise<void> { ... }

// ---------------------------------------------------------------------------
// Apple (disabled — kept for future use)
// ---------------------------------------------------------------------------

// export async function signInWithApple(): Promise<void> { ... }

// ---------------------------------------------------------------------------
// Anonymous
// ---------------------------------------------------------------------------

export async function signInAnonymously(): Promise<void> {
  const { signInAnonymously: _signInAnon } = await import("firebase/auth");
  const auth = await getAuth();
  await _signInAnon(auth);
}

// ---------------------------------------------------------------------------
// Delete account
// ---------------------------------------------------------------------------

export async function deleteUserAccount(): Promise<void> {
  const { deleteUser } = await import("firebase/auth");
  const auth = await getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("No user is signed in");

  try {
    const sync = await import("./sync");
    await sync.deleteAllUserData(user.uid);
  } catch (err) {
    console.warn("[Auth] Failed to delete Firestore data:", err);
  }

  await deleteUser(user);
}

// ---------------------------------------------------------------------------
// Sign out & auth state
// ---------------------------------------------------------------------------

export async function signOut(): Promise<void> {
  const { signOut: _signOut } = await import("firebase/auth");
  const auth = await getAuth();
  await _signOut(auth);
}

export async function onAuthStateChanged(
  callback: (user: { uid: string; email: string | null; displayName: string | null; isAnonymous: boolean } | null) => void,
): Promise<() => void> {
  const { isFirebaseConfigured } = await import("./firebase");
  if (!isFirebaseConfigured()) {
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
