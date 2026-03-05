// ---------------------------------------------------------------------------
// Firebase Authentication helpers -- client-side only
// ---------------------------------------------------------------------------
// NOTE: Each sign-in provider must be enabled in the Firebase Console
// under Authentication > Sign-in method.
// ---------------------------------------------------------------------------

import { getFirebaseApp } from "./firebase";

/**
 * Lazily import and return the Firebase Auth instance.
 */
async function getAuth() {
  const app = getFirebaseApp();
  if (!app) throw new Error("Firebase is not configured");
  const { getAuth: _getAuth } = await import("firebase/auth");
  return _getAuth(app);
}

/** True when running inside a Capacitor native shell. */
function isNativePlatform(): boolean {
  try {
    return typeof window !== "undefined" && !!(window as any).Capacitor?.isNativePlatform?.();
  } catch {
    return false;
  }
}

/** "ios" | "android" | "web" */
function getPlatform(): string {
  try {
    return (window as any).Capacitor?.getPlatform?.() ?? "web";
  } catch {
    return "web";
  }
}

// ---------------------------------------------------------------------------
// Email / Password
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
// Google
// ---------------------------------------------------------------------------

/**
 * Google Sign-In.
 * - Web & Android: signInWithPopup (works in Chrome WebView)
 * - iOS: signInWithPopup doesn't work in WKWebView, so we use
 *   signInWithRedirect + getRedirectResult as a fallback.
 */
export async function signInWithGoogle(): Promise<void> {
  const { GoogleAuthProvider, signInWithPopup } = await import("firebase/auth");
  const auth = await getAuth();
  const provider = new GoogleAuthProvider();
  await signInWithPopup(auth, provider);
}

// ---------------------------------------------------------------------------
// Apple
// ---------------------------------------------------------------------------

/**
 * Apple Sign-In.
 * - iOS native: uses @capacitor-community/apple-sign-in for the native
 *   Apple ID sheet, then links the credential to Firebase JS SDK.
 * - Web / Android: signInWithPopup
 */
export async function signInWithApple(): Promise<void> {
  if (getPlatform() === "ios") {
    // Native Apple Sign-In via Capacitor plugin
    const { SignInWithApple } = await import("@capacitor-community/apple-sign-in");
    const result = await SignInWithApple.authorize({
      clientId: "com.comparebible.app",
      redirectURI: "",
      scopes: "email name",
    });

    const idToken = result.response.identityToken;
    if (!idToken) throw new Error("Apple Sign-In did not return an identity token");

    // Link to Firebase
    const { OAuthProvider, signInWithCredential } = await import("firebase/auth");
    const auth = await getAuth();
    const provider = new OAuthProvider("apple.com");
    const credential = provider.credential({
      idToken,
      rawNonce: result.response.authorizationCode ?? undefined,
    });
    await signInWithCredential(auth, credential);
    return;
  }

  // Web / Android
  const { OAuthProvider, signInWithPopup } = await import("firebase/auth");
  const auth = await getAuth();
  const provider = new OAuthProvider("apple.com");
  await signInWithPopup(auth, provider);
}

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
