import { LoginForm } from "@/app/login/LoginForm";
import { AuthShell } from "@/components/auth/AuthShell";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Log in — GlowSync",
  description: "Log in to manage your GlowSync bookings.",
};

export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Log in to your glow"
      subtitle="Pick up where you left off — your bookings, favourites, and rebooks are waiting."
      aside={{
        image: "https://picsum.photos/seed/rose-atelier-cover/900/1200",
        quote: "Booking takes twenty seconds and I have never lost a slot again.",
        author: "Priya S.",
        role: "GlowSync member since 2024",
      }}
      footer={
        <>
          New to GlowSync?{" "}
          <Link href="/register" className="font-medium text-rose-600 hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
