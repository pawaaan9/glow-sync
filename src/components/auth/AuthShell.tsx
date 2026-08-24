import { RatingStars } from "@/components/salon/RatingStars";
import { Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Split-screen frame shared by /login and /register: form on the left,
 * an image-backed testimonial panel on the right.
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
  aside: { image: string; quote: string; author: string; role: string };
}) {
  return (
    <div className="mx-auto grid min-h-[calc(100vh-4.5rem)] w-full max-w-7xl grid-cols-1 items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:px-8">
      <div className="mx-auto w-full max-w-md">
        <span className="eyebrow flex items-center gap-2 text-rose-600">
          <Sparkles className="size-3.5" />
          {eyebrow}
        </span>
        <h1 className="font-display font-display-tight mt-4 text-[clamp(2rem,5vw,3rem)] text-ink">
          {title}
        </h1>
        <p className="mt-3 text-neutral-500">{subtitle}</p>

        <div className="mt-8">{children}</div>

        <p className="mt-6 text-center text-sm text-neutral-500">{footer}</p>
      </div>

      {/* Decorative panel — hidden on small screens where it adds nothing. */}
      <div className="relative hidden aspect-4/5 max-h-[38rem] overflow-hidden rounded-[2.5rem] lg:block">
        <Image
          src={aside.image}
          alt=""
          fill
          sizes="50vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-ink via-ink/40 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 p-9">
          <RatingStars rating={5} size={16} />
          <blockquote className="font-display mt-4 text-2xl leading-snug text-white">
            {aside.quote}
          </blockquote>
          <p className="mt-4 text-sm text-white/70">
            <span className="text-white">{aside.author}</span> · {aside.role}
          </p>
        </div>

        <Link
          href="/"
          className="glass absolute right-6 top-6 rounded-full px-4 py-2 text-sm font-medium text-ink transition-transform duration-300 hover:-translate-y-0.5"
        >
          Back to GlowSync
        </Link>
      </div>
    </div>
  );
}
