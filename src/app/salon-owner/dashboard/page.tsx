"use client";

import { FullPageLoader } from "@/components/auth/FullPageLoader";
import { Badge } from "@/components/ui/Badge";
import { useMyApplication } from "@/hooks/use-salon-owner";
import { CheckCircle2 } from "lucide-react";

/**
 * The real, backend-verified salon-owner dashboard — only reachable once
 * a platform admin has approved the application (SalonOwnerStatusGate
 * enforces this client-side; requireVerifiedSalonOwner + requireActiveSalon
 * enforce it for real on every glowsync-be salon-owner API call).
 *
 * This is intentionally minimal: full salon-management features (branches,
 * services, staff, bookings) are a separate, larger scope than this
 * verification module — see the middleware chain in
 * glowsync-be/src/routes/salonOwner.routes.ts for where they'd plug in.
 */
export default function SalonOwnerDashboardPage() {
  const { data, isLoading } = useMyApplication();

  if (isLoading || !data?.salon) return <FullPageLoader />;

  const { salon } = data;

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
      <Badge variant="success" className="w-fit">
        <CheckCircle2 className="size-3.5" />
        Active
      </Badge>
      <h1 className="font-display mt-3 text-3xl text-ink">{salon.name}</h1>
      <p className="mt-1 text-neutral-500">
        {salon.city}, {salon.district}
      </p>

      <div className="mt-10 rounded-3xl border border-neutral-100 bg-white p-6">
        <p className="text-sm text-neutral-500">
          Your salon is live on GlowSync. Full salon-management tools (branches, services, staff,
          and bookings) are on the way.
        </p>
      </div>
    </div>
  );
}
