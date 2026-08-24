import { API_ERROR_CODES, type ApiErrorCode } from "@/lib/shared";

/**
 * Thrown anywhere in a route/service/middleware; the central error handler
 * (see middleware/errorHandler.ts) turns it into the consistent
 * { success: false, error: { code, message, details } } response shape.
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: ApiErrorCode,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }

  static unauthenticated(message = "Authentication required") {
    return new ApiError(401, API_ERROR_CODES.UNAUTHENTICATED, message);
  }

  static forbidden(message = "You do not have permission to perform this action") {
    return new ApiError(403, API_ERROR_CODES.FORBIDDEN, message);
  }

  static accountUnverified(message = "Your account is pending verification") {
    return new ApiError(403, API_ERROR_CODES.ACCOUNT_UNVERIFIED, message);
  }

  static accountRejected(message = "Your application was rejected") {
    return new ApiError(403, API_ERROR_CODES.ACCOUNT_REJECTED, message);
  }

  static accountSuspended(message = "Your account has been suspended") {
    return new ApiError(403, API_ERROR_CODES.ACCOUNT_SUSPENDED, message);
  }

  static salonInactive(message = "This salon is not currently active") {
    return new ApiError(403, API_ERROR_CODES.SALON_INACTIVE, message);
  }

  static notFound(message = "Resource not found") {
    return new ApiError(404, API_ERROR_CODES.NOT_FOUND, message);
  }

  static conflict(message: string, details?: unknown) {
    return new ApiError(409, API_ERROR_CODES.CONFLICT, message, details);
  }

  static validation(message = "Validation failed", details?: unknown) {
    return new ApiError(422, API_ERROR_CODES.VALIDATION_ERROR, message, details);
  }

  static internal(message = "Internal server error") {
    return new ApiError(500, API_ERROR_CODES.INTERNAL_ERROR, message);
  }
}
