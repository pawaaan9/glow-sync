import "server-only";
import { API_ERROR_CODES } from "@/lib/shared";
import { ApiError } from "@/server/lib/apiError";
import { NextResponse } from "next/server";

/** The { success: true, data } envelope every endpoint returns. */
export function success<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

/**
 * Turns anything thrown inside a route handler into the consistent
 * { success: false, error: { code, message, details } } response — the
 * Next-native replacement for the Express error-handling middleware.
 */
export function failure(err: unknown, method: string, path: string) {
  if (err instanceof ApiError) {
    return NextResponse.json(
      { success: false, error: { code: err.code, message: err.message, details: err.details } },
      { status: err.statusCode },
    );
  }

  // Never log request bodies here — they may carry passwords in transit
  // before validation rejects them, or other sensitive fields.
  console.error(`[unhandled] ${method} ${path}:`, err);

  return NextResponse.json(
    { success: false, error: { code: API_ERROR_CODES.INTERNAL_ERROR, message: "Internal server error" } },
    { status: 500 },
  );
}
