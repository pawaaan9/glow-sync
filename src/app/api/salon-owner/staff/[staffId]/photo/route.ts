import { ROLES } from "@/lib/shared";
import { requireActiveSalon, requireVerifiedSalonOwner } from "@/server/http/auth";
import { defineRoute } from "@/server/http/route";
import { readUploadedFile } from "@/server/http/upload";
import { uploadStaffPhoto } from "@/server/services/storageService";

export const runtime = "nodejs";

export const POST = defineRoute<undefined, undefined, { staffId: string }>({
  roles: [ROLES.SALON_OWNER],
  handler: async ({ req, user, params }) => {
    requireVerifiedSalonOwner(user);
    const salon = await requireActiveSalon(user);
    const file = await readUploadedFile(req, "photo");
    return uploadStaffPhoto(salon.id, params.staffId, file);
  },
});
