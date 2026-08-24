import { db } from "@/server/config/firebase";
import { COLLECTIONS } from "@/lib/shared";
import type { SuperAdminDocument, UserDocument } from "@/server/types/firestore";

/**
 * Widens a lean superAdmins/ document into the UserDocument shape the rest
 * of the app reads. The fields an admin never has (phone, salon,
 * verification lifecycle) aren't stored — they're filled in as empty here
 * so req.user and serializeUser stay uniform across both collections.
 */
function toUserDocument(admin: SuperAdminDocument): UserDocument {
  return {
    ...admin,
    phone: "",
    salonId: null,
    verificationStatus: null,
    rejectionReason: null,
    suspendedReason: null,
    verifiedAt: null,
    verifiedBy: null,
  };
}

/**
 * Account documents live in one of two collections: platform (super)
 * admins in superAdmins/, everyone else in users/. Every lookup by uid has
 * to consider both — this helper is the single place that knows that, so
 * no call site has to guess which collection an account is in.
 */
export async function getAccountDoc(
  uid: string,
): Promise<{ doc: UserDocument; collection: string } | null> {
  const [superAdminSnap, userSnap] = await Promise.all([
    db.collection(COLLECTIONS.SUPER_ADMINS).doc(uid).get(),
    db.collection(COLLECTIONS.USERS).doc(uid).get(),
  ]);

  if (superAdminSnap.exists) {
    return {
      doc: toUserDocument({
        ...(superAdminSnap.data() as SuperAdminDocument),
        id: superAdminSnap.id,
      }),
      collection: COLLECTIONS.SUPER_ADMINS,
    };
  }
  if (userSnap.exists) {
    return {
      doc: { ...(userSnap.data() as UserDocument), id: userSnap.id },
      collection: COLLECTIONS.USERS,
    };
  }
  return null;
}
