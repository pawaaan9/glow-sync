import { ROLES } from "@/lib/shared";
import { defineRoute } from "@/server/http/route";
import { getDashboard } from "@/server/services/platformAdminService";

export const runtime = "nodejs";

export const GET = defineRoute({
  roles: [ROLES.PLATFORM_ADMIN],
  handler: () => getDashboard(),
});
