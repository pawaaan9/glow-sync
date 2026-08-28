import {
  ROLES,
  salonCategoryUpdateSchema,
  type SalonCategoryUpdateInput,
} from "@/lib/shared";
import { defineRoute } from "@/server/http/route";
import {
  deleteSalonCategory,
  updateSalonCategory,
} from "@/server/services/salonCategoryService";

export const runtime = "nodejs";

export const PATCH = defineRoute<SalonCategoryUpdateInput, undefined, { categoryId: string }>({
  roles: [ROLES.PLATFORM_ADMIN],
  body: salonCategoryUpdateSchema,
  handler: ({ params, body, user }) => updateSalonCategory(params.categoryId, body, user.uid),
});

export const DELETE = defineRoute<undefined, undefined, { categoryId: string }>({
  roles: [ROLES.PLATFORM_ADMIN],
  handler: async ({ params, user }) => {
    await deleteSalonCategory(params.categoryId, user.uid);
    return { deleted: true };
  },
});
