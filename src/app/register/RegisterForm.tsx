"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Lock, Mail, Scissors, User } from "lucide-react";
import { useRouter } from "next/navigation";
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

export function RegisterForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  // No customer auth backend yet — this branch stays on the mock flow.
  async function onSubmit() {
    router.push("/dashboard/customer");
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <div
          className={cn(
            "flex flex-col items-start gap-1 rounded-2xl border p-4 text-left transition-all duration-200",
            "border-rose-300 bg-linear-to-br from-rose-50 to-purple-50 shadow-[0_10px_28px_-20px_var(--color-rose-500)]",
          )}
        >
          <User className="size-4 text-rose-600" />
          <span className="text-sm font-medium tracking-tight text-ink">I am booking</span>
          <span className="text-xs text-neutral-500">Find and book treatments</span>
        </div>

        <button
          type="button"
          onClick={() => router.push("/register/salon-owner")}
          className="group flex cursor-pointer flex-col items-start gap-1 rounded-2xl border border-neutral-200 bg-white p-4 text-left transition-all duration-200 hover:border-rose-200"
        >
          <Scissors className="size-4 text-neutral-400" />
          <span className="flex items-center gap-1 text-sm font-medium tracking-tight text-ink">
            I own a salon
            <ArrowRight className="size-3.5 -translate-x-0.5 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100" />
          </span>
          <span className="text-xs text-neutral-500">List and manage a studio</span>
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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
          By continuing you agree to the GlowSync Terms of Service and Privacy Policy.
        </p>
      </form>
    </div>
  );
}
