import type {
  DocumentData,
  DocumentReference,
  Transaction,
  WriteBatch,
} from "firebase-admin/firestore";

/**
 * Transaction.set/update and WriteBatch.set/update share a signature, so
 * helpers that need to participate in either an atomic transaction or a
 * batch (per the "complete writes atomically" requirement) can accept
 * either one through this union rather than duplicating logic.
 */
export type FirestoreWriter = Transaction | WriteBatch;

/**
 * TypeScript can't resolve .set()'s overloads through the Transaction |
 * WriteBatch union directly (each side's overload set is individually
 * fine; the union of them isn't). Both implementations behave identically
 * at runtime, so this narrows through WriteBatch's shape to call it once.
 */
export function writerSet(writer: FirestoreWriter, ref: DocumentReference, data: DocumentData) {
  (writer as WriteBatch).set(ref, data);
}
