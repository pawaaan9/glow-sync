"use client";

import { FullPageLoader } from "@/components/auth/FullPageLoader";
import type { Role } from "@/lib/shared";
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { ReactNode } from "react";

/**
 * Client-side route guard: redirects to /login when signed out, or to
 * `forbiddenRedirect` when signed in but not one of `roles`. This is a UX
 * convenience only — every protected endpoint re-checks role/status
 * server-side (see src/server/http/auth.ts), so this guard being
 * bypassed or racy can never grant real access.
 */
export function RequireRole({
  roles,
  children,
  loginRedirect = "/login",
  forbiddenRedirect = "/",
}: {
  roles: Role[];
  children: ReactNode;
  loginRedirect?: string;
  forbiddenRedirect?: string;
}) {
  const router = useRouter();
  const { firebaseUser, me, isLoading, isError } = useAuth();

  const authorized = Boolean(me && roles.includes(me.user.role));

  useEffect(() => {
    if (isLoading) return;
    if (!firebaseUser) {
      router.replace(loginRedirect);
      return;
    }
    if (isError || (me && !authorized)) {
      router.replace(forbiddenRedirect);
    }
  }, [isLoading, firebaseUser, isError, me, authorized, loginRedirect, forbiddenRedirect, router]);

  if (isLoading || !firebaseUser || !authorized) {
    return <FullPageLoader />;
  }

  return <>{children}</>;
}
