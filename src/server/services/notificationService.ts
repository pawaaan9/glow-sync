import type { Timestamp } from "firebase-admin/firestore";
import { db } from "@/server/config/firebase";
import { COLLECTIONS, type Role } from "@/lib/shared";
import type { PageParams } from "@/server/lib/pagination";
import { serializeNotification } from "@/server/lib/serializers";
import type { NotificationDocument } from "@/server/types/firestore";

const mapWithId = (id: string, data: FirebaseFirestore.DocumentData): NotificationDocument =>
  ({ ...data, id }) as NotificationDocument;

/** Notifications addressed to this specific user, or broadcast to their role. */
export async function listMyNotifications(
  uid: string,
  role: Role,
  pageParams: PageParams & { sortOrder: "asc" | "desc" },
) {
  const [personal, broadcast] = await Promise.all([
    db.collection(COLLECTIONS.NOTIFICATIONS).where("recipientId", "==", uid).get(),
    db.collection(COLLECTIONS.NOTIFICATIONS).where("recipientRole", "==", role).get(),
  ]);

  const seen = new Set<string>();
  const merged: NotificationDocument[] = [];
  for (const snap of [...personal.docs, ...broadcast.docs]) {
    if (seen.has(snap.id)) continue;
    seen.add(snap.id);
    merged.push(mapWithId(snap.id, snap.data()));
  }

  merged.sort((a, b) => {
    const at = (a.createdAt as Timestamp).toDate().getTime();
    const bt = (b.createdAt as Timestamp).toDate().getTime();
    return pageParams.sortOrder === "asc" ? at - bt : bt - at;
  });

  const total = merged.length;
  const offset = (pageParams.page - 1) * pageParams.limit;
  const items = merged.slice(offset, offset + pageParams.limit).map(serializeNotification);

  return {
    items,
    page: pageParams.page,
    limit: pageParams.limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageParams.limit)),
  };
}

export async function markNotificationRead(notificationId: string) {
  await db.collection(COLLECTIONS.NOTIFICATIONS).doc(notificationId).update({ isRead: true });
}
