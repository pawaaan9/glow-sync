/**
 * Simulates network latency so loading states behave like a real API.
 * Swap the mock-backed functions in this folder for real `fetch` calls
 * against the Node/Firebase backend without touching call sites.
 */
export function mockDelay<T>(data: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
