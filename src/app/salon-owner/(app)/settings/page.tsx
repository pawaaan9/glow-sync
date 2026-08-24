"use client";

import { FullPageLoader } from "@/components/auth/FullPageLoader";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input } from "@/components/ui/Input";
import { useMySalon, useUpdateBookingSettings, useUpdateOwnerProfile } from "@/hooks/use-salon-owner";
import { auth } from "@/lib/firebase/client";
import type { MeResponse, SalonBookingSettingsInput, SalonDTO } from "@/lib/shared";
import { useAuth } from "@/providers/auth-provider";
import { sendPasswordResetEmail } from "firebase/auth";
import { useState } from "react";

export default function SettingsPage() {
  const { me, signOut } = useAuth();
  const { data: salon, isLoading } = useMySalon();

  if (isLoading || !salon || !me) return <FullPageLoader />;

  // Keyed by owner+salon id so the editable drafts below are seeded fresh
  // from the loaded data exactly once, without syncing them via an effect.
  return <SettingsForm key={`${me.user.id}-${salon.id}`} me={me} salon={salon} signOut={signOut} />;
}

function SettingsForm({
  me,
  salon,
  signOut,
}: {
  me: MeResponse;
  salon: SalonDTO;
  signOut: () => Promise<void>;
}) {
  const updateProfile = useUpdateOwnerProfile();
  const updateBookingSettings = useUpdateBookingSettings();

  const [fullName, setFullName] = useState(me.user.fullName);
  const [phone, setPhone] = useState(me.user.phone);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [bookingSettings, setBookingSettings] = useState<SalonBookingSettingsInput>(
    () => salon.bookingSettings,
  );
  const [settingsSaved, setSettingsSaved] = useState(false);

  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl text-ink sm:text-3xl">Settings</h1>

      <Card className="mt-6">
        <CardBody className="flex flex-col gap-4">
          <h2 className="font-display text-lg text-ink">Owner profile</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <Input label="Email" value={me.user.email} disabled hint="Email can't be changed here." />
          {profileError && <p className="text-sm text-red-600">{profileError}</p>}
          {profileSaved && !profileError && <p className="text-sm text-emerald-600">Saved.</p>}
          <Button
            className="w-fit"
            loading={updateProfile.isPending}
            onClick={async () => {
              setProfileError(null);
              setProfileSaved(false);
              try {
                await updateProfile.mutateAsync({ fullName, phone });
                setProfileSaved(true);
              } catch (err) {
                setProfileError(err instanceof Error ? err.message : "Could not save.");
              }
            }}
          >
            Save profile
          </Button>
        </CardBody>
      </Card>

      <Card className="mt-4">
        <CardBody className="flex flex-col gap-4">
          <h2 className="font-display text-lg text-ink">Booking policy</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Notice period (minutes)"
              type="number"
              min={0}
              value={bookingSettings.noticePeriodMinutes}
              onChange={(e) =>
                setBookingSettings((s) => ({ ...s, noticePeriodMinutes: Number(e.target.value) }))
              }
              hint="Minimum notice a customer must give before a booking's start time."
            />
            <Input
              label="Maximum advance (days)"
              type="number"
              min={1}
              value={bookingSettings.maxAdvanceDays}
              onChange={(e) =>
                setBookingSettings((s) => ({ ...s, maxAdvanceDays: Number(e.target.value) }))
              }
              hint="How far ahead customers may book."
            />
            <Input
              label="Slot interval (minutes)"
              type="number"
              min={5}
              value={bookingSettings.slotIntervalMinutes}
              onChange={(e) =>
                setBookingSettings((s) => ({ ...s, slotIntervalMinutes: Number(e.target.value) }))
              }
              hint="Calendar slot granularity."
            />
            <Input
              label="Cancellation window (hours)"
              type="number"
              min={0}
              value={bookingSettings.cancellationWindowHours}
              onChange={(e) =>
                setBookingSettings((s) => ({ ...s, cancellationWindowHours: Number(e.target.value) }))
              }
              hint="Hours before an appointment a customer may cancel penalty-free."
            />
          </div>
          {settingsSaved && <p className="text-sm text-emerald-600">Saved.</p>}
          <Button
            className="w-fit"
            loading={updateBookingSettings.isPending}
            onClick={() =>
              updateBookingSettings.mutate(bookingSettings, { onSuccess: () => setSettingsSaved(true) })
            }
          >
            Save booking policy
          </Button>
        </CardBody>
      </Card>

      <Card className="mt-4">
        <CardBody className="flex flex-col gap-4">
          <h2 className="font-display text-lg text-ink">Account</h2>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              onClick={async () => {
                setResetError(null);
                try {
                  await sendPasswordResetEmail(auth, me.user.email);
                  setResetSent(true);
                } catch (err) {
                  setResetError(err instanceof Error ? err.message : "Could not send reset email.");
                }
              }}
            >
              Send password reset email
            </Button>
            {resetSent && <span className="text-sm text-emerald-600">Reset email sent.</span>}
            {resetError && <span className="text-sm text-red-600">{resetError}</span>}
          </div>

          <Button variant="danger" className="w-fit" onClick={() => setLogoutConfirmOpen(true)}>
            Log out
          </Button>
        </CardBody>
      </Card>

      <ConfirmDialog
        open={logoutConfirmOpen}
        onClose={() => setLogoutConfirmOpen(false)}
        onConfirm={async () => {
          setLoggingOut(true);
          try {
            await signOut();
          } finally {
            setLoggingOut(false);
            setLogoutConfirmOpen(false);
          }
        }}
        title="Log out?"
        description="You'll need to sign back in to manage your salon."
        confirmLabel="Log out"
        variant="danger"
        isSubmitting={loggingOut}
      />
    </div>
  );
}
