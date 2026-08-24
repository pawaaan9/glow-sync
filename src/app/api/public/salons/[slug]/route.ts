import { defineRoute } from "@/server/http/route";
import { getPublicSalonBySlug } from "@/server/services/publicCatalogService";

export const runtime = "nodejs";

/** Public salon profile by slug — 404s for anything not ACTIVE. */
export const GET = defineRoute<undefined, undefined, { slug: string }>({
  handler: ({ params }) => getPublicSalonBySlug(params.slug),
});
