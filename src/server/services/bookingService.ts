import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { db } from "@/server/config/firebase";
import {
  ACTIVE_BOOKING_STATUSES,
  AUDIT_ACTIONS,
  BOOKING_STATUS,
  COLLECTIONS,
  NOTIFICATION_TYPES,
  ROLES,
  SALON_SUBCOLLECTIONS,
  type BookingAssignStaffInput,
  type BookingCreateInput,
  type BookingRescheduleInput,
  type BookingStaffDecisionInput,
  type BookingStatus,
  type BookingsQuery,
} from "@/lib/shared";
import { ApiError } from "@/server/lib/apiError";
import { assertStaffAvailable, assertWithinSalonHours } from "@/server/lib/availability";
import { createAuditLog } from "@/server/lib/auditLog";
import { findOrCreateCustomerInTx, applyBookingOutcomeToCustomerInTx } from "@/server/services/customerService";
import { createNotification } from "@/server/lib/notifications";
import { getOrderedDocs } from "@/server/lib/orderedQuery";
import { serializeBooking } from "@/server/lib/serializers";
import type {
  BookingDocument,
  BookingHistoryEntry,
  SalonDocument,
  ServiceDocument,
  StaffDocument,
  TimeOffDocument,
} from "@/server/types/firestore";

function bookingsCollection() {
  return db.collection(COLLECTIONS.BOOKINGS);
}

function servicesRef(salonId: string) {
  return db.collection(COLLECTIONS.SALONS).doc(salonId).collection(SALON_SUBCOLLECTIONS.SERVICES);
}

function staffRef(salonId: string) {
  return db.collection(COLLECTIONS.SALONS).doc(salonId).collection(SALON_SUBCOLLECTIONS.STAFF);
}

function timeOffRef(salonId: string) {
  return db.collection(COLLECTIONS.SALONS).doc(salonId).collection(SALON_SUBCOLLECTIONS.TIME_OFF);
}

async function loadSalonDoc(salonId: string): Promise<SalonDocument> {
  const snap = await db.collection(COLLECTIONS.SALONS).doc(salonId).get();
  if (!snap.exists) throw ApiError.notFound("Salon not found");
  return snap.data() as SalonDocument;
}

async function loadBookingDoc(salonId: string, bookingId: string) {
  const ref = bookingsCollection().doc(bookingId);
  const snap = await ref.get();
  if (!snap.exists) throw ApiError.notFound("Booking not found");
  const booking = snap.data() as BookingDocument;
  if (booking.salonId !== salonId) throw ApiError.forbidden("You do not have access to this booking");
  return { ref, booking };
}

/** No booking-history filter needed: this collides only with the same staff member's own bookings. */
async function assertNoOverlapForStaff(
  staffId: string,
  start: Date,
  end: Date,
  excludeBookingId?: string,
) {
  const snap = await bookingsCollection().where("staffId", "==", staffId).get();
  for (const doc of snap.docs) {
    if (doc.id === excludeBookingId) continue;
    const b = doc.data() as BookingDocument;
    if (!ACTIVE_BOOKING_STATUSES.includes(b.status)) continue;
    const bStart = (b.startAt as Timestamp).toDate();
    const bEnd = (b.endAt as Timestamp).toDate();
    if (start < bEnd && end > bStart) {
      throw ApiError.conflict("This staff member already has a booking at the selected time");
    }
  }
}

async function assertNoTimeOffConflict(salonId: string, staffId: string | null, start: Date, end: Date) {
  const snap = await timeOffRef(salonId).get();
  for (const doc of snap.docs) {
    const t = doc.data() as TimeOffDocument;
    if (t.staffId !== null && t.staffId !== staffId) continue;
    const tStart = (t.startAt as Timestamp).toDate();
    const tEnd = (t.endAt as Timestamp).toDate();
    if (start < tEnd && end > tStart) {
      throw ApiError.conflict(
        t.staffId ? "The selected staff member is on leave at this time" : "The salon has blocked this time",
      );
    }
  }
}

