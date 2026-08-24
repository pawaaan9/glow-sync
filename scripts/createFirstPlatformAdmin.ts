/**
 * Creates (or promotes) a platform_admin (super admin) account, stored in
 * the superAdmins/ collection rather than users/. There is
 * deliberately no public registration endpoint for this role — it can only
 * be created by someone with direct Admin SDK / server access, via this
 * script.
 *
 * Usage:
 *   npm run create-admin -- --email=admin@glowsync.com --password="Str0ngPass!" --name="Ada Admin"
 *
 * Or via environment variables (handy for CI/one-off provisioning):
 *   ADMIN_EMAIL=admin@glowsync.com ADMIN_PASSWORD=Str0ngPass! ADMIN_NAME="Ada Admin" npm run create-admin
 *
 * If the email already belongs to an existing Firebase Auth user, that
 * user is promoted to platform_admin instead of failing.
 */
import { FieldValue } from "firebase-admin/firestore";
import { auth, db } from "./firebaseAdmin";
import { COLLECTIONS, ROLES } from "../src/lib/shared";
import type { SuperAdminDocument } from "../src/server/types/firestore";

function readArg(flag: string): string | undefined {
  const prefix = `--${flag}=`;
  const match = process.argv.find((arg) => arg.startsWith(prefix));
  return match?.slice(prefix.length);
}

async function main() {
  const email = readArg("email") ?? process.env.ADMIN_EMAIL;
  const password = readArg("password") ?? process.env.ADMIN_PASSWORD;
  const fullName = readArg("name") ?? process.env.ADMIN_NAME ?? "Platform Administrator";

  if (!email || !password) {
    console.error(
      "Usage: npm run create-admin -- --email=you@example.com --password=\"Str0ngPass!\" --name=\"Your Name\"",
    );
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("Password must be at least 8 characters.");
    process.exit(1);
  }

  let uid: string;
  const existing = await auth.getUserByEmail(email).catch(() => null);

  if (existing) {
    uid = existing.uid;
    console.log(`Found existing Auth user ${uid} for ${email}; promoting to platform_admin.`);
  } else {
    const created = await auth.createUser({ email, password, displayName: fullName });
    uid = created.uid;
    console.log(`Created new Auth user ${uid} for ${email}.`);
  }

  // Super admins are stored apart from ordinary users, in superAdmins/.
  const adminRef = db.collection(COLLECTIONS.SUPER_ADMINS).doc(uid);
  const legacyUserRef = db.collection(COLLECTIONS.USERS).doc(uid);
  const [snap, legacySnap] = await Promise.all([adminRef.get(), legacyUserRef.get()]);
  const existingData = (snap.data() ?? legacySnap.data()) as SuperAdminDocument | undefined;

  // Only the fields an admin actually has. No phone, salonId, or
  // verification-lifecycle columns — those belong to users/ and would sit
  // here as permanent nulls.
  const data: SuperAdminDocument = {
    id: uid,
    fullName,
    email,
    role: ROLES.PLATFORM_ADMIN,
    createdAt: existingData?.createdAt ?? FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };

  await adminRef.set(data, { merge: false });

  // An account promoted from a previous release (or from another role)
  // would otherwise be left behind in users/, where authenticateUser
  // would still resolve it — remove that copy so superAdmins/ is the one
  // record for this admin.
  if (legacySnap.exists) {
    await legacyUserRef.delete();
    console.log(`Removed the leftover users/${uid} document; the record now lives in superAdmins/.`);
  }

  console.log(`\n✔ ${email} is now a platform_admin in ${COLLECTIONS.SUPER_ADMINS}/${uid}.`);
  console.log("They can log in at /platform-admin using this email and password.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Failed to create platform admin:", err);
  process.exit(1);
});
