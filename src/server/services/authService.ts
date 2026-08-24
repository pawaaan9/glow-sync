import { FieldValue } from "firebase-admin/firestore";
import { auth, db } from "@/server/config/firebase";
import {
  AUDIT_ACTIONS,
  COLLECTIONS,
  NOTIFICATION_TYPES,
  ROLES,
  SALON_STATUS,
  VERIFICATION_HISTORY_ACTIONS,
  VERIFICATION_STATUS,
  type RegisterSalonOwnerInput,
} from "@/lib/shared";
import { ApiError } from "@/server/lib/apiError";
import { createAuditLog } from "@/server/lib/auditLog";
import { createNotification } from "@/server/lib/notifications";
import { generateUniqueSalonSlug } from "@/server/lib/slug";
import { createVerificationHistory } from "@/server/lib/verificationHistory";
import type { SalonDocument, UserDocument } from "@/server/types/firestore";

export interface RegisterSalonOwnerResult {
  userId: string;
  email: string;
  salonId: string;
}

/**
 * Creates the Firebase Auth user, the users/ and salons/ documents, the
 * initial verification-history entry, an audit-log entry, and a
 * notification for platform admins — all as one operation.
 *
 * The Auth user and the Firestore writes can't be part of a single atomic
 * transaction (they're different systems), so if the Firestore batch fails
 * after the Auth user was created, we delete the just-created Auth user
 * before re-throwing, rather than leaving an orphaned account with no
 * profile behind.
 */
export async function registerSalonOwner(
  input: RegisterSalonOwnerInput,
): Promise<RegisterSalonOwnerResult> {
  const { owner, salon } = input;

  let uid: string;
  try {
    const userRecord = await auth.createUser({
      email: owner.email,
      password: owner.password,
      displayName: owner.fullName,
      phoneNumber: undefined,
    });
    uid = userRecord.uid;
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code === "auth/email-already-exists") {
      throw ApiError.conflict("An account with this email already exists");
    }
    if (code === "auth/invalid-password") {
      throw ApiError.validation("Password does not meet security requirements");
    }
    throw err;
  }

  try {
    const slug = await generateUniqueSalonSlug(salon.name);

    const userRef = db.collection(COLLECTIONS.USERS).doc(uid);
    const salonRef = db.collection(COLLECTIONS.SALONS).doc();

    const userDoc: UserDocument = {
      id: uid,
      fullName: owner.fullName,
      email: owner.email,
      phone: owner.phone,
      role: ROLES.SALON_OWNER,
      salonId: salonRef.id,
      verificationStatus: VERIFICATION_STATUS.PENDING_VERIFICATION,
      rejectionReason: null,
      suspendedReason: null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      verifiedAt: null,
      verifiedBy: null,
    };

    const salonDoc: SalonDocument = {
      id: salonRef.id,
      ownerId: uid,
      name: salon.name,
      slug,
      businessPhone: salon.businessPhone,
      businessEmail: salon.businessEmail,
      address: salon.address,
      city: salon.city,
      district: salon.district,
      businessRegistrationNumber: salon.businessRegistrationNumber || null,
      description: salon.description,
      category: salon.category,
      numberOfStaff: salon.numberOfStaff,
      logoUrl: null,
      verificationDocumentPath: null,
      status: SALON_STATUS.PENDING_APPROVAL,
      rejectionReason: null,
      suspendedReason: null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      approvedAt: null,
      approvedBy: null,
    };

    const batch = db.batch();
    batch.set(userRef, userDoc);
    batch.set(salonRef, salonDoc);

    createVerificationHistory(
      {
        salonId: salonRef.id,
        ownerId: uid,
        previousStatus: null,
        newStatus: VERIFICATION_STATUS.PENDING_VERIFICATION,
        action: VERIFICATION_HISTORY_ACTIONS.SUBMITTED,
        performedBy: uid,
      },
      batch,
    );

    createAuditLog(
      {
        action: AUDIT_ACTIONS.SALON_OWNER_REGISTERED,
        actorId: uid,
        actorRole: ROLES.SALON_OWNER,
        targetUserId: uid,
        targetSalonId: salonRef.id,
        metadata: { salonName: salon.name },
      },
      batch,
    );

    createNotification(
      {
        recipientRole: ROLES.PLATFORM_ADMIN,
        title: "New salon application",
        message: `${salon.name} submitted an application awaiting review.`,
        type: NOTIFICATION_TYPES.SALON_APPLICATION_SUBMITTED,
        relatedSalonId: salonRef.id,
      },
      batch,
    );

    await batch.commit();

    return { userId: uid, email: owner.email, salonId: salonRef.id };
  } catch (err) {
    await auth.deleteUser(uid).catch((cleanupErr) => {
      console.error(
        `Failed to roll back orphaned Auth user ${uid} after registration failure:`,
        cleanupErr,
      );
    });
    throw err;
  }
}
