import { defineRoute } from "@/server/http/route";
import { getPublicFilters } from "@/server/services/publicCatalogService";

export const runtime = "nodejs";

/** Cities and categories that actually have a live salon behind them. */
export const GET = defineRoute({
  handler: () => getPublicFilters(),
});
