import { FieldValue } from "firebase-admin/firestore";
import { COLLECTIONS, ownerProfileSchema, ROLES, type OwnerProfileInput } from "@/lib/shared";
import { db } from "@/server/config/firebase";
import { defineRoute } from "@/server/http/route";
import { serializeUser } from "@/server/lib/serializers";
import type { UserDocument } from "@/server/types/firestore";

export const runtime = "nodejs";

/** The owner's own name/phone — role, salonId, and verification fields are never editable here. */
export const PATCH = defineRoute<OwnerProfileInput>({
  roles: [ROLES.SALON_OWNER],
  body: ownerProfileSchema,
  handler: async ({ user, body }) => {
    const ref = db.collection(COLLECTIONS.USERS).doc(user.uid);
    await ref.update({ ...body, updatedAt: FieldValue.serverTimestamp() });
    const snap = await ref.get();
    return serializeUser({ ...(snap.data() as UserDocument), id: snap.id });
  },
});
