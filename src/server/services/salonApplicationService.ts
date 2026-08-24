import { FieldValue } from "firebase-admin/firestore";
import { db } from "@/server/config/firebase";
import {
  AUDIT_ACTIONS,
  COLLECTIONS,
  NOTIFICATION_TYPES,
  ROLES,
  SALON_STATUS,
  VERIFICATION_HISTORY_ACTIONS,
  VERIFICATION_STATUS,
  type ResubmitSalonApplicationInput,
} from "@/lib/shared";
import { ApiError } from "@/server/lib/apiError";
import { createAuditLog } from "@/server/lib/auditLog";
import { createNotification } from "@/server/lib/notifications";
import { createVerificationHistory } from "@/server/lib/verificationHistory";
import type { SalonDocument, UserDocument } from "@/server/types/firestore";

async function loadSalonAndOwner(tx: FirebaseFirestore.Transaction, salonId: string) {
  const salonRef = db.collection(COLLECTIONS.SALONS).doc(salonId);
  const salonSnap = await tx.get(salonRef);
  if (!salonSnap.exists) {
    throw ApiError.notFound("Salon application not found");
  }
  const salon = salonSnap.data() as SalonDocument;

  const ownerRef = db.collection(COLLECTIONS.USERS).doc(salon.ownerId);
  const ownerSnap = await tx.get(ownerRef);
  if (!ownerSnap.exists) {
    throw ApiError.notFound("Salon owner account not found");
  }
  const owner = ownerSnap.data() as UserDocument;

  return { salonRef, salon, ownerRef, owner };
}

export async function approveSalonApplication(salonId: string, adminUid: string) {
  await db.runTransaction(async (tx) => {
    const { salonRef, salon, ownerRef, owner } = await loadSalonAndOwner(tx, salonId);

    if (salon.status !== SALON_STATUS.PENDING_APPROVAL) {
      throw ApiError.conflict(
        `Cannot approve: salon status is ${salon.status}, expected ${SALON_STATUS.PENDING_APPROVAL}`,
      );
    }
    if (owner.verificationStatus !== VERIFICATION_STATUS.PENDING_VERIFICATION) {
      throw ApiError.conflict(
        `Cannot approve: owner status is ${owner.verificationStatus}, expected ${VERIFICATION_STATUS.PENDING_VERIFICATION}`,
      );
    }

    const now = FieldValue.serverTimestamp();

    tx.update(ownerRef, {
      verificationStatus: VERIFICATION_STATUS.APPROVED,
      rejectionReason: null,
      suspendedReason: null,
      verifiedAt: now,
      verifiedBy: adminUid,
      updatedAt: now,
    });

    tx.update(salonRef, {
      status: SALON_STATUS.ACTIVE,
      rejectionReason: null,
      suspendedReason: null,
      approvedAt: now,
      approvedBy: adminUid,
      updatedAt: now,
    });

    createVerificationHistory(
      {
        salonId,
        ownerId: salon.ownerId,
        previousStatus: salon.status,
        newStatus: SALON_STATUS.ACTIVE,
        action: VERIFICATION_HISTORY_ACTIONS.APPROVED,
        performedBy: adminUid,
      },
      tx,
    );

    createAuditLog(
      {
        action: AUDIT_ACTIONS.APPLICATION_APPROVED,
        actorId: adminUid,
        actorRole: ROLES.PLATFORM_ADMIN,
        targetUserId: salon.ownerId,
        targetSalonId: salonId,
      },
      tx,
    );

    createNotification(
      {
        recipientId: salon.ownerId,
        title: "Application approved",
        message: `${salon.name} has been approved. You can now access your salon dashboard.`,
        type: NOTIFICATION_TYPES.APPLICATION_APPROVED,
        relatedSalonId: salonId,
      },
      tx,
    );
  });
}

