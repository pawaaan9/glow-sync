"use client";

import { FullPageLoader } from "@/components/auth/FullPageLoader";
import { StatusPageShell } from "@/components/salon-owner/StatusPageShell";
import { Button } from "@/components/ui/Button";
import { useMyApplication } from "@/hooks/use-salon-owner";
import { useAuth } from "@/providers/auth-provider";
import { LifeBuoy, LogOut, ShieldAlert } from "lucide-react";

export default function AccountSuspendedPage() {
  const { data, isLoading } = useMyApplication();
  const { signOut } = useAuth();

  if (isLoading || !data) return <FullPageLoader />;

  const { user, salon } = data;

  return (
    <StatusPageShell
      icon={ShieldAlert}
      iconClassName="bg-red-100 text-red-600"
      badge={{ label: "Account suspended", variant: "danger" }}
      title="Your salon has been suspended"
      description="Salon-management access has been paused by a GlowSync platform administrator. Your data and bookings are preserved and will be restored if your account is reactivated."
    >
      {user.suspendedReason && (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-left text-sm text-red-800">
          <p className="font-medium">Reason</p>
          <p className="mt-1">{user.suspendedReason}</p>
        </div>
      )}

      {salon && (
        <p className="text-sm text-neutral-400">
          If you believe this is a mistake, contact support and reference{" "}
          <span className="font-medium text-neutral-600">{salon.name}</span>.
        </p>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button href="mailto:support@glowsync.app" variant="outline" fullWidth icon={<LifeBuoy className="size-4" />}>
          Contact support
        </Button>
        <Button onClick={() => signOut()} variant="ghost" fullWidth icon={<LogOut className="size-4" />}>
          Log out
        </Button>
      </div>
    </StatusPageShell>
  );
}
