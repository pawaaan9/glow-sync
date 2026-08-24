"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { apiGet } from "@/lib/api/http";
import { getPostLoginRedirectPath } from "@/lib/auth/post-login-redirect";
import { auth } from "@/lib/firebase/client";
import { ROLES, type MeResponse } from "@/lib/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { Lock, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
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

export function LoginForm() {
  const router = useRouter();
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
      const me = await apiGet<MeResponse>("/api/auth/me");

      // This page serves salon owners, receptionists, staff, and customers.
      // Platform admins have their own sign-in surface at /platform-admin,
      // so send them there rather than starting a session from here.
      if (me.user.role === ROLES.PLATFORM_ADMIN) {
        await signOut(auth);
        setFormError("Platform admins sign in at /platform-admin.");
        return;
      }

      router.push(getPostLoginRedirectPath(me.user.role));
    } catch (err) {
      const code = (err as { code?: string })?.code;
      setFormError(
        (code && FIREBASE_ERROR_MESSAGES[code]) ??
          (err instanceof Error ? err.message : "Something went wrong. Please try again."),
      );
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Input
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
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

      <div className="flex items-center justify-between text-sm">
        <label className="flex cursor-pointer items-center gap-2 text-neutral-600">
          <input
            type="checkbox"
            className="size-4 cursor-pointer accent-rose-500"
          />
          Remember me
        </label>
        <button
          type="button"
          className="cursor-pointer font-medium text-rose-600 hover:underline"
        >
          Forgot password?
        </button>
      </div>

      <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
        Log in
      </Button>

      <div className="flex items-center gap-3 py-1 text-xs text-neutral-400">
        <span className="h-px flex-1 bg-neutral-200" />
        or continue with
        <span className="h-px flex-1 bg-neutral-200" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" fullWidth>
          Google
        </Button>
        <Button variant="outline" fullWidth>
          Apple
        </Button>
      </div>
    </form>
  );
}