export async function rejectSalonApplication(salonId: string, adminUid: string, reason: string) {
  await db.runTransaction(async (tx) => {
    const { salonRef, salon, ownerRef, owner } = await loadSalonAndOwner(tx, salonId);

    if (salon.status !== SALON_STATUS.PENDING_APPROVAL) {
      throw ApiError.conflict(
        `Cannot reject: salon status is ${salon.status}, expected ${SALON_STATUS.PENDING_APPROVAL}`,
      );
    }
    if (owner.verificationStatus !== VERIFICATION_STATUS.PENDING_VERIFICATION) {
      throw ApiError.conflict(
        `Cannot reject: owner status is ${owner.verificationStatus}, expected ${VERIFICATION_STATUS.PENDING_VERIFICATION}`,
      );
    }

    const now = FieldValue.serverTimestamp();

    tx.update(ownerRef, {
      verificationStatus: VERIFICATION_STATUS.REJECTED,
      rejectionReason: reason,
      updatedAt: now,
    });

    tx.update(salonRef, {
      status: SALON_STATUS.REJECTED,
      rejectionReason: reason,
      updatedAt: now,
    });

    createVerificationHistory(
      {
        salonId,
        ownerId: salon.ownerId,
        previousStatus: salon.status,
        newStatus: SALON_STATUS.REJECTED,
        action: VERIFICATION_HISTORY_ACTIONS.REJECTED,
        reason,
        performedBy: adminUid,
      },
      tx,
    );

    createAuditLog(
      {
        action: AUDIT_ACTIONS.APPLICATION_REJECTED,
        actorId: adminUid,
        actorRole: ROLES.PLATFORM_ADMIN,
        targetUserId: salon.ownerId,
        targetSalonId: salonId,
        metadata: { reason },
      },
      tx,
    );

    createNotification(
      {
        recipientId: salon.ownerId,
        title: "Application rejected",
        message: `Your application for ${salon.name} was rejected: ${reason}`,
        type: NOTIFICATION_TYPES.APPLICATION_REJECTED,
        relatedSalonId: salonId,
      },
      tx,
    );
  });
}

export async function suspendSalon(salonId: string, adminUid: string, reason: string) {
  await db.runTransaction(async (tx) => {
    const { salonRef, salon, ownerRef, owner } = await loadSalonAndOwner(tx, salonId);

    if (salon.status !== SALON_STATUS.ACTIVE) {
      throw ApiError.conflict(
        `Cannot suspend: salon status is ${salon.status}, expected ${SALON_STATUS.ACTIVE}`,
      );
    }
    if (owner.verificationStatus !== VERIFICATION_STATUS.APPROVED) {
      throw ApiError.conflict(
        `Cannot suspend: owner status is ${owner.verificationStatus}, expected ${VERIFICATION_STATUS.APPROVED}`,
      );
    }

    const now = FieldValue.serverTimestamp();

    tx.update(ownerRef, {
      verificationStatus: VERIFICATION_STATUS.SUSPENDED,
      suspendedReason: reason,
      updatedAt: now,
    });

    tx.update(salonRef, {
      status: SALON_STATUS.SUSPENDED,
      suspendedReason: reason,
      updatedAt: now,
    });

    createVerificationHistory(
      {
        salonId,
        ownerId: salon.ownerId,
        previousStatus: salon.status,
        newStatus: SALON_STATUS.SUSPENDED,
        action: VERIFICATION_HISTORY_ACTIONS.SUSPENDED,
        reason,
        performedBy: adminUid,
      },
      tx,
    );

    createAuditLog(
      {
        action: AUDIT_ACTIONS.SALON_SUSPENDED,
        actorId: adminUid,
        actorRole: ROLES.PLATFORM_ADMIN,
        targetUserId: salon.ownerId,
        targetSalonId: salonId,
        metadata: { reason },
      },
      tx,
    );

    createNotification(
      {
        recipientId: salon.ownerId,
        title: "Salon suspended",
        message: `${salon.name} has been suspended: ${reason}`,
        type: NOTIFICATION_TYPES.SALON_SUSPENDED,
        relatedSalonId: salonId,
      },
      tx,
    );
  });
}