async function loadActiveService(salonId: string, serviceId: string): Promise<ServiceDocument> {
  const snap = await servicesRef(salonId).doc(serviceId).get();
  if (!snap.exists) throw ApiError.notFound("Service not found");
  const service = snap.data() as ServiceDocument;
  if (!service.isActive) throw ApiError.conflict("This service is not currently offered");
  return service;
}

async function loadAssignableStaff(
  salonId: string,
  staffId: string,
  serviceId: string,
): Promise<StaffDocument> {
  const snap = await staffRef(salonId).doc(staffId).get();
  if (!snap.exists) throw ApiError.notFound("Staff member not found");
  const staff = snap.data() as StaffDocument;
  if (!staff.isActive) throw ApiError.conflict("This staff member is not currently active");
  if (!staff.assignedServiceIds.includes(serviceId)) {
    throw ApiError.conflict(`${staff.fullName} does not provide the selected service`);
  }
  return staff;
}

function appendHistory(
  history: BookingHistoryEntry[],
  status: BookingStatus,
  changedBy: string,
  note: string | null = null,
): BookingHistoryEntry[] {
  return [...history, { status, changedAt: Timestamp.now(), changedBy, note }];
}

export async function listBookings(salonId: string, query: BookingsQuery) {
  let base: FirebaseFirestore.Query = bookingsCollection().where("salonId", "==", salonId);
  if (query.status) base = base.where("status", "==", query.status);
  if (query.staffId) base = base.where("staffId", "==", query.staffId);
  if (query.serviceId) base = base.where("serviceId", "==", query.serviceId);

  const docs = await getOrderedDocs(base, { field: query.sortBy, direction: "desc" });
  let items = docs.map((d) => serializeBooking({ ...(d.data() as BookingDocument), id: d.id }));

  if (query.dateFrom) items = items.filter((b) => b.startAt >= query.dateFrom!);
  if (query.dateTo) items = items.filter((b) => b.startAt <= query.dateTo!);
  if (query.search) {
    const needle = query.search.trim().toLowerCase();
    items = items.filter(
      (b) =>
        b.customerName.toLowerCase().includes(needle) || b.customerPhone.includes(needle),
    );
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

export async function getBooking(salonId: string, bookingId: string) {
  const { booking } = await loadBookingDoc(salonId, bookingId);
  return serializeBooking(booking);
}

/** Manual (walk-in/phone/WhatsApp) booking created by the owner. */
export async function createBooking(salonId: string, ownerUid: string, input: BookingCreateInput) {
  const salon = await loadSalonDoc(salonId);
  const service = await loadActiveService(salonId, input.serviceId);

  const startAt = new Date(input.startAt);
  const endAt = new Date(startAt.getTime() + service.durationMinutes * 60_000);

  assertWithinSalonHours(salon, startAt, endAt);

  let staff: StaffDocument | null = null;
  if (input.staffId) {
    staff = await loadAssignableStaff(salonId, input.staffId, input.serviceId);
    assertStaffAvailable(staff, startAt, endAt);
    await assertNoOverlapForStaff(staff.id, startAt, endAt);
    await assertNoTimeOffConflict(salonId, staff.id, startAt, endAt);
  }

  const bookingId = await db.runTransaction(async (tx) => {
    const customerId = await findOrCreateCustomerInTx(tx, salonId, {
      fullName: input.customerName,
      phone: input.customerPhone,
      email: input.customerEmail ?? null,
    });

    const ref = bookingsCollection().doc();
    const now = FieldValue.serverTimestamp();
    const status: BookingStatus = staff
      ? staff.canAcceptBookings
        ? BOOKING_STATUS.PENDING_STAFF_ACCEPTANCE
        : BOOKING_STATUS.CONFIRMED
      : BOOKING_STATUS.PENDING_SALON_REVIEW;

    const data: BookingDocument = {
      id: ref.id,
      salonId,
      customerId,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      customerEmail: input.customerEmail ?? null,
      serviceId: service.id,
      serviceName: service.name,
      serviceDurationMinutes: service.durationMinutes,
      servicePriceLkr: service.discountedPriceLkr ?? service.priceLkr,
      staffId: staff?.id ?? null,
      staffName: staff?.fullName ?? null,
      status,
      source: input.source,
      startAt: Timestamp.fromDate(startAt),
      endAt: Timestamp.fromDate(endAt),
      internalNotes: input.internalNotes ?? null,
      declineReason: null,
      cancellationReason: null,
      history: [{ status, changedAt: Timestamp.now(), changedBy: ownerUid, note: null }],
      createdAt: now,
      updatedAt: now,
      createdBy: ownerUid,
    };
    tx.set(ref, data);
    return ref.id;
  });

  createAuditLog({
    action: AUDIT_ACTIONS.BOOKING_CREATED,
    actorId: ownerUid,
    actorRole: ROLES.SALON_OWNER,
    targetSalonId: salonId,
    metadata: { bookingId, source: input.source },
  });

  return getBooking(salonId, bookingId);
}

export async function assignStaff(
  salonId: string,
  ownerUid: string,
  bookingId: string,
  input: BookingAssignStaffInput,
) {
  const { ref, booking } = await loadBookingDoc(salonId, bookingId);
  if (
    booking.status !== BOOKING_STATUS.PENDING_SALON_REVIEW &&
    booking.status !== BOOKING_STATUS.REJECTED_BY_STAFF
  ) {
    throw ApiError.conflict(`Cannot assign staff while the booking is ${booking.status}`);
  }

  const startAt = (booking.startAt as Timestamp).toDate();
  const endAt = (booking.endAt as Timestamp).toDate();

  const staff = await loadAssignableStaff(salonId, input.staffId, booking.serviceId);
  assertStaffAvailable(staff, startAt, endAt);
  await assertNoOverlapForStaff(staff.id, startAt, endAt, bookingId);
  await assertNoTimeOffConflict(salonId, staff.id, startAt, endAt);

  const status: BookingStatus = staff.canAcceptBookings
    ? BOOKING_STATUS.PENDING_STAFF_ACCEPTANCE
    : BOOKING_STATUS.CONFIRMED;

  await ref.update({
    staffId: staff.id,
    staffName: staff.fullName,
    status,
    history: appendHistory(booking.history, status, ownerUid, `Assigned to ${staff.fullName}`),
    updatedAt: FieldValue.serverTimestamp(),
  });

  createAuditLog({
    action: AUDIT_ACTIONS.BOOKING_STAFF_ASSIGNED,
    actorId: ownerUid,
    actorRole: ROLES.SALON_OWNER,
    targetSalonId: salonId,
    metadata: { bookingId, staffId: staff.id },
  });

  return getBooking(salonId, bookingId);
}

/**
 * Records a staff member's accept/reject decision. There is no separate
 * staff login in this build, so the owner records the decision on the
 * staff member's behalf from the booking detail screen — the workflow and
 * status transitions are identical to a real staff-portal decision.
 */
export async function recordStaffDecision(
  salonId: string,
  ownerUid: string,
  bookingId: string,
  input: BookingStaffDecisionInput,
) {
  const { ref, booking } = await loadBookingDoc(salonId, bookingId);
  if (booking.status !== BOOKING_STATUS.PENDING_STAFF_ACCEPTANCE) {
    throw ApiError.conflict(`Cannot record a staff decision while the booking is ${booking.status}`);
  }

  const status: BookingStatus =
    input.decision === "ACCEPTED" ? BOOKING_STATUS.CONFIRMED : BOOKING_STATUS.REJECTED_BY_STAFF;

  await ref.update({
    status,
    history: appendHistory(booking.history, status, booking.staffId ?? ownerUid, input.reason ?? null),
    updatedAt: FieldValue.serverTimestamp(),
  });

  createAuditLog({
    action: AUDIT_ACTIONS.BOOKING_STAFF_DECISION,
    actorId: ownerUid,
    actorRole: ROLES.SALON_OWNER,
    targetSalonId: salonId,
    metadata: { bookingId, decision: input.decision },
  });

  createNotification({
    recipientId: ownerUid,
    title: input.decision === "ACCEPTED" ? "Staff accepted a booking" : "Staff rejected a booking",
    message:
      input.decision === "ACCEPTED"
        ? `${booking.staffName} accepted the booking for ${booking.customerName}.`
        : `${booking.staffName} rejected the booking for ${booking.customerName}: ${input.reason}`,
    type:
      input.decision === "ACCEPTED"
        ? NOTIFICATION_TYPES.STAFF_ACCEPTED_BOOKING
        : NOTIFICATION_TYPES.STAFF_REJECTED_BOOKING,
    relatedSalonId: salonId,
  });

  return getBooking(salonId, bookingId);
}

export async function declineBooking(salonId: string, ownerUid: string, bookingId: string, reason: string) {
  const { ref, booking } = await loadBookingDoc(salonId, bookingId);
  if (!ACTIVE_BOOKING_STATUSES.includes(booking.status)) {
    throw ApiError.conflict(`Cannot decline a booking that is already ${booking.status}`);
  }

  await ref.update({
    status: BOOKING_STATUS.DECLINED_BY_SALON,
    declineReason: reason,
    history: appendHistory(booking.history, BOOKING_STATUS.DECLINED_BY_SALON, ownerUid, reason),
    updatedAt: FieldValue.serverTimestamp(),
  });

  createAuditLog({
    action: AUDIT_ACTIONS.BOOKING_DECLINED,
    actorId: ownerUid,
    actorRole: ROLES.SALON_OWNER,
    targetSalonId: salonId,
    metadata: { bookingId, reason },
  });

  return getBooking(salonId, bookingId);
}

export async function cancelBooking(
  salonId: string,
  ownerUid: string,
  bookingId: string,
  reason: string,
  cancelledBy: "SALON" | "CUSTOMER" = "SALON",
) {
  const { ref, booking } = await loadBookingDoc(salonId, bookingId);
  if (!ACTIVE_BOOKING_STATUSES.includes(booking.status)) {
    throw ApiError.conflict(`Cannot cancel a booking that is already ${booking.status}`);
  }

  const status: BookingStatus =
    cancelledBy === "CUSTOMER" ? BOOKING_STATUS.CANCELLED_BY_CUSTOMER : BOOKING_STATUS.CANCELLED_BY_SALON;

  await db.runTransaction(async (tx) => {
    tx.update(ref, {
      status,
      cancellationReason: reason,
      history: appendHistory(booking.history, status, ownerUid, reason),
      updatedAt: FieldValue.serverTimestamp(),
    });
    if (booking.customerId) {
      applyBookingOutcomeToCustomerInTx(tx, salonId, booking.customerId, "cancelled", 0, new Date());
    }
  });

  createAuditLog({
    action: AUDIT_ACTIONS.BOOKING_CANCELLED,
    actorId: ownerUid,
    actorRole: ROLES.SALON_OWNER,
    targetSalonId: salonId,
    metadata: { bookingId, reason, cancelledBy },
  });

  if (cancelledBy === "CUSTOMER") {
    createNotification({
      recipientId: ownerUid,
      title: "Customer cancellation",
      message: `${booking.customerName} cancelled their booking: ${reason}`,
      type: NOTIFICATION_TYPES.BOOKING_CANCELLED_BY_CUSTOMER,
      relatedSalonId: salonId,
    });
  }

  return getBooking(salonId, bookingId);
}

export async function rescheduleBooking(
  salonId: string,
  ownerUid: string,
  bookingId: string,
  input: BookingRescheduleInput,
) {
  const salon = await loadSalonDoc(salonId);
  const { ref, booking } = await loadBookingDoc(salonId, bookingId);
  if (!ACTIVE_BOOKING_STATUSES.includes(booking.status)) {
    throw ApiError.conflict(`Cannot reschedule a booking that is already ${booking.status}`);
  }

  const startAt = new Date(input.startAt);
  const endAt = new Date(startAt.getTime() + booking.serviceDurationMinutes * 60_000);
  assertWithinSalonHours(salon, startAt, endAt);

  const targetStaffId = input.staffId !== undefined ? input.staffId : booking.staffId;
  let staffName = booking.staffName;
  if (targetStaffId) {
    const staff = await loadAssignableStaff(salonId, targetStaffId, booking.serviceId);
    assertStaffAvailable(staff, startAt, endAt);
    await assertNoOverlapForStaff(staff.id, startAt, endAt, bookingId);
    await assertNoTimeOffConflict(salonId, staff.id, startAt, endAt);
    staffName = staff.fullName;
  }

  await ref.update({
    startAt: Timestamp.fromDate(startAt),
    endAt: Timestamp.fromDate(endAt),
    staffId: targetStaffId,
    staffName,
    history: appendHistory(booking.history, booking.status, ownerUid, "Rescheduled"),
    updatedAt: FieldValue.serverTimestamp(),
  });

  createAuditLog({
    action: AUDIT_ACTIONS.BOOKING_RESCHEDULED,
    actorId: ownerUid,
    actorRole: ROLES.SALON_OWNER,
    targetSalonId: salonId,
    metadata: { bookingId, startAt: input.startAt },
  });

  return getBooking(salonId, bookingId);
}

export async function completeBooking(salonId: string, ownerUid: string, bookingId: string) {
  const { ref, booking } = await loadBookingDoc(salonId, bookingId);
  if (booking.status !== BOOKING_STATUS.CONFIRMED) {
    throw ApiError.conflict("Only a confirmed booking can be marked completed");
  }

  await db.runTransaction(async (tx) => {
    tx.update(ref, {
      status: BOOKING_STATUS.COMPLETED,
      history: appendHistory(booking.history, BOOKING_STATUS.COMPLETED, ownerUid),
      updatedAt: FieldValue.serverTimestamp(),
    });
    if (booking.customerId) {
      applyBookingOutcomeToCustomerInTx(
        tx,
        salonId,
        booking.customerId,
        "completed",
        booking.servicePriceLkr,
        (booking.startAt as Timestamp).toDate(),
      );
    }
  });

  createAuditLog({
    action: AUDIT_ACTIONS.BOOKING_COMPLETED,
    actorId: ownerUid,
    actorRole: ROLES.SALON_OWNER,
    targetSalonId: salonId,
    metadata: { bookingId },
  });

  return getBooking(salonId, bookingId);
}

export async function markNoShow(salonId: string, ownerUid: string, bookingId: string) {
  const { ref, booking } = await loadBookingDoc(salonId, bookingId);
  if (booking.status !== BOOKING_STATUS.CONFIRMED) {
    throw ApiError.conflict("Only a confirmed booking can be marked as a no-show");
  }

  await db.runTransaction(async (tx) => {
    tx.update(ref, {
      status: BOOKING_STATUS.NO_SHOW,
      history: appendHistory(booking.history, BOOKING_STATUS.NO_SHOW, ownerUid),
      updatedAt: FieldValue.serverTimestamp(),
    });
    if (booking.customerId) {
      applyBookingOutcomeToCustomerInTx(tx, salonId, booking.customerId, "noShow", 0, new Date());
    }
  });

  createAuditLog({
    action: AUDIT_ACTIONS.BOOKING_NO_SHOW,
    actorId: ownerUid,
    actorRole: ROLES.SALON_OWNER,
    targetSalonId: salonId,
    metadata: { bookingId },
  });

  return getBooking(salonId, bookingId);
}

export async function updateBookingNotes(
  salonId: string,
  ownerUid: string,
  bookingId: string,
  notes: string,
) {
  const { ref } = await loadBookingDoc(salonId, bookingId);
  await ref.update({ internalNotes: notes, updatedAt: FieldValue.serverTimestamp() });

  createAuditLog({
    action: AUDIT_ACTIONS.BOOKING_NOTES_UPDATED,
    actorId: ownerUid,
    actorRole: ROLES.SALON_OWNER,
    targetSalonId: salonId,
    metadata: { bookingId },
  });

  return getBooking(salonId, bookingId);
}
