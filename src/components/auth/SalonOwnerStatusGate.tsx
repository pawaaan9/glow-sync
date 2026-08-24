"use client";

import { FullPageLoader } from "@/components/auth/FullPageLoader";
import { getSalonOwnerRedirectPath } from "@/lib/auth/salon-owner-redirect";
import { ROLES } from "@/lib/shared";
import { useAuth } from "@/providers/auth-provider";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import type { ReactNode } from "react";

/**
 * Wraps every /salon-owner/* page. Ensures the caller is signed in as a
 * salon_owner, then routes them to the page that matches their current
 * verificationStatus (see getSalonOwnerRedirectPath) — this is what stops
 * a pending/rejected/suspended owner from sitting on the dashboard route
 * by typing the URL directly. Still UX-only: glowsync-be's
 * requireVerifiedSalonOwner middleware is the real enforcement.
 */
export function SalonOwnerStatusGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { firebaseUser, me, isLoading, isError } = useAuth();

  const status = me?.user.verificationStatus;
  const redirectPath = status ? getSalonOwnerRedirectPath(status, pathname) : null;

  useEffect(() => {
    if (isLoading) return;
    if (!firebaseUser) {
      router.replace("/login");
      return;
    }
    if (isError || (me && me.user.role !== ROLES.SALON_OWNER)) {
      router.replace("/");
      return;
    }
    if (redirectPath) {
      router.replace(redirectPath);
    }
  }, [isLoading, firebaseUser, isError, me, redirectPath, router]);

  if (isLoading || !firebaseUser || !me || me.user.role !== ROLES.SALON_OWNER || redirectPath) {
    return <FullPageLoader />;
  }

  return <>{children}</>;
}
