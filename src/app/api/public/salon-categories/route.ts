import { defineRoute } from "@/server/http/route";
import { listActiveSalonCategories } from "@/server/services/salonCategoryService";

export const runtime = "nodejs";

/** Active salon categories, for the registration form. No auth. */
export const GET = defineRoute({
  handler: () => listActiveSalonCategories(),
});
