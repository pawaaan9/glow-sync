/**
 * Firebase Admin bootstrap for standalone CLI scripts.
 *
 * The app's own initialiser (src/server/config/firebase.ts) imports
 * "server-only", which throws outside Next's react-server condition — so
 * scripts run under tsx cannot reuse it. This is the same credential wiring
 * without that marker, reading .env.local the way Next would.
 */
import { config } from "dotenv";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

config({ path: ".env.local" });

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name}. Add it to glowsync-fe/.env.local.`);
  }
  return value;
}

export const projectId = required("FIREBASE_PROJECT_ID");
export const clientEmail = required("FIREBASE_CLIENT_EMAIL");
// .env stores the key with literal "\n" sequences; restore real newlines.
export const privateKey = required("FIREBASE_PRIVATE_KEY").replaceAll("\\n", "\n");

const app = getApps().length
  ? getApps()[0]!
  : initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });

export const db = getFirestore(app);
export const auth = getAuth(app);
