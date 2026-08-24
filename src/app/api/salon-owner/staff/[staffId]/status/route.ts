import { z } from "zod";
import { ROLES } from "@/lib/shared";
import { requireActiveSalon, requireVerifiedSalonOwner } from "@/server/http/auth";
import { defineRoute } from "@/server/http/route";
import { setStaffActive } from "@/server/services/staffService";

export const runtime = "nodejs";

const statusSchema = z.object({ isActive: z.boolean() });

export const PATCH = defineRoute<{ isActive: boolean }, undefined, { staffId: string }>({
  roles: [ROLES.SALON_OWNER],
  body: statusSchema,
  handler: async ({ user, params, body }) => {
    requireVerifiedSalonOwner(user);
    const salon = await requireActiveSalon(user);
    return setStaffActive(salon.id, user.uid, params.staffId, body.isActive);
  },
});
