import {
  ROLES,
  salonCategoryCreateSchema,
  type SalonCategoryCreateInput,
} from "@/lib/shared";
import { defineRoute } from "@/server/http/route";
import {
  createSalonCategory,
  listSalonCategoriesForAdmin,
} from "@/server/services/salonCategoryService";

export const runtime = "nodejs";

export const GET = defineRoute({
  roles: [ROLES.PLATFORM_ADMIN],
  handler: () => listSalonCategoriesForAdmin(),
});

export const POST = defineRoute<SalonCategoryCreateInput>({
  roles: [ROLES.PLATFORM_ADMIN],
  body: salonCategoryCreateSchema,
  status: 201,
  handler: ({ body, user }) => createSalonCategory(body, user.uid),
});
