"use client";

import { FullPageLoader } from "@/components/auth/FullPageLoader";
import { StatusPageShell } from "@/components/salon-owner/StatusPageShell";
import { Button } from "@/components/ui/Button";
import { useMyApplication } from "@/hooks/use-salon-owner";
import { useAuth } from "@/providers/auth-provider";
import { LogOut, RotateCcw, XCircle } from "lucide-react";
import { useState } from "react";
import { ResubmitForm } from "./ResubmitForm";

export default function ApplicationRejectedPage() {
  const { data, isLoading } = useMyApplication();
  const { signOut } = useAuth();
  const [resubmitting, setResubmitting] = useState(false);
  const [justResubmitted, setJustResubmitted] = useState(false);

  if (isLoading || !data) return <FullPageLoader />;

  const { user, salon } = data;

  return (
    <StatusPageShell
      icon={XCircle}
      iconClassName="bg-red-100 text-red-600"
      badge={{ label: "Application rejected", variant: "danger" }}
      title="Your application was not approved"
      description={
        justResubmitted
          ? "Your updated application has been resubmitted and is now pending review again."
          : "A platform administrator reviewed your application and could not approve it this time. You can review the reason below and resubmit once you've addressed it."
      }
    >
      {!justResubmitted && user.rejectionReason && (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-left text-sm text-red-800">
          <p className="font-medium">Reason</p>
          <p className="mt-1">{user.rejectionReason}</p>
        </div>
      )}

      {!justResubmitted && resubmitting && salon && (
        <ResubmitForm salon={salon} onDone={() => setJustResubmitted(true)} />
      )}

      {!justResubmitted && !resubmitting && (
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            onClick={() => setResubmitting(true)}
            fullWidth
            icon={<RotateCcw className="size-4" />}
          >
            Edit &amp; resubmit
          </Button>
          <Button onClick={() => signOut()} variant="ghost" fullWidth icon={<LogOut className="size-4" />}>
            Log out
          </Button>
        </div>
      )}
    </StatusPageShell>
  );
}
