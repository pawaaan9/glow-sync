import { z } from "zod";
import { ROLES } from "@/lib/shared";
import { requireActiveSalon, requireVerifiedSalonOwner } from "@/server/http/auth";
import { defineRoute } from "@/server/http/route";
import { readUploadedFile } from "@/server/http/upload";
import { addSalonGalleryImage, removeSalonGalleryImage } from "@/server/services/storageService";

export const runtime = "nodejs";

export const POST = defineRoute({
  roles: [ROLES.SALON_OWNER],
  handler: async ({ req, user }) => {
    requireVerifiedSalonOwner(user);
    const salon = await requireActiveSalon(user);
    const file = await readUploadedFile(req, "image");
    return addSalonGalleryImage(salon.id, file);
  },
});

const removeGallerySchema = z.object({ url: z.url() });

export const DELETE = defineRoute<{ url: string }>({
  roles: [ROLES.SALON_OWNER],
  body: removeGallerySchema,
  handler: async ({ user, body }) => {
    requireVerifiedSalonOwner(user);
    const salon = await requireActiveSalon(user);
    return removeSalonGalleryImage(salon.id, body.url);
  },
});
