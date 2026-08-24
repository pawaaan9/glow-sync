import { bookingRescheduleSchema, ROLES, type BookingRescheduleInput } from "@/lib/shared";
import { requireActiveSalon, requireVerifiedSalonOwner } from "@/server/http/auth";
import { defineRoute } from "@/server/http/route";
import { rescheduleBooking } from "@/server/services/bookingService";

export const runtime = "nodejs";

export const PATCH = defineRoute<BookingRescheduleInput, undefined, { bookingId: string }>({
  roles: [ROLES.SALON_OWNER],
  body: bookingRescheduleSchema,
  handler: async ({ user, params, body }) => {
    requireVerifiedSalonOwner(user);
    const salon = await requireActiveSalon(user);
    return rescheduleBooking(salon.id, user.uid, params.bookingId, body);
  },
});
