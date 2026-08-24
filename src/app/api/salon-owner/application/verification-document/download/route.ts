import { ROLES } from "@/lib/shared";
import { defineRoute } from "@/server/http/route";
import { ApiError } from "@/server/lib/apiError";
import { getVerificationDocumentDownloadUrl } from "@/server/services/storageService";

export const runtime = "nodejs";

export const GET = defineRoute({
  roles: [ROLES.SALON_OWNER],
  handler: async ({ user }) => {
    if (!user.salonId) throw ApiError.notFound("No application found");
    return { url: await getVerificationDocumentDownloadUrl(user.salonId) };
  },
});
