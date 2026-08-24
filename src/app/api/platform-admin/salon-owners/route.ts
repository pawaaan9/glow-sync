import { ROLES, salonOwnersQuerySchema, type SalonOwnersQuery } from "@/lib/shared";
import { defineRoute } from "@/server/http/route";
import { listSalonOwners } from "@/server/services/platformAdminService";

export const runtime = "nodejs";

export const GET = defineRoute<undefined, SalonOwnersQuery>({
  roles: [ROLES.PLATFORM_ADMIN],
  query: salonOwnersQuerySchema,
  handler: ({ query }) => listSalonOwners(query),
});
