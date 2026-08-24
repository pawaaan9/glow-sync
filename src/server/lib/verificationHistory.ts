import { FieldValue } from "firebase-admin/firestore";
import { db } from "@/server/config/firebase";
import { COLLECTIONS, type VerificationHistoryAction } from "@/lib/shared";
import { writerSet, type FirestoreWriter } from "./firestoreWriter";

export interface CreateVerificationHistoryInput {
  salonId: string;
  ownerId: string;
  previousStatus: string | null;
  newStatus: string;
  action: VerificationHistoryAction;
  reason?: string | null;
  performedBy: string;
}

/** Appends an immutable entry to a salon's verification history. */
export function createVerificationHistory(
  input: CreateVerificationHistoryInput,
  writer?: FirestoreWriter,
) {
  const ref = db.collection(COLLECTIONS.SALON_VERIFICATION_HISTORY).doc();
  const data = {
    id: ref.id,
    salonId: input.salonId,
    ownerId: input.ownerId,
    previousStatus: input.previousStatus,
    newStatus: input.newStatus,
    action: input.action,
    reason: input.reason ?? null,
    performedBy: input.performedBy,
    createdAt: FieldValue.serverTimestamp(),
  };

  if (writer) {
    writerSet(writer, ref, data);
    return ref;
  }
  void ref.set(data);
  return ref;
}
