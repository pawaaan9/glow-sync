import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { db } from "@/server/config/firebase";
import { AUDIT_ACTIONS, COLLECTIONS, ROLES, SALON_SUBCOLLECTIONS, type TimeOffCreateInput } from "@/lib/shared";
import { ApiError } from "@/server/lib/apiError";
import { createAuditLog } from "@/server/lib/auditLog";
import { serializeTimeOff } from "@/server/lib/serializers";
import type { TimeOffDocument } from "@/server/types/firestore";

function timeOffRef(salonId: string) {
  return db.collection(COLLECTIONS.SALONS).doc(salonId).collection(SALON_SUBCOLLECTIONS.TIME_OFF);
}

/** Every blocked-time record for a salon: staff leave and whole-salon blocks alike. */
export async function listTimeOff(salonId: string) {
  const snap = await timeOffRef(salonId).get();
  return snap.docs
    .map((d) => serializeTimeOff({ ...(d.data() as TimeOffDocument), id: d.id }))
    .sort((a, b) => a.startAt.localeCompare(b.startAt));
}

/** Salon-wide blocked time — staffId is always null here (per-staff leave lives in staffService). */
export async function addSalonBlockedTime(
  salonId: string,
  ownerUid: string,
  input: Omit<TimeOffCreateInput, "staffId">,
) {
  const ref = timeOffRef(salonId).doc();
  const now = FieldValue.serverTimestamp();
  const data: TimeOffDocument = {
    id: ref.id,
    salonId,
    staffId: null,
    startAt: Timestamp.fromDate(new Date(input.startAt)),
    endAt: Timestamp.fromDate(new Date(input.endAt)),
    reason: input.reason,
    createdAt: now,
    createdBy: ownerUid,
  };
  await ref.set(data);

  createAuditLog({
    action: AUDIT_ACTIONS.TIME_OFF_ADDED,
    actorId: ownerUid,
    actorRole: ROLES.SALON_OWNER,
    targetSalonId: salonId,
    metadata: { timeOffId: ref.id },
  });

  const saved = await ref.get();
  return serializeTimeOff({ ...(saved.data() as TimeOffDocument), id: saved.id });
}

export async function removeTimeOff(salonId: string, ownerUid: string, timeOffId: string) {
  const ref = timeOffRef(salonId).doc(timeOffId);
  const snap = await ref.get();
  if (!snap.exists) throw ApiError.notFound("Blocked time not found");

  await ref.delete();

  createAuditLog({
    action: AUDIT_ACTIONS.TIME_OFF_REMOVED,
    actorId: ownerUid,
    actorRole: ROLES.SALON_OWNER,
    targetSalonId: salonId,
    metadata: { timeOffId },
  });
}
