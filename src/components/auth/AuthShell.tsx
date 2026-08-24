import { Sparkles } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Split-screen frame shared by /login and /register — a dark brand panel on
 * the left, the form on the right, matching the platform-admin sign-in
 * layout rather than the old photo-and-testimonial treatment.
 */
export function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
  aside,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
  /** Product copy for the brand panel — never a testimonial we cannot attribute. */
  aside: { headline: string; body: string };
}) {
  return (
    <div className="flex min-h-screen bg-neutral-50">
      {/* Brand half — hidden on small screens, only the form needs to fit there. */}
      <div className="relative hidden w-1/2 shrink-0 overflow-hidden bg-ink lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              "radial-gradient(26rem 20rem at 10% 0%, var(--color-rose-500), transparent 70%), radial-gradient(24rem 22rem at 100% 100%, var(--color-purple-600), transparent 68%)",
          }}
        />

        <div className="relative flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-2xl bg-linear-to-br from-rose-500 to-purple-600 shadow-[0_10px_24px_-12px_var(--color-purple-500)]">
              <Sparkles className="size-5 text-white" />
            </span>
            <span className="font-display text-base text-white">GlowSync</span>
          </Link>
          <Link
            href="/"
            className="glass rounded-full px-4 py-2 text-sm font-medium text-ink transition-transform duration-300 hover:-translate-y-0.5"
          >
            Back to GlowSync
          </Link>
        </div>

        <div className="relative">
          <h2 className="font-display max-w-md text-3xl leading-snug text-white">
            {aside.headline}
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/60">{aside.body}</p>
        </div>

        <p className="relative text-xs text-white/30">
          &copy; {new Date().getFullYear()} GlowSync.
        </p>
      </div>

      {/* Form half */}
      <div className="flex w-full items-center justify-center px-4 py-14 lg:w-1/2">
        <div className="w-full max-w-md">
          <span className="eyebrow flex items-center gap-2 text-rose-600">
            <Sparkles className="size-3.5" />
            {eyebrow}
          </span>
          <h1 className="font-display font-display-tight mt-4 text-[clamp(2rem,5vw,2.75rem)] text-ink">
            {title}
          </h1>
          <p className="mt-3 text-neutral-500">{subtitle}</p>

          <div className="mt-8">{children}</div>

          <p className="mt-6 text-center text-sm text-neutral-500">{footer}</p>
        </div>
      </div>
    </div>
  );
}
