import { ROLES, salonProfileSchema, type SalonProfileInput } from "@/lib/shared";
import { requireActiveSalon, requireVerifiedSalonOwner } from "@/server/http/auth";
import { defineRoute } from "@/server/http/route";
import { serializeSalon } from "@/server/lib/serializers";
import { updateSalonProfile } from "@/server/services/salonProfileService";

export const runtime = "nodejs";

export const GET = defineRoute({
  roles: [ROLES.SALON_OWNER],
  handler: async ({ user }) => {
    requireVerifiedSalonOwner(user);
    return serializeSalon(await requireActiveSalon(user));
  },
});

export const PATCH = defineRoute<SalonProfileInput>({
  roles: [ROLES.SALON_OWNER],
  body: salonProfileSchema,
  handler: async ({ user, body }) => {
    requireVerifiedSalonOwner(user);
    const salon = await requireActiveSalon(user);
    return updateSalonProfile(salon.id, user.uid, body);
  },
});
