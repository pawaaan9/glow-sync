import { Timestamp } from "firebase-admin/firestore";
import { db } from "@/server/config/firebase";
import {
  COLLECTIONS,
  ROLES,
  SALON_STATUS,
  type AuditLogsQuery,
  type SalonOwnersQuery,
  type SalonsQuery,
  type VerificationHistoryQuery,
} from "@/lib/shared";
import { ApiError } from "@/server/lib/apiError";
import { getOrderedDocs, paginateOrdered } from "@/server/lib/orderedQuery";
import {
  serializeAuditLog,
  serializeSalon,
  serializeUser,
  serializeVerificationHistory,
} from "@/server/lib/serializers";
import type {
  AuditLogDocument,
  SalonDocument,
  SalonVerificationHistoryDocument,
  UserDocument,
} from "@/server/types/firestore";

const mapWithId = <T>(id: string, data: FirebaseFirestore.DocumentData): T =>
  ({ ...data, id }) as T;

/**
 * Firestore range/equality filters compose onto one query, but there is no
 * substring "search" operator. For the admin dataset's expected scale, we
 * apply every structured filter in Firestore, then filter the free-text
 * `search` term in memory before paginating. This keeps results correct at
 * the cost of scanning more rows than the page size when `search` is used;
 * swap in a real search index (Algolia/Typesense) if the catalogue grows
 * large enough for that to matter.
 */
function buildSalonsQuery(filters: SalonsQuery) {
  let query: FirebaseFirestore.Query = db.collection(COLLECTIONS.SALONS);

  if (filters.status) query = query.where("status", "==", filters.status);
  if (filters.district) query = query.where("district", "==", filters.district);
  if (filters.category) query = query.where("category", "==", filters.category);
  if (filters.dateFrom) {
    query = query.where("createdAt", ">=", Timestamp.fromDate(new Date(filters.dateFrom)));
  }
  if (filters.dateTo) {
    const end = new Date(filters.dateTo);
    end.setDate(end.getDate() + 1);
    query = query.where("createdAt", "<", Timestamp.fromDate(end));
  }

  return query;
}

async function listSalonsFiltered(filters: SalonsQuery) {
  const base = buildSalonsQuery(filters);
  const order = { field: filters.sortBy, direction: filters.sortOrder };

  if (!filters.search) {
    return paginateOrdered<SalonDocument, SalonDocument>(
      base,
      order,
      filters,
      mapWithId,
      (doc) => doc,
    );
  }

  const term = filters.search.toLowerCase();
  const matched = (await getOrderedDocs(base, order))
    .map((doc) => mapWithId<SalonDocument>(doc.id, doc.data()))
    .filter(
      (salon) =>
        salon.name.toLowerCase().includes(term) ||
        salon.businessEmail.toLowerCase().includes(term) ||
        salon.businessPhone.includes(term),
    );

  const total = matched.length;
  const offset = (filters.page - 1) * filters.limit;
  const items = matched.slice(offset, offset + filters.limit);

  return {
    items,
    page: filters.page,
    limit: filters.limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / filters.limit)),
  };
}

/**
 * The salon-applications/salons tables display the owner's name, email,
 * and phone alongside each salon, but Firestore has no server-side join —
 * batch-fetch the distinct owners for one page of results and merge their
 * contact details onto each DTO.
 */
async function enrichWithOwnerContact(salons: SalonDocument[]) {
  const ownerIds = [...new Set(salons.map((s) => s.ownerId))];
  const ownerSnaps = await Promise.all(
    ownerIds.map((id) => db.collection(COLLECTIONS.USERS).doc(id).get()),
  );
  const ownerById = new Map(
    ownerSnaps.filter((snap) => snap.exists).map((snap) => [snap.id, snap.data() as UserDocument]),
  );

  return salons.map((salon) => {
    const dto = serializeSalon(salon);
    const owner = ownerById.get(salon.ownerId);
    if (owner) {
      dto.ownerName = owner.fullName;
      dto.ownerEmail = owner.email;
      dto.ownerPhone = owner.phone;
    }
    return dto;
  });
}

export async function listSalonApplications(filters: SalonsQuery) {
  const result = await listSalonsFiltered(filters);
  return { ...result, items: await enrichWithOwnerContact(result.items) };
}

export async function listSalons(filters: SalonsQuery) {
  const result = await listSalonsFiltered(filters);
  return { ...result, items: await enrichWithOwnerContact(result.items) };
}

