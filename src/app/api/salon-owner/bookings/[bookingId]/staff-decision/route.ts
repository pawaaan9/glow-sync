import { bookingStaffDecisionSchema, ROLES, type BookingStaffDecisionInput } from "@/lib/shared";
import { requireActiveSalon, requireVerifiedSalonOwner } from "@/server/http/auth";
import { defineRoute } from "@/server/http/route";
import { recordStaffDecision } from "@/server/services/bookingService";

export const runtime = "nodejs";

export const PATCH = defineRoute<BookingStaffDecisionInput, undefined, { bookingId: string }>({
  roles: [ROLES.SALON_OWNER],
  body: bookingStaffDecisionSchema,
  handler: async ({ user, params, body }) => {
    requireVerifiedSalonOwner(user);
    const salon = await requireActiveSalon(user);
    return recordStaffDecision(salon.id, user.uid, params.bookingId, body);
  },
});
