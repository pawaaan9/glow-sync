import { ROLES } from "@/lib/shared";
import { requireActiveSalon, requireVerifiedSalonOwner } from "@/server/http/auth";
import { defineRoute } from "@/server/http/route";
import { serializeSalon } from "@/server/lib/serializers";

export const runtime = "nodejs";

export const GET = defineRoute({
  roles: [ROLES.SALON_OWNER],
  handler: async ({ user }) => {
    requireVerifiedSalonOwner(user);
    return serializeSalon(await requireActiveSalon(user));
  },
});
