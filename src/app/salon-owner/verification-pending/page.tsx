"use client";

import { FullPageLoader } from "@/components/auth/FullPageLoader";
import { StatusPageShell } from "@/components/salon-owner/StatusPageShell";
import { Button } from "@/components/ui/Button";
import { useMyApplication } from "@/hooks/use-salon-owner";
import { useAuth } from "@/providers/auth-provider";
import { Clock3, LifeBuoy, LogOut } from "lucide-react";

export default function VerificationPendingPage() {
  const { data, isLoading } = useMyApplication();
  const { signOut } = useAuth();

  if (isLoading || !data) return <FullPageLoader />;

  const { salon } = data;

  return (
    <StatusPageShell
      icon={Clock3}
      iconClassName="bg-amber-100 text-amber-600"
      badge={{ label: "Pending verification", variant: "warning" }}
      title="Your application is under review"
      description="Thanks for submitting your salon — a GlowSync platform administrator is reviewing it now. This usually takes 1–2 business days. We'll notify you as soon as a decision is made."
    >
      {salon && (
        <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4 text-left text-sm">
          <p className="font-medium text-ink">{salon.name}</p>
          <p className="mt-0.5 text-neutral-500">
            {salon.city}, {salon.district}
          </p>
          <p className="mt-0.5 text-neutral-500">
            Submitted {new Date(salon.createdAt).toLocaleDateString()}
          </p>
        </div>
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
