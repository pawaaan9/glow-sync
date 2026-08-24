"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { UserRole } from "@/lib/types";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Mail, Scissors, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z
  .object({
    name: z.string().min(2, "Tell us your name"),
    email: z.email("Enter a valid email address"),
    password: z.string().min(8, "Use at least 8 characters"),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

type FormValues = z.infer<typeof schema>;

const roles: { value: Extract<UserRole, "customer" | "salon-owner">; label: string; hint: string; icon: typeof User }[] = [
  { value: "customer", label: "I am booking", hint: "Find and book treatments", icon: User },
  { value: "salon-owner", label: "I own a salon", hint: "List and manage a studio", icon: Scissors },
];

export function RegisterForm() {
  const router = useRouter();
  const [role, setRole] = useState<(typeof roles)[number]["value"]>("customer");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  // No auth backend yet — route to the dashboard that matches the chosen role.
  async function onSubmit() {
    router.push(role === "customer" ? "/dashboard/customer" : "/dashboard/salon-owner");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        {roles.map((r) => (
          <button
            key={r.value}
            type="button"
            onClick={() => setRole(r.value)}
            className={cn(
              "flex cursor-pointer flex-col items-start gap-1 rounded-2xl border p-4 text-left transition-all duration-200",
              role === r.value
                ? "border-rose-300 bg-linear-to-br from-rose-50 to-purple-50 shadow-[0_10px_28px_-20px_var(--color-rose-500)]"
                : "border-neutral-200 bg-white hover:border-rose-200",
            )}
          >
            <r.icon
              className={cn(
                "size-4",
                role === r.value ? "text-rose-600" : "text-neutral-400",
              )}
            />
            <span className="text-sm font-medium tracking-tight text-ink">
              {r.label}
            </span>
            <span className="text-xs text-neutral-500">{r.hint}</span>
          </button>
        ))}
      </div>

      <Input
        label="Full name"
        autoComplete="name"
        placeholder="Ava Rivera"
        icon={<User className="size-4" />}
        error={errors.name?.message}
        {...register("name")}
      />
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
        autoComplete="new-password"
        placeholder="At least 8 characters"
        icon={<Lock className="size-4" />}
        error={errors.password?.message}
        {...register("password")}
      />
      <Input
        label="Confirm password"
        type="password"
        autoComplete="new-password"
        placeholder="Repeat your password"
        icon={<Lock className="size-4" />}
        error={errors.confirm?.message}
        {...register("confirm")}
      />

      <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
        Create account
      </Button>

      <p className="text-center text-xs leading-relaxed text-neutral-400">
        By continuing you agree to the GlowSync Terms of Service and Privacy
        Policy.
      </p>
    </form>
  );
}
