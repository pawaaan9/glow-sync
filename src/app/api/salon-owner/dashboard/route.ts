import { ROLES } from "@/lib/shared";
import { requireActiveSalon, requireVerifiedSalonOwner } from "@/server/http/auth";
import { defineRoute } from "@/server/http/route";

export const runtime = "nodejs";

/** Representative salon-management endpoint — proves the verified+active gate. */
export const GET = defineRoute({
  roles: [ROLES.SALON_OWNER],
  handler: async ({ user }) => {
    requireVerifiedSalonOwner(user);
    const salon = await requireActiveSalon(user);
    return { message: "Welcome to your salon dashboard", salonId: salon.id };
  },
});
