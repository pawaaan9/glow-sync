import { defineRoute } from "@/server/http/route";

export const runtime = "nodejs";

export const GET = defineRoute({ handler: () => ({ status: "ok" }) });
