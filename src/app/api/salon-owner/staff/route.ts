import { ROLES, staffQuerySchema, staffSchema, type StaffInput, type StaffQuery } from "@/lib/shared";
import { requireActiveSalon, requireVerifiedSalonOwner } from "@/server/http/auth";
import { defineRoute } from "@/server/http/route";
import { createStaffMember, listStaff } from "@/server/services/staffService";

export const runtime = "nodejs";

export const GET = defineRoute<undefined, StaffQuery>({
  roles: [ROLES.SALON_OWNER],
  query: staffQuerySchema,
  handler: async ({ user, query }) => {
    requireVerifiedSalonOwner(user);
    const salon = await requireActiveSalon(user);
    return listStaff(salon.id, query);
  },
});

export const POST = defineRoute<StaffInput>({
  roles: [ROLES.SALON_OWNER],
  body: staffSchema,
  handler: async ({ user, body }) => {
    requireVerifiedSalonOwner(user);
    const salon = await requireActiveSalon(user);
    return createStaffMember(salon.id, user.uid, body);
  },
});
