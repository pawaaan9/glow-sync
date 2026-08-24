import "server-only";
import { API_ERROR_CODES } from "@/lib/shared";
import { ApiError } from "@/server/lib/apiError";
import type { NextRequest } from "next/server";

export interface RateLimitRule {
  /** Distinguishes buckets so one rule cannot spend another's budget. */
  name: string;
  windowMs: number;
  limit: number;
  message: string;
}

/** Strict limiter for authentication endpoints (register, login-adjacent). */
export const AUTH_RATE_LIMIT: RateLimitRule = {
  name: "auth",
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: "Too many attempts. Please try again later.",
};

/** Limiter for platform-admin mutating actions (approve/reject/suspend/reactivate). */
export const ADMIN_ACTION_RATE_LIMIT: RateLimitRule = {
  name: "admin-action",
  windowMs: 5 * 60 * 1000,
  limit: 60,
  message: "Too many admin actions. Please slow down.",
};

/** General-purpose limiter applied to every route. */
export const GENERAL_RATE_LIMIT: RateLimitRule = {
  name: "general",
  windowMs: 60 * 1000,
  limit: 300,
  message: "Too many requests. Please slow down.",
};

interface Bucket {
  count: number;
  resetAt: number;
}

/**
 * Fixed-window counters held in module scope. This replaces
 * express-rate-limit, which cannot run here because there is no long-lived
 * Express app.
 *
 * Two caveats worth knowing before relying on this in production: the
 * counters are per-process, so a horizontally scaled or serverless deploy
 * gives each instance its own budget; and they reset on redeploy. Move the
 * store to Redis/Upstash if the limit needs to hold across instances.
 */
const buckets = new Map<string, Bucket>();

/** Drops expired buckets so the map cannot grow without bound. */
function sweep(now: number) {
  if (buckets.size < 5000) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

function clientKey(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

export function enforceRateLimit(req: NextRequest, rule: RateLimitRule) {
  const now = Date.now();
  sweep(now);

  const key = `${rule.name}:${clientKey(req)}`;
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + rule.windowMs });
    return;
  }

  bucket.count += 1;
  if (bucket.count > rule.limit) {
    throw new ApiError(429, API_ERROR_CODES.RATE_LIMITED, rule.message);
  }
}

/** Test seam: clears all counters between test cases. */
export function resetRateLimits() {
  buckets.clear();
}