export async function reactivateSalon(salonId: string, adminUid: string) {
  await db.runTransaction(async (tx) => {
    const { salonRef, salon, ownerRef, owner } = await loadSalonAndOwner(tx, salonId);

    if (salon.status !== SALON_STATUS.SUSPENDED) {
      throw ApiError.conflict(
        `Cannot reactivate: salon status is ${salon.status}, expected ${SALON_STATUS.SUSPENDED}`,
      );
    }
    if (owner.verificationStatus !== VERIFICATION_STATUS.SUSPENDED) {
      throw ApiError.conflict(
        `Cannot reactivate: owner status is ${owner.verificationStatus}, expected ${VERIFICATION_STATUS.SUSPENDED}`,
      );
    }

    const now = FieldValue.serverTimestamp();

    tx.update(ownerRef, {
      verificationStatus: VERIFICATION_STATUS.APPROVED,
      suspendedReason: null,
      updatedAt: now,
    });

    tx.update(salonRef, {
      status: SALON_STATUS.ACTIVE,
      suspendedReason: null,
      updatedAt: now,
    });

    createVerificationHistory(
      {
        salonId,
        ownerId: salon.ownerId,
        previousStatus: salon.status,
        newStatus: SALON_STATUS.ACTIVE,
        action: VERIFICATION_HISTORY_ACTIONS.REACTIVATED,
        performedBy: adminUid,
      },
      tx,
    );

    createAuditLog(
      {
        action: AUDIT_ACTIONS.SALON_REACTIVATED,
        actorId: adminUid,
        actorRole: ROLES.PLATFORM_ADMIN,
        targetUserId: salon.ownerId,
        targetSalonId: salonId,
      },
      tx,
    );

    createNotification(
      {
        recipientId: salon.ownerId,
        title: "Salon reactivated",
        message: `${salon.name} has been reactivated. Salon-management access has been restored.`,
        type: NOTIFICATION_TYPES.SALON_REACTIVATED,
        relatedSalonId: salonId,
      },
      tx,
    );
  });
}

/** A rejected owner edits and resubmits their application for another review. */
export async function resubmitSalonApplication(
  salonId: string,
  ownerUid: string,
  input: ResubmitSalonApplicationInput,
) {
  await db.runTransaction(async (tx) => {
    const { salonRef, salon, ownerRef, owner } = await loadSalonAndOwner(tx, salonId);

    if (salon.ownerId !== ownerUid) {
      throw ApiError.forbidden("You do not have access to this application");
    }
    if (salon.status !== SALON_STATUS.REJECTED) {
      throw ApiError.conflict(
        `Cannot resubmit: salon status is ${salon.status}, expected ${SALON_STATUS.REJECTED}`,
      );
    }
    if (owner.verificationStatus !== VERIFICATION_STATUS.REJECTED) {
      throw ApiError.conflict(
        `Cannot resubmit: owner status is ${owner.verificationStatus}, expected ${VERIFICATION_STATUS.REJECTED}`,
      );
    }

    const now = FieldValue.serverTimestamp();

    tx.update(ownerRef, {
      verificationStatus: VERIFICATION_STATUS.PENDING_VERIFICATION,
      updatedAt: now,
    });

    tx.update(salonRef, {
      ...input.salon,
      status: SALON_STATUS.PENDING_APPROVAL,
      updatedAt: now,
    });

    createVerificationHistory(
      {
        salonId,
        ownerId: ownerUid,
        previousStatus: salon.status,
        newStatus: SALON_STATUS.PENDING_APPROVAL,
        action: VERIFICATION_HISTORY_ACTIONS.RESUBMITTED,
        performedBy: ownerUid,
      },
      tx,
    );

    createAuditLog(
      {
        action: AUDIT_ACTIONS.APPLICATION_RESUBMITTED,
        actorId: ownerUid,
        actorRole: ROLES.SALON_OWNER,
        targetUserId: ownerUid,
        targetSalonId: salonId,
      },
      tx,
    );

    createNotification(
      {
        recipientRole: ROLES.PLATFORM_ADMIN,
        title: "Application resubmitted",
        message: `${salon.name} resubmitted their application for review.`,
        type: NOTIFICATION_TYPES.APPLICATION_RESUBMITTED,
        relatedSalonId: salonId,
      },
      tx,
    );
  });
}
