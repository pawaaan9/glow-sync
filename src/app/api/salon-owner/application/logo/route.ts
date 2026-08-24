import { ROLES } from "@/lib/shared";
import { defineRoute } from "@/server/http/route";
import { readUploadedFile } from "@/server/http/upload";
import { ApiError } from "@/server/lib/apiError";
import { uploadSalonLogo } from "@/server/services/storageService";

export const runtime = "nodejs";

export const POST = defineRoute({
  roles: [ROLES.SALON_OWNER],
  handler: async ({ req, user }) => {
    if (!user.salonId) throw ApiError.notFound("No application found");
    const file = await readUploadedFile(req, "logo");
    return uploadSalonLogo(user.salonId, file);
  },
});
