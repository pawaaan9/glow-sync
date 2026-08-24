"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { auth } from "@/lib/firebase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { Lock, Mail, ShieldCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { z } from "zod";

const schema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});

type FormValues = z.infer<typeof schema>;

const FIREBASE_ERROR_MESSAGES: Record<string, string> = {
  "auth/invalid-credential": "Incorrect email or password.",
  "auth/wrong-password": "Incorrect email or password.",
  "auth/user-not-found": "Incorrect email or password.",
  "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
};

/**
 * The super admin's own sign-in screen, rendered in place at
 * /platform-admin rather than redirecting to /login — the public login
 * page is for salon owners, receptionists, and staff.
 *
 * `wrongRole` covers the case where someone is already signed in as a
 * non-admin: their session is signed out here so they can enter admin
 * credentials instead.
 */
export function SuperAdminLogin({
  wrongRole = false,
  onSignedIn,
}: {
  wrongRole?: boolean;
  onSignedIn?: () => void;
}) {
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setFormError(null);
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      onSignedIn?.();
    } catch (err) {
      const code = (err as { code?: string })?.code;
      setFormError(
        (code && FIREBASE_ERROR_MESSAGES[code]) ??
          (err instanceof Error ? err.message : "Something went wrong. Please try again."),
      );
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-neutral-100 bg-white p-8 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.35)]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-rose-500" />
          <span className="eyebrow text-rose-600">Super Admin</span>
        </div>
        <h1 className="font-display mt-3 text-2xl text-ink">Platform admin sign in</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Restricted area. Salon owners, receptionists, and staff sign in from the main login page.
        </p>

        {wrongRole && (
          <div className="mt-5 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
            You are signed in with an account that is not a platform admin.{" "}
            <button
              type="button"
              onClick={() => signOut(auth)}
              className="cursor-pointer font-medium underline"
            >
              Sign out
            </button>{" "}
            and use your admin credentials.
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="admin@example.com"
            icon={<Mail className="size-4" />}
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            icon={<Lock className="size-4" />}
            error={errors.password?.message}
            {...register("password")}
          />

          {formError && <p className="text-sm text-red-600">{formError}</p>}

          <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
            Log in
          </Button>
        </form>
      </div>
    </div>
  );
}
