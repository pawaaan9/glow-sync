"use client";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Routes that render their own full-page shell instead of the public site chrome. */
const BARE_ROUTE_PREFIXES = ["/platform-admin"];

/**
 * Wraps every page in the public navbar/footer, except the admin panel —
 * PlatformAdminShell provides its own sidebar and header there, so the
 * marketing chrome would only duplicate navigation and eat vertical space.
 */
export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const bare = BARE_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (bare) {
    return <main className="flex-1">{children}</main>;
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
