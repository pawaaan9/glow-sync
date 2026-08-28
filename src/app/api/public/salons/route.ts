import { defineRoute } from "@/server/http/route";
import { listPublicSalons } from "@/server/services/publicCatalogService";
import { z } from "zod";

export const runtime = "nodejs";

const querySchema = z.object({
  search: z.string().trim().max(120).optional(),
  city: z.string().trim().max(80).optional(),
  category: z.string().trim().max(60).optional(),
  sort: z.enum(["name", "price-low", "price-high"]).optional(),
});

/** Public salon discovery — ACTIVE salons only, no auth. */
export const GET = defineRoute<undefined, z.infer<typeof querySchema>>({
  query: querySchema,
  handler: ({ query }) => listPublicSalons(query),
});
