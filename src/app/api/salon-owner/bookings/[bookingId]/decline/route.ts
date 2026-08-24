import { reasonRequiredSchema, ROLES, type ReasonRequiredInput } from "@/lib/shared";
import { requireActiveSalon, requireVerifiedSalonOwner } from "@/server/http/auth";
import { defineRoute } from "@/server/http/route";
import { declineBooking } from "@/server/services/bookingService";

export const runtime = "nodejs";

export const PATCH = defineRoute<ReasonRequiredInput, undefined, { bookingId: string }>({
  roles: [ROLES.SALON_OWNER],
  body: reasonRequiredSchema,
  handler: async ({ user, params, body }) => {
    requireVerifiedSalonOwner(user);
    const salon = await requireActiveSalon(user);
    return declineBooking(salon.id, user.uid, params.bookingId, body.reason);
  },
});
