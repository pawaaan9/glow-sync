/** Machine-readable error codes used in the consistent API error envelope. */
export const API_ERROR_CODES = {
  UNAUTHENTICATED: "UNAUTHENTICATED",
  FORBIDDEN: "FORBIDDEN",
  ACCOUNT_UNVERIFIED: "ACCOUNT_UNVERIFIED",
  ACCOUNT_REJECTED: "ACCOUNT_REJECTED",
  ACCOUNT_SUSPENDED: "ACCOUNT_SUSPENDED",
  SALON_INACTIVE: "SALON_INACTIVE",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  RATE_LIMITED: "RATE_LIMITED",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

export type ApiErrorCode = (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES];

/** Shape returned by every failed API response. */
export interface ApiErrorBody {
  success: false;
  error: {
    code: ApiErrorCode;
    message: string;
    details?: unknown;
  };
}

export interface ApiSuccessBody<T> {
  success: true;
  data: T;
}
