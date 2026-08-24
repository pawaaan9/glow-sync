import { FieldValue, Timestamp, type Transaction } from "firebase-admin/firestore";
import { db } from "@/server/config/firebase";
import {
  AUDIT_ACTIONS,
  COLLECTIONS,
  ROLES,
  SALON_SUBCOLLECTIONS,
  type CustomersQuery,
} from "@/lib/shared";
import { ApiError } from "@/server/lib/apiError";
import { createAuditLog } from "@/server/lib/auditLog";
import { getOrderedDocs } from "@/server/lib/orderedQuery";
import { serializeBooking, serializeCustomer } from "@/server/lib/serializers";
import type { BookingDocument, CustomerDocument } from "@/server/types/firestore";

function customersRef(salonId: string) {
  return db.collection(COLLECTIONS.SALONS).doc(salonId).collection(SALON_SUBCOLLECTIONS.CUSTOMERS);
}

export async function listCustomers(salonId: string, query: CustomersQuery) {
  const base = customersRef(salonId);
  const docs = await getOrderedDocs(base, { field: query.sortBy, direction: query.sortOrder });
  let items = docs.map((d) => serializeCustomer({ ...(d.data() as CustomerDocument), id: d.id }));

  if (query.search) {
    const needle = query.search.trim().toLowerCase();
    items = items.filter(
      (c) => c.fullName.toLowerCase().includes(needle) || c.phone.includes(needle),
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

export async function getCustomer(salonId: string, customerId: string) {
  const snap = await customersRef(salonId).doc(customerId).get();
  if (!snap.exists) throw ApiError.notFound("Customer not found");
  return serializeCustomer({ ...(snap.data() as CustomerDocument), id: snap.id });
}

export async function getCustomerBookingHistory(salonId: string, customerId: string) {
  const snap = await db
    .collection(COLLECTIONS.BOOKINGS)
    .where("salonId", "==", salonId)
    .where("customerId", "==", customerId)
    .get();

  return snap.docs
    .map((d) => serializeBooking({ ...(d.data() as BookingDocument), id: d.id }))
    .sort((a, b) => b.startAt.localeCompare(a.startAt));
}

export async function updateCustomerNotes(
  salonId: string,
  ownerUid: string,
  customerId: string,
  notes: string,
) {
  const ref = customersRef(salonId).doc(customerId);
  const snap = await ref.get();
  if (!snap.exists) throw ApiError.notFound("Customer not found");

  await ref.update({ notes, updatedAt: FieldValue.serverTimestamp() });

  createAuditLog({
    action: AUDIT_ACTIONS.CUSTOMER_NOTES_UPDATED,
    actorId: ownerUid,
    actorRole: ROLES.SALON_OWNER,
    targetSalonId: salonId,
    metadata: { customerId },
  });

  return getCustomer(salonId, customerId);
}

/**
 * Finds an existing customer by phone or creates a new one, inside the same
 * transaction as the booking write that triggered it. Matching by phone
 * (rather than a customer-supplied id) is what keeps repeat walk-ins from
 * fragmenting into duplicate customer records.
 */
export async function findOrCreateCustomerInTx(
  tx: Transaction,
  salonId: string,
  input: { fullName: string; phone: string; email: string | null },
): Promise<string> {
  const existing = await tx.get(customersRef(salonId).where("phone", "==", input.phone).limit(1));
  if (!existing.empty) {
    return existing.docs[0]!.id;
  }

  const ref = customersRef(salonId).doc();
  const now = FieldValue.serverTimestamp();
  const data: CustomerDocument = {
    id: ref.id,
    salonId,
    fullName: input.fullName,
    phone: input.phone,
    email: input.email,
    lastVisitAt: null,
    nextBookingAt: null,
    totalAppointments: 0,
    totalSpendLkr: 0,
    cancellationCount: 0,
    noShowCount: 0,
    notes: null,
    createdAt: now,
    updatedAt: now,
  };
  tx.set(ref, data);
  return ref.id;
}

/** Applies the stats delta a booking status change has on its customer, inside the same transaction. */
export function applyBookingOutcomeToCustomerInTx(
  tx: Transaction,
  salonId: string,
  customerId: string,
  outcome: "completed" | "cancelled" | "noShow",
  amountLkr: number,
  visitDate: Date,
) {
  const ref = customersRef(salonId).doc(customerId);
  if (outcome === "completed") {
    tx.update(ref, {
      totalAppointments: FieldValue.increment(1),
      totalSpendLkr: FieldValue.increment(amountLkr),
      lastVisitAt: Timestamp.fromDate(visitDate),
      updatedAt: FieldValue.serverTimestamp(),
    });
  } else if (outcome === "cancelled") {
    tx.update(ref, {
      cancellationCount: FieldValue.increment(1),
      updatedAt: FieldValue.serverTimestamp(),
    });
  } else {
    tx.update(ref, {
      noShowCount: FieldValue.increment(1),
      updatedAt: FieldValue.serverTimestamp(),
    });
  }
}
