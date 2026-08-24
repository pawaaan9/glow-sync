import { registerSalonOwnerSchema, type RegisterSalonOwnerInput } from "@/lib/shared";
import { AUTH_RATE_LIMIT } from "@/server/http/rateLimit";
import { defineRoute } from "@/server/http/route";
import { registerSalonOwner } from "@/server/services/authService";

export const runtime = "nodejs";

export const POST = defineRoute<RegisterSalonOwnerInput>({
  rateLimit: AUTH_RATE_LIMIT,
  body: registerSalonOwnerSchema,
  status: 201,
  handler: async ({ body }) => {
    const result = await registerSalonOwner(body);
    // Safe response only — no password, no token, no internal ids beyond
    // what the client needs to know registration succeeded.
    return { email: result.email, salonId: result.salonId };
  },
});
