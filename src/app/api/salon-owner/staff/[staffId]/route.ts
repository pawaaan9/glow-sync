import { ROLES, staffPatchSchema, type StaffPatchInput } from "@/lib/shared";
import { requireActiveSalon, requireVerifiedSalonOwner } from "@/server/http/auth";
import { defineRoute } from "@/server/http/route";
import { getStaffMember, updateStaffMember } from "@/server/services/staffService";

export const runtime = "nodejs";

export const GET = defineRoute<undefined, undefined, { staffId: string }>({
  roles: [ROLES.SALON_OWNER],
  handler: async ({ user, params }) => {
    requireVerifiedSalonOwner(user);
    const salon = await requireActiveSalon(user);
    return getStaffMember(salon.id, params.staffId);
  },
});

export const PATCH = defineRoute<StaffPatchInput, undefined, { staffId: string }>({
  roles: [ROLES.SALON_OWNER],
  body: staffPatchSchema,
  handler: async ({ user, params, body }) => {
    requireVerifiedSalonOwner(user);
    const salon = await requireActiveSalon(user);
    return updateStaffMember(salon.id, user.uid, params.staffId, body);
  },
});