export async function getSalonApplication(salonId: string) {
  const snap = await db.collection(COLLECTIONS.SALONS).doc(salonId).get();
  if (!snap.exists) throw ApiError.notFound("Salon application not found");
  const salon = mapWithId<SalonDocument>(snap.id, snap.data()!);

  const ownerSnap = await db.collection(COLLECTIONS.USERS).doc(salon.ownerId).get();
  const owner = ownerSnap.exists
    ? serializeUser(mapWithId<UserDocument>(ownerSnap.id, ownerSnap.data()!))
    : null;

  const historyDocs = await getOrderedDocs(
    db.collection(COLLECTIONS.SALON_VERIFICATION_HISTORY).where("salonId", "==", salonId),
    { field: "createdAt", direction: "desc" },
  );
  const history = historyDocs.map((doc) =>
    serializeVerificationHistory(
      mapWithId<SalonVerificationHistoryDocument>(doc.id, doc.data()),
    ),
  );

  return { salon: serializeSalon(salon), owner, history };
}

export async function listSalonOwners(filters: SalonOwnersQuery) {
  let query: FirebaseFirestore.Query = db
    .collection(COLLECTIONS.USERS)
    .where("role", "==", ROLES.SALON_OWNER);

  if (filters.verificationStatus) {
    query = query.where("verificationStatus", "==", filters.verificationStatus);
  }
  const order = { field: filters.sortBy, direction: filters.sortOrder };

  if (!filters.search) {
    const result = await paginateOrdered<UserDocument, UserDocument>(
      query,
      order,
      filters,
      mapWithId,
      (doc) => doc,
    );
    return { ...result, items: result.items.map(serializeUser) };
  }

  const term = filters.search.toLowerCase();
  const matched = (await getOrderedDocs(query, order))
    .map((doc) => mapWithId<UserDocument>(doc.id, doc.data()))
    .filter(
      (user) =>
        user.fullName.toLowerCase().includes(term) || user.email.toLowerCase().includes(term),
    );

  const total = matched.length;
  const offset = (filters.page - 1) * filters.limit;
  const items = matched.slice(offset, offset + filters.limit).map(serializeUser);

  return {
    items,
    page: filters.page,
    limit: filters.limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / filters.limit)),
  };
}

export async function listAuditLogs(filters: AuditLogsQuery) {
  let query: FirebaseFirestore.Query = db.collection(COLLECTIONS.AUDIT_LOGS);
  if (filters.targetSalonId) query = query.where("targetSalonId", "==", filters.targetSalonId);
  if (filters.action) query = query.where("action", "==", filters.action);
  const result = await paginateOrdered<AuditLogDocument, AuditLogDocument>(
    query,
    { field: "createdAt", direction: filters.sortOrder },
    filters,
    mapWithId,
    (doc) => doc,
  );
  return { ...result, items: result.items.map(serializeAuditLog) };
}

export async function listVerificationHistory(filters: VerificationHistoryQuery) {
  let query: FirebaseFirestore.Query = db.collection(COLLECTIONS.SALON_VERIFICATION_HISTORY);
  if (filters.salonId) query = query.where("salonId", "==", filters.salonId);
  const result = await paginateOrdered<
    SalonVerificationHistoryDocument,
    SalonVerificationHistoryDocument
  >(query, { field: "createdAt", direction: filters.sortOrder }, filters, mapWithId, (doc) => doc);
  return { ...result, items: result.items.map(serializeVerificationHistory) };
}

export async function getDashboard() {
  const salonsRef = db.collection(COLLECTIONS.SALONS);
  const usersRef = db.collection(COLLECTIONS.USERS);

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [
    pendingCount,
    approvedCount,
    rejectedCount,
    suspendedCount,
    totalOwnersCount,
    thisMonthCount,
    recentApplicationsSnap,
    recentActivitySnap,
  ] = await Promise.all([
    salonsRef.where("status", "==", SALON_STATUS.PENDING_APPROVAL).count().get(),
    salonsRef.where("status", "==", SALON_STATUS.ACTIVE).count().get(),
    salonsRef.where("status", "==", SALON_STATUS.REJECTED).count().get(),
    salonsRef.where("status", "==", SALON_STATUS.SUSPENDED).count().get(),
    usersRef.where("role", "==", ROLES.SALON_OWNER).count().get(),
    salonsRef.where("createdAt", ">=", Timestamp.fromDate(startOfMonth)).count().get(),
    salonsRef.orderBy("createdAt", "desc").limit(5).get(),
    db.collection(COLLECTIONS.AUDIT_LOGS).orderBy("createdAt", "desc").limit(10).get(),
  ]);

  return {
    counts: {
      pendingApplications: pendingCount.data().count,
      approvedSalons: approvedCount.data().count,
      rejectedApplications: rejectedCount.data().count,
      suspendedSalons: suspendedCount.data().count,
      totalSalonOwners: totalOwnersCount.data().count,
      applicationsThisMonth: thisMonthCount.data().count,
    },
    recentApplications: recentApplicationsSnap.docs.map((doc) =>
      serializeSalon(mapWithId<SalonDocument>(doc.id, doc.data())),
    ),
    recentActivity: recentActivitySnap.docs.map((doc) =>
      serializeAuditLog(mapWithId<AuditLogDocument>(doc.id, doc.data())),
    ),
  };
}
