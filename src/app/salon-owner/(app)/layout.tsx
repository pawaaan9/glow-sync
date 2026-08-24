"use client";

import { SalonOwnerShell } from "@/components/salon-owner/SalonOwnerShell";

/**
 * A route group so this shell wraps the dashboard/bookings/services/etc.
 * workspace only — the status pages (verification-pending,
 * application-rejected, account-suspended) stay outside it, still gated by
 * the parent layout's SalonOwnerStatusGate but without a sidebar to manage.
 */
export default function SalonOwnerAppLayout({ children }: { children: React.ReactNode }) {
  return <SalonOwnerShell>{children}</SalonOwnerShell>;
}
