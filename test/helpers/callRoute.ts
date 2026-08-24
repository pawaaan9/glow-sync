import { NextRequest } from "next/server";

/**
 * `Promise<never>` rather than a concrete params shape: never is assignable
 * to every params type, so one helper accepts both the routes that declare
 * dynamic segments and those that declare none.
 */
type RouteHandler = (
  req: NextRequest,
  args: { params: Promise<never> },
) => Promise<Response>;

export interface CallOptions {
  /** Bearer token; the fake auth treats a uid as its own token. */
  token?: string;
  /** Dynamic segment values, e.g. { salonId: "salon-1" }. */
  params?: Record<string, string>;
  /** Query-string values. */
  query?: Record<string, string | number | undefined>;
  /** JSON body for POST/PATCH. */
  body?: unknown;
  /** Multipart body; takes precedence over `body`. */
  formData?: FormData;
  method?: string;
}

export interface CallResult<T = unknown> {
  status: number;
  body: { success: boolean; data?: T; error?: { code: string; message: string; details?: unknown } };
}

/**
 * Invokes a Next.js route handler the way the framework would.
 *
 * There is no HTTP server in these tests — supertest has nothing to bind
 * to, since route handlers are plain functions. Calling them directly
 * exercises the real chain (rate limit → auth → validation → handler) with
 * far less machinery than booting a server.
 */
export async function callRoute<T = unknown>(
  handler: RouteHandler,
  options: CallOptions = {},
): Promise<CallResult<T>> {
  const { token, params = {}, query, body, formData, method } = options;

  const url = new URL("http://localhost:3000/api/test");
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  const headers = new Headers();
  if (token) headers.set("authorization", `Bearer ${token}`);

  let payload: BodyInit | undefined;
  if (formData) {
    payload = formData;
  } else if (body !== undefined) {
    payload = JSON.stringify(body);
    headers.set("content-type", "application/json");
  }

  const resolvedMethod = method ?? (payload ? "POST" : "GET");

  const req = new NextRequest(url, {
    method: resolvedMethod,
    headers,
    body: payload,
  });

  const res = await handler(req, { params: Promise.resolve(params) as Promise<never> });

  let parsed: CallResult<T>["body"];
  try {
    parsed = (await res.json()) as CallResult<T>["body"];
  } catch {
    parsed = { success: res.ok };
  }

  return { status: res.status, body: parsed };
}
