import { ROLES } from "@/lib/shared";
import { requireActiveSalon, requireVerifiedSalonOwner } from "@/server/http/auth";
import { defineRoute } from "@/server/http/route";
import { completeBooking } from "@/server/services/bookingService";

export const runtime = "nodejs";

export const PATCH = defineRoute<undefined, undefined, { bookingId: string }>({
  roles: [ROLES.SALON_OWNER],
  handler: async ({ user, params }) => {
    requireVerifiedSalonOwner(user);
    const salon = await requireActiveSalon(user);
    return completeBooking(salon.id, user.uid, params.bookingId);
  },
});
