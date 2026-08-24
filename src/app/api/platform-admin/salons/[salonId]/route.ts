import { ROLES } from "@/lib/shared";
import { requireSalonAccess } from "@/server/http/auth";
import { defineRoute } from "@/server/http/route";
import { serializeSalon } from "@/server/lib/serializers";

export const runtime = "nodejs";

export const GET = defineRoute<undefined, undefined, { salonId: string }>({
  roles: [ROLES.PLATFORM_ADMIN],
  handler: async ({ user, params }) => serializeSalon(await requireSalonAccess(user, params.salonId)),
});
