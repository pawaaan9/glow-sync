import { customersQuerySchema, ROLES, type CustomersQuery } from "@/lib/shared";
import { requireActiveSalon, requireVerifiedSalonOwner } from "@/server/http/auth";
import { defineRoute } from "@/server/http/route";
import { listCustomers } from "@/server/services/customerService";

export const runtime = "nodejs";

export const GET = defineRoute<undefined, CustomersQuery>({
  roles: [ROLES.SALON_OWNER],
  query: customersQuerySchema,
  handler: async ({ user, query }) => {
    requireVerifiedSalonOwner(user);
    const salon = await requireActiveSalon(user);
    return listCustomers(salon.id, query);
  },
});
