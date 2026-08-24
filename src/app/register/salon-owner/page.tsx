import { RegisterSalonOwnerForm } from "@/app/register/salon-owner/RegisterSalonOwnerForm";
import { Sparkles } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "List your salon — GlowSync",
  description: "Register your salon on GlowSync and apply for platform verification.",
};

export default function RegisterSalonOwnerPage() {
  return (
    <div className="aurora grain relative">
      <div className="relative mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
        <span className="eyebrow flex items-center gap-2 text-rose-600">
          <Sparkles className="size-3.5" />
          Salon owner application
        </span>
        <h1 className="font-display font-display-tight mt-3 text-[clamp(2rem,5vw,3rem)] text-ink">
          List your salon on GlowSync
        </h1>
        <p className="mt-3 max-w-xl text-neutral-500">
          Tell us about you and your salon. A GlowSync platform administrator will review your
          application before you can access the salon dashboard.
        </p>

        <div className="mt-10 rounded-4xl border border-neutral-100 bg-white p-6 shadow-[0_30px_70px_-48px_rgba(217,36,88,0.5)] sm:p-10">
          <RegisterSalonOwnerForm />
        </div>

        <p className="mt-6 text-center text-sm text-neutral-500">
          Already applied?{" "}
          <Link href="/login" className="font-medium text-rose-600 hover:underline">
            Log in to check your status
          </Link>
        </p>
      </div>
    </div>
  );
}
