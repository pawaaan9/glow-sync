import "server-only";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { env } from "./env";

// getApps() guards against re-initialising across Next.js dev hot reloads,
// where this module is evaluated more than once per process.
const app = getApps().length
  ? getApps()[0]!
  : initializeApp({
      credential: cert({
        projectId: env.FIREBASE_PROJECT_ID,
        clientEmail: env.FIREBASE_CLIENT_EMAIL,
        // .env stores the key with literal "\n" sequences; restore real newlines.
        privateKey: env.FIREBASE_PRIVATE_KEY.replaceAll("\\n", "\n"),
      }),
      storageBucket:
        env.FIREBASE_STORAGE_BUCKET || `${env.FIREBASE_PROJECT_ID}.firebasestorage.app`,
    });

export const db = getFirestore(app);
export const auth = getAuth(app);
export const bucket = getStorage(app).bucket();

export { app as firebaseApp };
