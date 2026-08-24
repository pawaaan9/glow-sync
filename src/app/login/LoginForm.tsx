"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(8, "Passwords are at least 8 characters"),
});

type FormValues = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  // No auth backend yet — land the user on their bookings once the form is valid.
  async function onSubmit() {
    router.push("/dashboard/customer");
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
