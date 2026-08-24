import { ROLES } from "@/lib/shared";
import { defineRoute } from "@/server/http/route";
import { markMyNotificationRead } from "@/server/services/notificationService";

export const runtime = "nodejs";

export const PATCH = defineRoute<undefined, undefined, { notificationId: string }>({
  roles: [ROLES.SALON_OWNER],
  handler: async ({ user, params }) => {
    await markMyNotificationRead(user.uid, user.role, params.notificationId);
    return { read: true };
  },
});
