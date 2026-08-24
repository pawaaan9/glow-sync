"use client";

import { Button } from "@/components/ui/Button";
import { ArrowRight, Clock, Scissors, Search, User } from "lucide-react";
import { useRouter } from "next/navigation";

/**
 * Customer accounts do not exist yet — there is no customer auth or booking
 * backend — so this page offers the two things that genuinely work today:
 * browsing salons, and registering as a salon owner. It deliberately does
 * not show a sign-up form that would not create an account.
 */
export function RegisterForm() {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={() => router.push("/register/salon-owner")}
        className="group flex cursor-pointer items-start gap-4 rounded-3xl border border-rose-200 bg-linear-to-br from-rose-50 to-purple-50 p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-rose-300 hover:shadow-[0_16px_40px_-28px_var(--color-rose-500)]"
      >
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-rose-500 to-purple-600 text-white">
          <Scissors className="size-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5 font-medium tracking-tight text-ink">
            I own a salon
            <ArrowRight className="size-4 -translate-x-0.5 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100" />
          </span>
          <span className="mt-1 block text-sm leading-relaxed text-neutral-600">
            List your salon, publish your service menu, and manage bookings, staff, and
            clients.
          </span>
        </span>
      </button>

      <div className="flex items-start gap-4 rounded-3xl border border-neutral-200 bg-white p-5">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-400">
          <User className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-2 font-medium tracking-tight text-ink">
            I am booking
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[0.65rem] font-semibold text-amber-800">
              <Clock className="size-3" />
              Coming soon
            </span>
          </p>
          <p className="mt-1 text-sm leading-relaxed text-neutral-500">
            Customer accounts and online booking are not open yet. You can already browse
            every listed salon and contact them directly.
          </p>
          <Button
            href="/search"
            variant="outline"
            size="sm"
            className="mt-3"
            icon={<Search className="size-3.5" />}
          >
            Browse salons
          </Button>
        </div>
      </div>
    </div>
  );
}
