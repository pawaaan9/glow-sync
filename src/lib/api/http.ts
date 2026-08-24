import { auth } from "@/lib/firebase/client";
import { ApiError } from "./client";

interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; details?: unknown };
}

/**
 * Fetch wrapper for the API routes under src/app/api: attaches the current
 * Firebase ID token when signed in, and unwraps the { success, data } /
 * { success, error } envelope into either a plain value or a thrown
 * ApiError with the server's code/message intact.
 *
 * Paths are same-origin and relative, so there is no base URL and no CORS
 * preflight — the API ships with the app.
 */
export async function apiFetch<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {},
): Promise<T> {
  const { auth: requiresAuth = true, headers, ...rest } = options;

  const finalHeaders = new Headers(headers);
  if (rest.body && !(rest.body instanceof FormData)) {
    finalHeaders.set("Content-Type", "application/json");
  }

  if (requiresAuth) {
    const idToken = await auth.currentUser?.getIdToken();
    if (idToken) finalHeaders.set("Authorization", `Bearer ${idToken}`);
  }

  const res = await fetch(path, { ...rest, headers: finalHeaders });

  let body: ApiEnvelope<T> | undefined;
  try {
    body = await res.json();
  } catch {
    // Non-JSON response (e.g. a proxy error page) — fall through to the status-based error below.
  }

  if (!res.ok || !body?.success) {
    throw new ApiError(
      body?.error?.message ?? `Request failed with status ${res.status}`,
      res.status,
      body?.error?.code,
      body?.error?.details,
    );
  }

  return body.data as T;
}

export function apiGet<T>(path: string, query?: Record<string, string | number | undefined>) {
  const search = query
    ? `?${new URLSearchParams(
        Object.entries(query).filter((e): e is [string, string] => e[1] !== undefined).map(
          ([k, v]) => [k, String(v)],
        ),
      ).toString()}`
    : "";
  return apiFetch<T>(`${path}${search}`);
}

export function apiPost<T>(path: string, body?: unknown, options?: { auth?: boolean }) {
  return apiFetch<T>(path, {
    method: "POST",
    body: body instanceof FormData ? body : JSON.stringify(body ?? {}),
    auth: options?.auth,
  });
}

export function apiPatch<T>(path: string, body?: unknown) {
  return apiFetch<T>(path, { method: "PATCH", body: JSON.stringify(body ?? {}) });
}

export function apiDelete<T>(path: string, body?: unknown) {
  return apiFetch<T>(path, {
    method: "DELETE",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}
