"use client";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Routes that render their own full-page shell instead of the public site chrome. */
const BARE_ROUTE_PREFIXES = ["/platform-admin", "/salon-owner"];
/** Same idea, but an exact match only — /register/salon-owner still wants the normal chrome. */
const BARE_ROUTES = ["/login", "/register"];
/** Keep the navbar but drop the footer — these pages end in a long form, not a browsing flow. */
const NO_FOOTER_ROUTES = ["/register/salon-owner"];

/**
 * Wraps every page in the public navbar/footer, except the admin panel,
 * the salon-owner dashboard, and the login/register screens —
 * PlatformAdminShell, SalonOwnerShell, and AuthShell each provide their own
 * full-page shell, so the marketing chrome would only duplicate navigation
 * and eat vertical space.
 */
export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const bare =
    BARE_ROUTE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)) ||
    BARE_ROUTES.includes(pathname);

  if (bare) {
    return <main className="flex-1">{children}</main>;
  }

  if (NO_FOOTER_ROUTES.includes(pathname)) {
    return (
      <>
        <Navbar />
        <main className="flex-1">{children}</main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
