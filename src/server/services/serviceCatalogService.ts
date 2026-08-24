import { FieldValue } from "firebase-admin/firestore";
import { db } from "@/server/config/firebase";
import {
  AUDIT_ACTIONS,
  COLLECTIONS,
  ROLES,
  SALON_SUBCOLLECTIONS,
  type ServiceInput,
  type ServicePatchInput,
  type ServicesQuery,
} from "@/lib/shared";
import { ApiError } from "@/server/lib/apiError";
import { createAuditLog } from "@/server/lib/auditLog";
import { getOrderedDocs } from "@/server/lib/orderedQuery";
import { serializeService } from "@/server/lib/serializers";
import type { ServiceDocument } from "@/server/types/firestore";

function servicesRef(salonId: string) {
  return db.collection(COLLECTIONS.SALONS).doc(salonId).collection(SALON_SUBCOLLECTIONS.SERVICES);
}

export async function listServices(salonId: string, query: ServicesQuery) {
  let base: FirebaseFirestore.Query = servicesRef(salonId);
  if (query.category) base = base.where("category", "==", query.category);
  if (query.isActive !== undefined) base = base.where("isActive", "==", query.isActive);

  const docs = await getOrderedDocs(base, { field: query.sortBy, direction: query.sortOrder });
  let items = docs.map((d) => serializeService({ ...(d.data() as ServiceDocument), id: d.id }));

  if (query.search) {
    const needle = query.search.trim().toLowerCase();
    items = items.filter((s) => s.name.toLowerCase().includes(needle));
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

export async function getService(salonId: string, serviceId: string) {
  const snap = await servicesRef(salonId).doc(serviceId).get();
  if (!snap.exists) throw ApiError.notFound("Service not found");
  return serializeService({ ...(snap.data() as ServiceDocument), id: snap.id });
}

export async function createService(salonId: string, ownerUid: string, input: ServiceInput) {
  const ref = servicesRef(salonId).doc();
  const now = FieldValue.serverTimestamp();
  const data: ServiceDocument = {
    id: ref.id,
    salonId,
    name: input.name,
    category: input.category,
    description: input.description,
    durationMinutes: input.durationMinutes,
    priceLkr: input.priceLkr,
    discountedPriceLkr: input.discountedPriceLkr ?? null,
    depositLkr: input.depositLkr ?? null,
    assignedStaffIds: input.assignedStaffIds,
    isActive: input.isActive,
    hasBookingHistory: false,
    createdAt: now,
    updatedAt: now,
  };
  await ref.set(data);

  createAuditLog({
    action: AUDIT_ACTIONS.SERVICE_CREATED,
    actorId: ownerUid,
    actorRole: ROLES.SALON_OWNER,
    targetSalonId: salonId,
    metadata: { serviceId: ref.id, name: input.name },
  });

  return getService(salonId, ref.id);
}

export async function updateService(
  salonId: string,
  ownerUid: string,
  serviceId: string,
  input: ServicePatchInput,
) {
  const ref = servicesRef(salonId).doc(serviceId);
  const snap = await ref.get();
  if (!snap.exists) throw ApiError.notFound("Service not found");

  await ref.update({ ...input, updatedAt: FieldValue.serverTimestamp() });

  createAuditLog({
    action: AUDIT_ACTIONS.SERVICE_UPDATED,
    actorId: ownerUid,
    actorRole: ROLES.SALON_OWNER,
    targetSalonId: salonId,
    metadata: { serviceId },
  });

  return getService(salonId, serviceId);
}

/**
 * A service with booking history is deactivated, never hard-deleted — its
 * name/price/duration snapshot lives on past bookings and must stay
 * readable. A service with no history at all may be removed outright.
 */
export async function setServiceActive(
  salonId: string,
  ownerUid: string,
  serviceId: string,
  isActive: boolean,
) {
  const ref = servicesRef(salonId).doc(serviceId);
  const snap = await ref.get();
  if (!snap.exists) throw ApiError.notFound("Service not found");

  await ref.update({ isActive, updatedAt: FieldValue.serverTimestamp() });

  createAuditLog({
    action: AUDIT_ACTIONS.SERVICE_STATUS_CHANGED,
    actorId: ownerUid,
    actorRole: ROLES.SALON_OWNER,
    targetSalonId: salonId,
    metadata: { serviceId, isActive },
  });

  return getService(salonId, serviceId);
}

export async function duplicateService(salonId: string, ownerUid: string, serviceId: string) {
  const snap = await servicesRef(salonId).doc(serviceId).get();
  if (!snap.exists) throw ApiError.notFound("Service not found");
  const source = snap.data() as ServiceDocument;

  return createService(salonId, ownerUid, {
    name: `${source.name} (copy)`,
    category: source.category,
    description: source.description,
    durationMinutes: source.durationMinutes,
    priceLkr: source.priceLkr,
    discountedPriceLkr: source.discountedPriceLkr,
    depositLkr: source.depositLkr,
    assignedStaffIds: source.assignedStaffIds,
    isActive: false,
  });
}
