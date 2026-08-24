import "server-only";
import { COLLECTIONS, ROLES, SALON_STATUS, VERIFICATION_STATUS, type Role } from "@/lib/shared";
import { auth, db } from "@/server/config/firebase";
import { getAccountDoc } from "@/server/lib/accounts";
import { ApiError } from "@/server/lib/apiError";
import type { SalonDocument } from "@/server/types/firestore";
import type { NextRequest } from "next/server";

export interface AuthenticatedUser {
  uid: string;
  email: string;
  fullName: string;
  role: Role;
  salonId: string | null;
  verificationStatus: (typeof VERIFICATION_STATUS)[keyof typeof VERIFICATION_STATUS] | null;
}

/**
 * Verifies the Firebase ID token in the Authorization header and loads the
 * caller's account document. Every downstream authorization decision reads
 * from the returned object (server-verified), never from anything the
 * client claims.
 */
export async function authenticateRequest(req: NextRequest): Promise<AuthenticatedUser> {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) {
    throw ApiError.unauthenticated("Missing or malformed Authorization header");
  }

  const idToken = header.slice("Bearer ".length).trim();
  if (!idToken) {
    throw ApiError.unauthenticated("Missing bearer token");
  }

  let decoded;
  try {
    decoded = await auth.verifyIdToken(idToken);
  } catch {
    throw ApiError.unauthenticated("Invalid or expired session");
  }

  const account = await getAccountDoc(decoded.uid);
  if (!account) {
    throw ApiError.forbidden("No account record found for this user");
  }

  return {
    uid: decoded.uid,
    email: account.doc.email,
    fullName: account.doc.fullName,
    role: account.doc.role,
    salonId: account.doc.salonId,
    verificationStatus: account.doc.verificationStatus,
  };
}

/** Restricts access to the given roles. */
export function requireRole(user: AuthenticatedUser, roles: Role[]) {
  if (!roles.includes(user.role)) {
    throw ApiError.forbidden("This action requires a different role");
  }
}

/**
 * Restricts access to salon_owner accounts approved by a platform admin.
 * Rejects PENDING_VERIFICATION, REJECTED, and SUSPENDED accounts with a
 * status-specific error so the frontend can show the right status page.
 */
export function requireVerifiedSalonOwner(user: AuthenticatedUser) {
  if (user.role !== ROLES.SALON_OWNER) {
    throw ApiError.forbidden("This action requires a salon owner account");
  }

  switch (user.verificationStatus) {
    case VERIFICATION_STATUS.APPROVED:
      return;
    case VERIFICATION_STATUS.REJECTED:
      throw ApiError.accountRejected();
    case VERIFICATION_STATUS.SUSPENDED:
      throw ApiError.accountSuspended();
    default:
      throw ApiError.accountUnverified();
  }
}

/**
 * Loads `salonId` and verifies the caller may act on it: a platform_admin
 * may access any salon; a salon_owner only the salon they own. The id is
 * never trusted beyond "which resource are you asking about" — ownership is
 * re-checked against Firestore, never against a client claim.
 */
export async function requireSalonAccess(
  user: AuthenticatedUser,
  salonId: string,
): Promise<SalonDocument> {
  const snap = await db.collection(COLLECTIONS.SALONS).doc(salonId).get();
  if (!snap.exists) {
    throw ApiError.notFound("Salon not found");
  }

  const salon = snap.data() as SalonDocument;
  const isAdmin = user.role === ROLES.PLATFORM_ADMIN;
  const isOwner = user.role === ROLES.SALON_OWNER && salon.ownerId === user.uid;

  if (!isAdmin && !isOwner) {
    throw ApiError.forbidden("You do not have access to this salon");
  }

  return salon;
}

/**
 * Loads the caller's own salon (from the server-side account record, never
 * a client-supplied id) and blocks management access unless it is ACTIVE.
 * A suspended/rejected/pending salon fails even when the owner account
 * itself is APPROVED (e.g. immediately after a suspension).
 */
export async function requireActiveSalon(user: AuthenticatedUser): Promise<SalonDocument> {
  if (!user.salonId) {
    throw ApiError.notFound("No salon is associated with this account");
  }

  const snap = await db.collection(COLLECTIONS.SALONS).doc(user.salonId).get();
  if (!snap.exists) {
    throw ApiError.notFound("Salon not found");
  }

  const salon = snap.data() as SalonDocument;
  if (salon.status !== SALON_STATUS.ACTIVE) {
    throw ApiError.salonInactive();
  }

  return salon;
}
