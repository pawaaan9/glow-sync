import { AuthShell } from "@/components/auth/AuthShell";
import { RegisterForm } from "@/app/register/RegisterForm";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sign up — GlowSync",
  description: "Create a GlowSync account to book salon and wellness appointments.",
};

export default function RegisterPage() {
  return (
    <AuthShell
      eyebrow="Join GlowSync"
      title="Create your account"
      subtitle="Book treatments, follow your favourite artists, and never miss a slot."
      aside={{
        image: "https://picsum.photos/seed/serenity-cover/900/1200",
        quote: "Listing my studio on GlowSync filled every empty chair in a month.",
        author: "Amara Chen",
        role: "Owner, The Rose Atelier",
      }}
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-rose-600 hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}
