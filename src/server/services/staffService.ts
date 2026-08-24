import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { db } from "@/server/config/firebase";
import {
  AUDIT_ACTIONS,
  COLLECTIONS,
  ROLES,
  SALON_SUBCOLLECTIONS,
  type StaffInput,
  type StaffPatchInput,
  type StaffQuery,
  type TimeOffCreateInput,
} from "@/lib/shared";
import { ApiError } from "@/server/lib/apiError";
import { createAuditLog } from "@/server/lib/auditLog";
import { getOrderedDocs } from "@/server/lib/orderedQuery";
import { serializeStaff, serializeTimeOff } from "@/server/lib/serializers";
import type { StaffDocument, TimeOffDocument } from "@/server/types/firestore";

function staffRef(salonId: string) {
  return db.collection(COLLECTIONS.SALONS).doc(salonId).collection(SALON_SUBCOLLECTIONS.STAFF);
}

function timeOffRef(salonId: string) {
  return db.collection(COLLECTIONS.SALONS).doc(salonId).collection(SALON_SUBCOLLECTIONS.TIME_OFF);
}

export async function listStaff(salonId: string, query: StaffQuery) {
  let base: FirebaseFirestore.Query = staffRef(salonId);
  if (query.isActive !== undefined) base = base.where("isActive", "==", query.isActive);

  const docs = await getOrderedDocs(base, { field: query.sortBy, direction: query.sortOrder });
  let items = docs.map((d) => serializeStaff({ ...(d.data() as StaffDocument), id: d.id }));

  if (query.search) {
    const needle = query.search.trim().toLowerCase();
    items = items.filter((s) => s.fullName.toLowerCase().includes(needle));
  }

  const offset = (query.page - 1) * query.limit;
  const page = items.slice(offset, offset + query.limit);

  return {
    items: page,
    page: query.page,
    limit: query.limit,
    total: items.length,
    totalPages: Math.max(1, Math.ceil(items.length / query.limit)),
  };
}

export async function getStaffMember(salonId: string, staffId: string) {
  const snap = await staffRef(salonId).doc(staffId).get();
  if (!snap.exists) throw ApiError.notFound("Staff member not found");
  return serializeStaff({ ...(snap.data() as StaffDocument), id: snap.id });
}

export async function createStaffMember(salonId: string, ownerUid: string, input: StaffInput) {
  const ref = staffRef(salonId).doc();
  const now = FieldValue.serverTimestamp();
  const data: StaffDocument = {
    id: ref.id,
    salonId,
    fullName: input.fullName,
    phone: input.phone,
    email: input.email ?? null,
    photoUrl: null,
    jobTitle: input.jobTitle,
    bio: input.bio ?? null,
    assignedServiceIds: input.assignedServiceIds,
    weeklyAvailability: input.weeklyAvailability,
    isActive: input.isActive,
    canAcceptBookings: input.canAcceptBookings,
    createdAt: now,
    updatedAt: now,
  };
  await ref.set(data);

  createAuditLog({
    action: AUDIT_ACTIONS.STAFF_CREATED,
    actorId: ownerUid,
    actorRole: ROLES.SALON_OWNER,
    targetSalonId: salonId,
    metadata: { staffId: ref.id, name: input.fullName },
  });

  return getStaffMember(salonId, ref.id);
}

export async function updateStaffMember(
  salonId: string,
  ownerUid: string,
  staffId: string,
  input: StaffPatchInput,
) {
  const ref = staffRef(salonId).doc(staffId);
  const snap = await ref.get();
  if (!snap.exists) throw ApiError.notFound("Staff member not found");

  await ref.update({ ...input, updatedAt: FieldValue.serverTimestamp() });

  createAuditLog({
    action: AUDIT_ACTIONS.STAFF_UPDATED,
    actorId: ownerUid,
    actorRole: ROLES.SALON_OWNER,
    targetSalonId: salonId,
    metadata: { staffId },
  });

  return getStaffMember(salonId, staffId);
}

export async function setStaffActive(
  salonId: string,
  ownerUid: string,
  staffId: string,
  isActive: boolean,
) {
  const ref = staffRef(salonId).doc(staffId);
  const snap = await ref.get();
  if (!snap.exists) throw ApiError.notFound("Staff member not found");

  await ref.update({ isActive, updatedAt: FieldValue.serverTimestamp() });

  createAuditLog({
    action: AUDIT_ACTIONS.STAFF_STATUS_CHANGED,
    actorId: ownerUid,
    actorRole: ROLES.SALON_OWNER,
    targetSalonId: salonId,
    metadata: { staffId, isActive },
  });

  return getStaffMember(salonId, staffId);
}

/** Staff leave lives in the salon-wide timeOff subcollection, scoped by staffId. */
export async function listStaffLeave(salonId: string, staffId: string) {
  const snap = await timeOffRef(salonId).where("staffId", "==", staffId).get();
  return snap.docs
    .map((d) => serializeTimeOff({ ...(d.data() as TimeOffDocument), id: d.id }))
    .sort((a, b) => a.startAt.localeCompare(b.startAt));
}

export async function addStaffLeave(
  salonId: string,
  ownerUid: string,
  staffId: string,
  input: Omit<TimeOffCreateInput, "staffId">,
) {
  const staffSnap = await staffRef(salonId).doc(staffId).get();
  if (!staffSnap.exists) throw ApiError.notFound("Staff member not found");

  const ref = timeOffRef(salonId).doc();
  const now = FieldValue.serverTimestamp();
  const data: TimeOffDocument = {
    id: ref.id,
    salonId,
    staffId,
    startAt: Timestamp.fromDate(new Date(input.startAt)),
    endAt: Timestamp.fromDate(new Date(input.endAt)),
    reason: input.reason,
    createdAt: now,
    createdBy: ownerUid,
  };
  await ref.set(data);

  createAuditLog({
    action: AUDIT_ACTIONS.STAFF_LEAVE_ADDED,
    actorId: ownerUid,
    actorRole: ROLES.SALON_OWNER,
    targetSalonId: salonId,
    metadata: { staffId, leaveId: ref.id },
  });

  const saved = await ref.get();
  return serializeTimeOff({ ...(saved.data() as TimeOffDocument), id: saved.id });
}

export async function removeStaffLeave(
  salonId: string,
  ownerUid: string,
  staffId: string,
  leaveId: string,
) {
  const ref = timeOffRef(salonId).doc(leaveId);
  const snap = await ref.get();
  if (!snap.exists || (snap.data() as TimeOffDocument).staffId !== staffId) {
    throw ApiError.notFound("Leave record not found");
  }

  await ref.delete();

  createAuditLog({
    action: AUDIT_ACTIONS.STAFF_LEAVE_REMOVED,
    actorId: ownerUid,
    actorRole: ROLES.SALON_OWNER,
    targetSalonId: salonId,
    metadata: { staffId, leaveId },
  });
}
