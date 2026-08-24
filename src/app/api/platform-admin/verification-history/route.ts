import { ROLES, verificationHistoryQuerySchema, type VerificationHistoryQuery } from "@/lib/shared";
import { defineRoute } from "@/server/http/route";
import { listVerificationHistory } from "@/server/services/platformAdminService";

export const runtime = "nodejs";

export const GET = defineRoute<undefined, VerificationHistoryQuery>({
  roles: [ROLES.PLATFORM_ADMIN],
  query: verificationHistoryQuerySchema,
  handler: ({ query }) => listVerificationHistory(query),
});
