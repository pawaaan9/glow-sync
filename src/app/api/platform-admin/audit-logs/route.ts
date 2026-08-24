import { ROLES, auditLogsQuerySchema, type AuditLogsQuery } from "@/lib/shared";
import { defineRoute } from "@/server/http/route";
import { listAuditLogs } from "@/server/services/platformAdminService";

export const runtime = "nodejs";

export const GET = defineRoute<undefined, AuditLogsQuery>({
  roles: [ROLES.PLATFORM_ADMIN],
  query: auditLogsQuerySchema,
  handler: ({ query }) => listAuditLogs(query),
});
