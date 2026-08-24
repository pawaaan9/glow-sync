import { ROLES, paginationSchema, type PaginationQuery } from "@/lib/shared";
import { defineRoute } from "@/server/http/route";
import { listMyNotifications } from "@/server/services/notificationService";

export const runtime = "nodejs";

export const GET = defineRoute<undefined, PaginationQuery>({
  roles: [ROLES.PLATFORM_ADMIN],
  query: paginationSchema,
  handler: ({ user, query }) => listMyNotifications(user.uid, user.role, query),
});
