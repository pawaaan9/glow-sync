import { ROLES } from "@/lib/shared";
import { defineRoute } from "@/server/http/route";
import { markNotificationRead } from "@/server/services/notificationService";

export const runtime = "nodejs";

export const PATCH = defineRoute<undefined, undefined, { notificationId: string }>({
  roles: [ROLES.PLATFORM_ADMIN],
  handler: async ({ params }) => {
    await markNotificationRead(params.notificationId);
    return { read: true };
  },
});
