import "server-only";
import { z } from "zod";

/**
 * Server-side environment. These names are deliberately NOT prefixed with
 * NEXT_PUBLIC_ — the service-account key must never reach the browser
 * bundle. Next.js loads .env.local automatically, so there is no dotenv
 * call here.
 */
const envSchema = z.object({
  FIREBASE_PROJECT_ID: z.string().min(1),
  FIREBASE_CLIENT_EMAIL: z.string().min(1),
  FIREBASE_PRIVATE_KEY: z.string().min(1),
  FIREBASE_STORAGE_BUCKET: z.string().min(1).optional(),
});

// Tests provide their own fake Firebase env and mock firebase-admin
// outright, so parsing is skipped there in favour of placeholders.
function loadEnv() {
  if (process.env.NODE_ENV === "test") {
    return {
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || "test-project",
      FIREBASE_CLIENT_EMAIL:
        process.env.FIREBASE_CLIENT_EMAIL || "test@test-project.iam.gserviceaccount.com",
      FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY || "test-key",
      FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
    };
  }

  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error("Invalid server environment:", parsed.error.flatten().fieldErrors);
    throw new Error(
      "Invalid server environment. Check FIREBASE_* values in glowsync-fe/.env.local.",
    );
  }
  return parsed.data;
}

export const env = loadEnv();
