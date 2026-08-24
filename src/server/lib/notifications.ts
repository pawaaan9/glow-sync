import { FieldValue } from "firebase-admin/firestore";
import { db } from "@/server/config/firebase";
import { COLLECTIONS, type NotificationType, type Role } from "@/lib/shared";
import { writerSet, type FirestoreWriter } from "./firestoreWriter";

export interface CreateNotificationInput {
  /** A specific user, or omit and use recipientRole to broadcast. */
  recipientId?: string | null;
  /** Broadcast to every user with this role (e.g. every platform_admin). */
  recipientRole?: Role | null;
  title: string;
  message: string;
  type: NotificationType;
  relatedSalonId?: string | null;
}

/**
 * A channel is anything that can deliver a notification once it's been
 * recorded in-app. Only the in-app channel is implemented for the MVP;
 * email/WhatsApp can register additional channels here later without
 * touching call sites.
 */
export interface NotificationChannel {
  send(input: CreateNotificationInput): Promise<void> | void;
}

const channels: NotificationChannel[] = [];

export function registerNotificationChannel(channel: NotificationChannel) {
  channels.push(channel);
}

/**
 * Writes the in-app notification (optionally as part of an atomic
 * transaction/batch) and fans out to any additional registered channels.
 * The extra channels are best-effort side effects, so they intentionally
 * run outside the atomic write.
 */
export function createNotification(input: CreateNotificationInput, writer?: FirestoreWriter) {
  const ref = db.collection(COLLECTIONS.NOTIFICATIONS).doc();
  const data = {
    id: ref.id,
    recipientId: input.recipientId ?? null,
    recipientRole: input.recipientRole ?? null,
    title: input.title,
    message: input.message,
    type: input.type,
    relatedSalonId: input.relatedSalonId ?? null,
    isRead: false,
    createdAt: FieldValue.serverTimestamp(),
  };

  if (writer) {
    writerSet(writer, ref, data);
  } else {
    void ref.set(data);
  }

  for (const channel of channels) {
    void channel.send(input);
  }

  return ref;
}
