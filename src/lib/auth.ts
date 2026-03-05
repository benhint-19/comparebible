// ---------------------------------------------------------------------------
// Firebase Authentication helpers -- client-side only
// ---------------------------------------------------------------------------
// NOTE: Each sign-in provider must be enabled in the Firebase Console
// under Authentication > Sign-in method.
// ---------------------------------------------------------------------------

import { getFirebaseApp } from "./firebase";

// Google Web Client ID (client_type 3 from google-services.json)
const GOOGLE_WEB_CLIENT_ID = "722992642330-6lik5llrrg5836n8jqvb0ns0i8nmr2tu.apps.googleusercontent.com";
// iOS Client ID (from GoogleService-Info.plist)
const GOOGLE_IOS_CLIENT_ID = "722992642330-kspi8fakf0hoo8k2rg5dg6u63cuoh13e.apps.googleusercontent.com";

let socialLoginInitialized = false;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function getAuth() {
  const app = getFirebaseApp();
  if (!app) throw new Error("Firebase is not configured");
  const { getAuth: _getAuth } = await import("firebase/auth");
  return _getAuth(app);
}

function isNative(): boolean {
  try {
    return typeof window !== "undefined" && !!(window as any).Capacitor?.isNativePlatform?.();
  } catch {
    return false;
  }
}

function getPlatform(): "ios" | "android" | "web" {
  try {
    return ((window as any).Capacitor?.getPlatform?.() ?? "web") as "ios" | "android" | "web";
  } catch {
    return "web";
  }
}

function generateRawNonce(length = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(36)).join("").slice(0, length);
}

async function sha256(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ---------------------------------------------------------------------------
// Native social login (via @capgo/capacitor-social-login)
// ---------------------------------------------------------------------------

async function initSocialLogin(): Promise<boolean> {
  if (socialLoginInitialized) return true;
  if (!isNative()) return false;

  try {
    const { SocialLogin } = await import("@capgo/capacitor-social-login");
    const platform = getPlatform();

    if (platform === "ios") {
      await SocialLogin.initialize({
        google: {
          webClientId: GOOGLE_WEB_CLIENT_ID,
          iOSClientId: GOOGLE_IOS_CLIENT_ID,
        },
        apple: {},
      });
    } else {
      await SocialLogin.initialize({
        google: {
          webClientId: GOOGLE_WEB_CLIENT_ID,
        },
      });
    }

    socialLoginInitialized = true;
    return true;
  } catch (error) {
    console.error("[Auth] SocialLogin init error:", error);
    return false;
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

export async function signInWithGoogle(): Promise<void> {
  // Native: use SocialLogin plugin → get idToken → signInWithCredential
  if (isNative()) {
    const ready = await initSocialLogin();
    if (ready) {
      const { SocialLogin } = await import("@capgo/capacitor-social-login");

      const isIOS = getPlatform() === "ios";
      let rawNonce: string | undefined;
      let nonceDigest: string | undefined;
      if (isIOS) {
        rawNonce = generateRawNonce();
        nonceDigest = await sha256(rawNonce);
      }

      const result = await SocialLogin.login({
        provider: "google",
        options: {
          scopes: ["email", "profile"],
          ...(nonceDigest ? { nonce: nonceDigest } : {}),
          ...(isIOS ? { forcePrompt: true } : {}),
        },
      });

      if (result?.result && "idToken" in result.result && result.result.idToken) {
        const { GoogleAuthProvider, signInWithCredential } = await import("firebase/auth");
        const auth = await getAuth();
        const credential = GoogleAuthProvider.credential(result.result.idToken);
        await signInWithCredential(auth, credential);
        return;
      }

      throw new Error("Google Sign-In did not return an ID token");
    }
  }

  // Web fallback: signInWithPopup
  const { GoogleAuthProvider, signInWithPopup } = await import("firebase/auth");
  const auth = await getAuth();
  const provider = new GoogleAuthProvider();
  await signInWithPopup(auth, provider);
}

// ---------------------------------------------------------------------------
// Apple
// ---------------------------------------------------------------------------

export async function signInWithApple(): Promise<void> {
  // Native iOS: use SocialLogin plugin → get idToken → signInWithCredential
  if (isNative() && getPlatform() === "ios") {
    const ready = await initSocialLogin();
    if (ready) {
      const { SocialLogin } = await import("@capgo/capacitor-social-login");

      const result = await SocialLogin.login({
        provider: "apple",
        options: {
          scopes: ["email", "name"],
        },
      });

      if (result?.result && "idToken" in result.result && result.result.idToken) {
        const { OAuthProvider, signInWithCredential } = await import("firebase/auth");
        const auth = await getAuth();
        const provider = new OAuthProvider("apple.com");
        const credential = provider.credential({ idToken: result.result.idToken });
        await signInWithCredential(auth, credential);
        return;
      }

      throw new Error("Apple Sign-In did not return an ID token");
    }
  }

  // Web / Android fallback: signInWithPopup
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
