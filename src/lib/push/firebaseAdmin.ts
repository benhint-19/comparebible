// ---------------------------------------------------------------------------
// Firebase Admin SDK -- server-side only (API routes)
// ---------------------------------------------------------------------------

import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";

let adminApp: App | undefined;

function getAdminApp(): App {
  if (!adminApp) {
    if (getApps().length > 0) {
      adminApp = getApps()[0];
    } else {
      const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
      if (!serviceAccountKey) {
        throw new Error(
          "FIREBASE_SERVICE_ACCOUNT_KEY env var is not set. " +
            "Add it as a JSON string in your Vercel Environment Variables."
        );
      }

      const serviceAccount = JSON.parse(serviceAccountKey);
      adminApp = initializeApp({ credential: cert(serviceAccount) });
    }
  }

  return adminApp;
}

export function getAdminFirestore() {
  return getFirestore(getAdminApp());
}

export function getAdminMessaging() {
  return getMessaging(getAdminApp());
}
