import { customerNotesSchema, ROLES, type CustomerNotesInput } from "@/lib/shared";
import { requireActiveSalon, requireVerifiedSalonOwner } from "@/server/http/auth";
import { defineRoute } from "@/server/http/route";
import { updateCustomerNotes } from "@/server/services/customerService";

export const runtime = "nodejs";

export const PATCH = defineRoute<CustomerNotesInput, undefined, { customerId: string }>({
  roles: [ROLES.SALON_OWNER],
  body: customerNotesSchema,
  handler: async ({ user, params, body }) => {
    requireVerifiedSalonOwner(user);
    const salon = await requireActiveSalon(user);
    return updateCustomerNotes(salon.id, user.uid, params.customerId, body.notes);
  },
});
