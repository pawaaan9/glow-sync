import { bookingCreateSchema, bookingsQuerySchema, ROLES, type BookingCreateInput, type BookingsQuery } from "@/lib/shared";
import { requireActiveSalon, requireVerifiedSalonOwner } from "@/server/http/auth";
import { defineRoute } from "@/server/http/route";
import { createBooking, listBookings } from "@/server/services/bookingService";

export const runtime = "nodejs";

/** Also backs the calendar views via dateFrom/dateTo/staffId/status query params. */
export const GET = defineRoute<undefined, BookingsQuery>({
  roles: [ROLES.SALON_OWNER],
  query: bookingsQuerySchema,
  handler: async ({ user, query }) => {
    requireVerifiedSalonOwner(user);
    const salon = await requireActiveSalon(user);
    return listBookings(salon.id, query);
  },
});

/** Walk-in, phone, or WhatsApp bookings created directly by the owner. */
export const POST = defineRoute<BookingCreateInput>({
  roles: [ROLES.SALON_OWNER],
  body: bookingCreateSchema,
  handler: async ({ user, body }) => {
    requireVerifiedSalonOwner(user);
    const salon = await requireActiveSalon(user);
    return createBooking(salon.id, user.uid, body);
  },
});
