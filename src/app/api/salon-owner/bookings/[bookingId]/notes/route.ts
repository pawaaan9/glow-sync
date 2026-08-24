import { bookingNotesSchema, ROLES, type BookingNotesInput } from "@/lib/shared";
import { requireActiveSalon, requireVerifiedSalonOwner } from "@/server/http/auth";
import { defineRoute } from "@/server/http/route";
import { updateBookingNotes } from "@/server/services/bookingService";

export const runtime = "nodejs";

export const PATCH = defineRoute<BookingNotesInput, undefined, { bookingId: string }>({
  roles: [ROLES.SALON_OWNER],
  body: bookingNotesSchema,
  handler: async ({ user, params, body }) => {
    requireVerifiedSalonOwner(user);
    const salon = await requireActiveSalon(user);
    return updateBookingNotes(salon.id, user.uid, params.bookingId, body.notes);
  },
});
