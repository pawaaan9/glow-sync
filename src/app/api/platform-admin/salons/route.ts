import { ROLES, salonsQuerySchema, type SalonsQuery } from "@/lib/shared";
import { defineRoute } from "@/server/http/route";
import { listSalons } from "@/server/services/platformAdminService";

export const runtime = "nodejs";

export const GET = defineRoute<undefined, SalonsQuery>({
  roles: [ROLES.PLATFORM_ADMIN],
  query: salonsQuerySchema,
  handler: ({ query }) => listSalons(query),
});
