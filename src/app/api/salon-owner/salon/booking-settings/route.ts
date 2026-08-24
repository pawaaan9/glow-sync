import { ROLES, salonBookingSettingsSchema, type SalonBookingSettingsInput } from "@/lib/shared";
import { requireActiveSalon, requireVerifiedSalonOwner } from "@/server/http/auth";
import { defineRoute } from "@/server/http/route";
import { updateSalonBookingSettings } from "@/server/services/salonProfileService";

export const runtime = "nodejs";

export const PATCH = defineRoute<SalonBookingSettingsInput>({
  roles: [ROLES.SALON_OWNER],
  body: salonBookingSettingsSchema,
  handler: async ({ user, body }) => {
    requireVerifiedSalonOwner(user);
    const salon = await requireActiveSalon(user);
    return updateSalonBookingSettings(salon.id, user.uid, body);
  },
});
