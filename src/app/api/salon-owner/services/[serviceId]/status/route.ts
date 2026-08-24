import { z } from "zod";
import { ROLES } from "@/lib/shared";
import { requireActiveSalon, requireVerifiedSalonOwner } from "@/server/http/auth";
import { defineRoute } from "@/server/http/route";
import { setServiceActive } from "@/server/services/serviceCatalogService";

export const runtime = "nodejs";

const statusSchema = z.object({ isActive: z.boolean() });

export const PATCH = defineRoute<{ isActive: boolean }, undefined, { serviceId: string }>({
  roles: [ROLES.SALON_OWNER],
  body: statusSchema,
  handler: async ({ user, params, body }) => {
    requireVerifiedSalonOwner(user);
    const salon = await requireActiveSalon(user);
    return setServiceActive(salon.id, user.uid, params.serviceId, body.isActive);
  },
});
