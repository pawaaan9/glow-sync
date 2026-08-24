import "server-only";
import type { Role } from "@/lib/shared";
import { ApiError } from "@/server/lib/apiError";
import { authenticateRequest, requireRole, type AuthenticatedUser } from "@/server/http/auth";
import {
  enforceRateLimit,
  GENERAL_RATE_LIMIT,
  type RateLimitRule,
} from "@/server/http/rateLimit";
import { failure, success } from "@/server/http/respond";
import type { NextRequest } from "next/server";
import type { ZodType } from "zod";

/**
 * What a handler receives. `user` is non-null exactly when the route
 * declares `auth: true`, which the two overloads below encode so handlers
 * on protected routes never have to null-check it.
 */
export interface RouteContext<TBody, TQuery, TParams> {
  req: NextRequest;
  params: TParams;
  body: TBody;
  query: TQuery;
  user: AuthenticatedUser;
}

export interface RouteOptions<TBody, TQuery, TParams> {
  /** Require a verified Firebase session. Defaults to false (public route). */
  auth?: boolean;
  /** Roles allowed through. Implies `auth`. */
  roles?: Role[];
  /** Validates the JSON body; the parsed result lands on ctx.body. */
  body?: ZodType<TBody>;
  /** Validates the query string; the parsed result lands on ctx.query. */
  query?: ZodType<TQuery>;
  /** An extra limiter on top of the general one every route gets. */
  rateLimit?: RateLimitRule;
  /** Success status code (default 200). */
  status?: number;
  handler: (ctx: RouteContext<TBody, TQuery, TParams>) => Promise<unknown> | unknown;
}

/** Next.js 15 hands route params in as a promise. */
type NextRouteArgs<TParams> = { params: Promise<TParams> };

function parseWith<T>(schema: ZodType<T> | undefined, value: unknown): T {
  if (!schema) return undefined as T;
  const result = schema.safeParse(value);
  if (!result.success) {
    throw ApiError.validation("Validation failed", result.error.flatten());
  }
  return result.data;
}

async function readJsonBody(req: NextRequest): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    // An absent or malformed body is a validation problem, not a crash —
    // hand {} to the schema so it reports the missing fields precisely.
    return {};
  }
}

/**
 * Builds a Next.js route handler from a declarative spec, running the same
 * chain the Express app used to: rate limit → authenticate → authorize →
 * validate → handle → envelope, with every throw funnelled into the shared
 * error shape.
 */
export function defineRoute<TBody = undefined, TQuery = undefined, TParams = Record<string, never>>(
  options: RouteOptions<TBody, TQuery, TParams>,
) {
  return async function handle(req: NextRequest, args: NextRouteArgs<TParams>) {
    try {
      enforceRateLimit(req, GENERAL_RATE_LIMIT);
      if (options.rateLimit) enforceRateLimit(req, options.rateLimit);

      const needsAuth = options.auth === true || Boolean(options.roles?.length);
      // A public route still gets a well-formed (empty) user object rather
      // than null, so handlers share one context shape.
      let user = { } as AuthenticatedUser;
      if (needsAuth) {
        user = await authenticateRequest(req);
        if (options.roles?.length) requireRole(user, options.roles);
      }

      const params = ((await args?.params) ?? {}) as TParams;
      const query = parseWith(
        options.query,
        Object.fromEntries(req.nextUrl.searchParams.entries()),
      );
      const body = options.body ? parseWith(options.body, await readJsonBody(req)) : (undefined as TBody);

      const data = await options.handler({ req, params, body, query, user });
      return success(data, options.status ?? 200);
    } catch (err) {
      return failure(err, req.method, req.nextUrl.pathname);
    }
  };
}

/**
 * Same chain as defineRoute, but the handler returns a Response itself —
 * for endpoints that stream or redirect instead of returning JSON (the
 * verification-document downloads).
 */
export function defineRawRoute<TQuery = undefined, TParams = Record<string, never>>(options: {
  auth?: boolean;
  roles?: Role[];
  query?: ZodType<TQuery>;
  rateLimit?: RateLimitRule;
  handler: (ctx: Omit<RouteContext<undefined, TQuery, TParams>, "body">) => Promise<Response>;
}) {
  return async function handle(req: NextRequest, args: NextRouteArgs<TParams>) {
    try {
      enforceRateLimit(req, GENERAL_RATE_LIMIT);
      if (options.rateLimit) enforceRateLimit(req, options.rateLimit);

      const needsAuth = options.auth === true || Boolean(options.roles?.length);
      let user = {} as AuthenticatedUser;
      if (needsAuth) {
        user = await authenticateRequest(req);
        if (options.roles?.length) requireRole(user, options.roles);
      }

      const params = ((await args?.params) ?? {}) as TParams;
      const query = parseWith(
        options.query,
        Object.fromEntries(req.nextUrl.searchParams.entries()),
      );

      return await options.handler({ req, params, query, user });
    } catch (err) {
      return failure(err, req.method, req.nextUrl.pathname);
    }
  };
}
