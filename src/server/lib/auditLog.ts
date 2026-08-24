import { FieldValue } from "firebase-admin/firestore";
import { db } from "@/server/config/firebase";
import { COLLECTIONS, type AuditAction, type Role } from "@/lib/shared";
import { writerSet, type FirestoreWriter } from "./firestoreWriter";

export interface CreateAuditLogInput {
  action: AuditAction;
  actorId: string;
  actorRole: Role;
  targetUserId?: string | null;
  targetSalonId?: string | null;
  metadata?: Record<string, unknown> | null;
}

/**
 * Records a sensitive platform-admin action. Pass `writer` (a Transaction
 * or WriteBatch) to make this part of the same atomic write as the action
 * it documents; omit it to write immediately and independently.
 */
export function createAuditLog(input: CreateAuditLogInput, writer?: FirestoreWriter) {
  const ref = db.collection(COLLECTIONS.AUDIT_LOGS).doc();
  const data = {
    id: ref.id,
    action: input.action,
    actorId: input.actorId,
    actorRole: input.actorRole,
    targetUserId: input.targetUserId ?? null,
    targetSalonId: input.targetSalonId ?? null,
    metadata: input.metadata ?? null,
    createdAt: FieldValue.serverTimestamp(),
  };

  if (writer) {
    writerSet(writer, ref, data);
    return ref;
  }
  void ref.set(data);
  return ref;
}
