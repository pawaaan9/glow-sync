import { ROLES } from "@/lib/shared";
import { requireActiveSalon, requireVerifiedSalonOwner } from "@/server/http/auth";
import { defineRoute } from "@/server/http/route";
import { readUploadedFile } from "@/server/http/upload";
import { uploadSalonCoverImage } from "@/server/services/storageService";

export const runtime = "nodejs";

export const POST = defineRoute({
  roles: [ROLES.SALON_OWNER],
  handler: async ({ req, user }) => {
    requireVerifiedSalonOwner(user);
    const salon = await requireActiveSalon(user);
    const file = await readUploadedFile(req, "cover");
    return uploadSalonCoverImage(salon.id, file);
  },
});
