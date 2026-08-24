import { requireSalonAccess } from "@/server/http/auth";
import { defineRoute } from "@/server/http/route";
import { serializeSalon } from "@/server/lib/serializers";

export const runtime = "nodejs";

/**
 * Owner-or-admin lookup by id. requireSalonAccess enforces real ownership
 * against Firestore for a non-admin caller.
 */
export const GET = defineRoute<undefined, undefined, { salonId: string }>({
  auth: true,
  handler: async ({ user, params }) => {
    const salon = await requireSalonAccess(user, params.salonId);
    return serializeSalon(salon);
  },
});
