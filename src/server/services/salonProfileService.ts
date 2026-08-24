import { randomUUID } from "node:crypto";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "@/server/config/firebase";
import {
  AUDIT_ACTIONS,
  COLLECTIONS,
  ROLES,
  type SalonBookingSettingsInput,
  type SalonProfileInput,
  type WorkingHoursUpdateInput,
} from "@/lib/shared";
import { ApiError } from "@/server/lib/apiError";
import { createAuditLog } from "@/server/lib/auditLog";
import { serializeSalon } from "@/server/lib/serializers";
import type { SalonDocument } from "@/server/types/firestore";

async function loadSalon(salonId: string): Promise<SalonDocument> {
  const snap = await db.collection(COLLECTIONS.SALONS).doc(salonId).get();
  if (!snap.exists) throw ApiError.notFound("Salon not found");
  return snap.data() as SalonDocument;
}

export async function updateSalonProfile(
  salonId: string,
  ownerUid: string,
  input: SalonProfileInput,
) {
  const ref = db.collection(COLLECTIONS.SALONS).doc(salonId);
  await loadSalon(salonId);

  await ref.update({ ...input, updatedAt: FieldValue.serverTimestamp() });

  createAuditLog({
    action: AUDIT_ACTIONS.SALON_PROFILE_UPDATED,
    actorId: ownerUid,
    actorRole: ROLES.SALON_OWNER,
    targetSalonId: salonId,
  });

  return serializeSalon((await ref.get()).data() as SalonDocument);
}

export async function updateSalonBookingSettings(
  salonId: string,
  ownerUid: string,
  input: SalonBookingSettingsInput,
) {
  const ref = db.collection(COLLECTIONS.SALONS).doc(salonId);
  await loadSalon(salonId);

  await ref.update({ bookingSettings: input, updatedAt: FieldValue.serverTimestamp() });

  createAuditLog({
    action: AUDIT_ACTIONS.SALON_SETTINGS_UPDATED,
    actorId: ownerUid,
    actorRole: ROLES.SALON_OWNER,
    targetSalonId: salonId,
  });

  return serializeSalon((await ref.get()).data() as SalonDocument);
}

export async function updateWorkingHours(
  salonId: string,
  ownerUid: string,
  input: WorkingHoursUpdateInput,
) {
  const ref = db.collection(COLLECTIONS.SALONS).doc(salonId);
  await loadSalon(salonId);

  const update: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };
  if (input.weeklyHours) update.weeklyHours = input.weeklyHours;
  if (input.specialHours) {
    update.specialHours = input.specialHours.map((entry) => ({
      ...entry,
      id: entry.id ?? randomUUID(),
    }));
  }
  if (input.closures) {
    update.closures = input.closures.map((entry) => ({ ...entry, id: entry.id ?? randomUUID() }));
  }

  await ref.update(update);

  createAuditLog({
    action: AUDIT_ACTIONS.WORKING_HOURS_UPDATED,
    actorId: ownerUid,
    actorRole: ROLES.SALON_OWNER,
    targetSalonId: salonId,
  });

  return serializeSalon((await ref.get()).data() as SalonDocument);
}
