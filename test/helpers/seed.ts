import {
  COLLECTIONS,
  ROLES,
  SALON_STATUS,
  VERIFICATION_STATUS,
  type Role,
  type SalonCategory,
  type SalonStatus,
  type VerificationStatus,
} from "@/lib/shared";
import { fakeAuth } from "../mocks/fakeAuth";
import { fakeStore, makeTimestamp } from "../mocks/fakeFirestore";

let counter = 0;
function nextId(prefix: string) {
  counter += 1;
  return `${prefix}-${counter}`;
}

/**
 * Registers a fake-auth user and returns a bearer token for it (the fake
 * auth's "token" is just the uid — see test/mocks/fakeAuth.ts).
 */
function seedAuthUser(email: string): string {
  const uid = nextId("uid");
  fakeAuth.registerFakeUser(uid, email);
  return uid;
}

export function seedUserDoc(
  uid: string,
  overrides: {
    email: string;
    fullName?: string;
    role: Role;
    salonId?: string | null;
    verificationStatus?: VerificationStatus | null;
  },
) {
  // Super admins live in their own collection, as a lean document with
  // none of the user-only columns. See src/types/firestore.ts.
  if (overrides.role === ROLES.PLATFORM_ADMIN) {
    fakeStore.setDoc(COLLECTIONS.SUPER_ADMINS, uid, {
      id: uid,
      fullName: overrides.fullName ?? "Test User",
      email: overrides.email,
      role: overrides.role,
      createdAt: makeTimestamp(new Date()),
      updatedAt: makeTimestamp(new Date()),
    });
    return;
  }

  fakeStore.setDoc(COLLECTIONS.USERS, uid, {
    id: uid,
    fullName: overrides.fullName ?? "Test User",
    email: overrides.email,
    phone: "+15550000000",
    role: overrides.role,
    salonId: overrides.salonId ?? null,
    verificationStatus: overrides.verificationStatus ?? null,
    rejectionReason: null,
    suspendedReason: null,
    createdAt: makeTimestamp(new Date()),
    updatedAt: makeTimestamp(new Date()),
    verifiedAt: null,
    verifiedBy: null,
  });
}

export function seedSalonDoc(
  salonId: string,
  overrides: {
    ownerId: string;
    name?: string;
    status?: SalonStatus;
    category?: SalonCategory;
  },
) {
  fakeStore.setDoc(COLLECTIONS.SALONS, salonId, {
    id: salonId,
    ownerId: overrides.ownerId,
    name: overrides.name ?? "Test Salon",
    slug: (overrides.name ?? "test-salon").toLowerCase().replace(/\s+/g, "-"),
    businessPhone: "+15551110000",
    businessEmail: "salon@example.com",
    address: "1 Test Street",
    city: "Testville",
    district: "Central",
    businessRegistrationNumber: null,
    description: "A salon used in tests.",
    category: overrides.category ?? "hair_salon",
    numberOfStaff: 3,
    logoUrl: null,
    verificationDocumentPath: null,
    status: overrides.status ?? SALON_STATUS.PENDING_APPROVAL,
    rejectionReason: null,
    suspendedReason: null,
    createdAt: makeTimestamp(new Date()),
    updatedAt: makeTimestamp(new Date()),
    approvedAt: null,
    approvedBy: null,
  });
}

/** Seeds an active salon category (doc id = slug), as the categories admin would create. */
export function seedSalonCategory(
  slug: string,
  overrides: { label?: string; isActive?: boolean; sortOrder?: number } = {},
) {
  fakeStore.setDoc(COLLECTIONS.SALON_CATEGORIES, slug, {
    id: slug,
    slug,
    label: overrides.label ?? slug,
    isActive: overrides.isActive ?? true,
    sortOrder: overrides.sortOrder ?? 0,
    createdAt: makeTimestamp(new Date()),
    updatedAt: makeTimestamp(new Date()),
  });
}

/** Seeds a fully wired platform_admin: auth user + superAdmins/ doc. Returns the bearer token. */
export function seedPlatformAdmin(email = `admin-${nextId("e")}@example.com`) {
  const uid = seedAuthUser(email);
  seedUserDoc(uid, { email, role: ROLES.PLATFORM_ADMIN, fullName: "Test Admin" });
  return { uid, token: uid, email };
}

/** Seeds a fully wired salon_owner (+ their salon) at the given verification/salon status pair. Returns the bearer token. */
export function seedSalonOwner(options: {
  email?: string;
  verificationStatus?: VerificationStatus;
  salonStatus?: SalonStatus;
  salonName?: string;
} = {}) {
  const email = options.email ?? `owner-${nextId("e")}@example.com`;
  const uid = seedAuthUser(email);
  const salonId = nextId("salon");

  seedUserDoc(uid, {
    email,
    role: ROLES.SALON_OWNER,
    salonId,
    verificationStatus: options.verificationStatus ?? VERIFICATION_STATUS.PENDING_VERIFICATION,
    fullName: "Test Owner",
  });
  seedSalonDoc(salonId, {
    ownerId: uid,
    name: options.salonName ?? "Test Salon",
    status: options.salonStatus ?? SALON_STATUS.PENDING_APPROVAL,
  });

  return { uid, token: uid, email, salonId };
}

/** Seeds a customer account (no verification lifecycle). Returns the bearer token. */
export function seedCustomer(email = `customer-${nextId("e")}@example.com`) {
  const uid = seedAuthUser(email);
  seedUserDoc(uid, { email, role: ROLES.CUSTOMER, fullName: "Test Customer" });
  return { uid, token: uid, email };
}

export function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}
