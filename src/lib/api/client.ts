export class ApiError extends Error {
  constructor(
    message: string,
    public status = 400,
    /** Machine-readable error code from the backend's error envelope, e.g. "ACCOUNT_SUSPENDED". */
    public code?: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
