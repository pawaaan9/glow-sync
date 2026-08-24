import { bookingAssignStaffSchema, ROLES, type BookingAssignStaffInput } from "@/lib/shared";
import { requireActiveSalon, requireVerifiedSalonOwner } from "@/server/http/auth";
import { defineRoute } from "@/server/http/route";
import { assignStaff } from "@/server/services/bookingService";

export const runtime = "nodejs";

export const PATCH = defineRoute<BookingAssignStaffInput, undefined, { bookingId: string }>({
  roles: [ROLES.SALON_OWNER],
  body: bookingAssignStaffSchema,
  handler: async ({ user, params, body }) => {
    requireVerifiedSalonOwner(user);
    const salon = await requireActiveSalon(user);
    return assignStaff(salon.id, user.uid, params.bookingId, body);
  },
});
