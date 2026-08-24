import { ROLES } from "@/lib/shared";
import { defineRoute } from "@/server/http/route";
import { getSalonApplication } from "@/server/services/platformAdminService";

export const runtime = "nodejs";

export const GET = defineRoute<undefined, undefined, { salonId: string }>({
  roles: [ROLES.PLATFORM_ADMIN],
  handler: ({ params }) => getSalonApplication(params.salonId),
});
