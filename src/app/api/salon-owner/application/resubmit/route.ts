import {
  ROLES,
  resubmitSalonApplicationSchema,
  type ResubmitSalonApplicationInput,
} from "@/lib/shared";
import { defineRoute } from "@/server/http/route";
import { ApiError } from "@/server/lib/apiError";
import { resubmitSalonApplication } from "@/server/services/salonApplicationService";

export const runtime = "nodejs";

export const PATCH = defineRoute<ResubmitSalonApplicationInput>({
  roles: [ROLES.SALON_OWNER],
  body: resubmitSalonApplicationSchema,
  handler: async ({ user, body }) => {
    if (!user.salonId) throw ApiError.notFound("No application found to resubmit");
    await resubmitSalonApplication(user.salonId, user.uid, body);
    return { resubmitted: true };
  },
});
