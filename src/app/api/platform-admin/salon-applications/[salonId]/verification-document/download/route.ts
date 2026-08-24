import { ROLES } from "@/lib/shared";
import { defineRoute } from "@/server/http/route";
import { getVerificationDocumentDownloadUrl } from "@/server/services/storageService";

export const runtime = "nodejs";

export const GET = defineRoute<undefined, undefined, { salonId: string }>({
  roles: [ROLES.PLATFORM_ADMIN],
  handler: async ({ params }) => ({
    url: await getVerificationDocumentDownloadUrl(params.salonId),
  }),
});
