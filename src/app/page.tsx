import { Marquee } from "@/components/landing/Marquee";
import { HeroSearch } from "@/components/landing/HeroSearch";
import { CategoryIcon } from "@/components/salon/CategoryIcon";
import { RatingStars } from "@/components/salon/RatingStars";
import { SalonCard } from "@/components/salon/SalonCard";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/Card";
import { getFeaturedSalons } from "@/lib/api";
import { salons, serviceCategories } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  CalendarCheck,
  Quote,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const highlights = [
  {
    icon: CalendarCheck,
    title: "Book in seconds",
    description:
      "Real-time availability across every salon, no phone calls needed.",
  },
  {
    icon: ShieldCheck,
    title: "Verified professionals",
    description:
      "Every stylist and therapist is vetted and reviewed by real clients.",
  },
  {
    icon: Wallet,
    title: "Transparent pricing",
    description: "See exact prices upfront — no surprises at checkout.",
  },
];

const steps = [
  {
    title: "Discover",
    description:
      "Filter by treatment, city, rating, or budget until you find your match.",
  },
  {
    title: "Choose your artist",
    description:
      "Browse stylists and therapists, read their reviews, pick your favourite.",
  },
  {
    title: "Book & glow",
    description:
      "Lock in a slot in seconds and get a reminder before you walk in.",
  },
];

const stats = [
  { value: "1,800+", label: "Partner salons" },
  { value: "240k", label: "Appointments booked" },
  { value: "4.9", label: "Average rating" },
  { value: "38", label: "Cities covered" },
];

// Pull the strongest reviews out of the catalogue for social proof.
const testimonials = salons
  .flatMap((s) => s.reviews.map((r) => ({ ...r, salonName: s.name })))
  .filter((r) => r.rating === 5)
  .slice(0, 3);

export default async function Home() {
  const featured = await getFeaturedSalons();

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="aurora grain relative overflow-hidden">
        <div className="animate-drift pointer-events-none absolute -top-32 right-[8%] size-96 rounded-full bg-purple-300/40 blur-3xl" />
        <div className="animate-drift-slow pointer-events-none absolute -top-16 left-[4%] size-80 rounded-full bg-rose-300/40 blur-3xl" />

        <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-8 px-4 pt-20 pb-24 text-center sm:px-6 sm:pt-28 sm:pb-32 lg:px-8">
          <span className="animate-rise inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-4 py-1.5 text-xs font-medium tracking-tight text-rose-700 shadow-sm backdrop-blur">
            <span className="relative flex size-2">
              <span className="animate-pulse-ring absolute inline-flex size-full rounded-full bg-rose-400" />
              <span className="relative inline-flex size-2 rounded-full bg-rose-500" />
            </span>
            Premium beauty &amp; wellness, booked instantly
          </span>

          <h1
            className="animate-rise font-display font-display-tight max-w-4xl text-[clamp(2.75rem,8vw,5.5rem)] text-ink"
            style={{ animationDelay: "80ms" }}
          >
            Look and feel your best,{" "}
            <span className="text-gradient">effortlessly</span>
          </h1>

          <p
            className="animate-rise max-w-xl text-lg leading-relaxed text-balance text-neutral-600"
            style={{ animationDelay: "160ms" }}
          >
            Discover top-rated salons, spas, and wellness studios near you — then
            book your next appointment in just a few taps.
          </p>

          <div
            className="animate-rise flex w-full justify-center"
            style={{ animationDelay: "240ms" }}
          >
            <HeroSearch />
          </div>

          <div
            className="animate-rise flex flex-wrap items-center justify-center gap-2 text-sm"
            style={{ animationDelay: "320ms" }}
          >
            <span className="text-neutral-500">Popular:</span>
            {serviceCategories.slice(0, 4).map((c) => (
              <Link
                key={c.id}
                href={`/search?category=${c.id}`}
                className="rounded-full border border-neutral-200/80 bg-white/70 px-3 py-1 text-neutral-600 backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-rose-300 hover:text-rose-700"
              >
                {c.name}
              </Link>
            ))}
          </div>

          {/* Social proof strip */}
          <div
            className="animate-rise mt-4 flex items-center gap-4"
            style={{ animationDelay: "400ms" }}
          >
            <div className="flex -space-x-3">
              {salons.slice(0, 4).map((s) => (
                <span
                  key={s.id}
                  className="relative size-10 overflow-hidden rounded-full ring-3 ring-white"
                >
                  <Image
                    src={s.staff[0]?.avatarUrl ?? s.coverImageUrl}
                    alt=""
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </span>
              ))}
            </div>
            <div className="text-left">
              <RatingStars rating={5} size={14} />
              <p className="mt-0.5 text-xs text-neutral-500">
                Loved by <strong className="text-ink">24,000+</strong> clients
              </p>
            </div>
          </div>
        </div>
      </section>

      <Marquee
        items={[
          "Balayage",
          "Hot stone massage",
          "Gel manicure",
          "HydraFacial",
          "Brow lamination",
          "Hot towel shave",
          "Spa pedicure",
          "Bridal makeup",
        ]}
      />

      {/* Categories */}
      <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Explore"
          title="Browse by category"
          description="Six ways to treat yourself — pick a lane and we will show you the best in town."
          align="center"
          className="mx-auto"
        />

        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {serviceCategories.map((category, i) => (
            <Link
              key={category.id}
              href={`/search?category=${category.id}`}
              className="group relative flex flex-col items-center gap-3 overflow-hidden rounded-3xl border border-neutral-100 bg-white p-6 text-center transition-all duration-300 hover:-translate-y-1.5 hover:border-transparent hover:shadow-[0_24px_50px_-30px_rgba(217,36,88,0.6)]"
            >
              <span
                className={cn(
                  "absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100",
                  i % 3 === 0 && "bg-linear-to-b from-rose-50 to-white",
                  i % 3 === 1 && "bg-linear-to-b from-purple-50 to-white",
                  i % 3 === 2 && "bg-linear-to-b from-amber-50 to-white",
                )}
              />
              <span className="relative flex size-14 items-center justify-center rounded-2xl bg-linear-to-br from-rose-100 via-purple-100 to-amber-100 text-rose-600 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                <CategoryIcon icon={category.icon} className="size-6" />
              </span>
              <span className="font-display relative text-base text-ink">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured salons */}
      <section className="relative overflow-hidden bg-neutral-50 py-20">
        <div className="pointer-events-none absolute -left-40 top-1/3 size-96 rounded-full bg-purple-200/30 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
            <SectionHeading
              eyebrow="Hand-picked"
              title="Featured salons"
              description="Studios our community keeps going back to, month after month."
            />
            <Button
              href="/search"
              variant="ink"
              icon={
                <ArrowRight className="size-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
              }
              className="flex-row-reverse"
            >
              View all
            </Button>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((salon) => (
              <SalonCard key={salon.id} salon={salon} />
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="How it works"
          title="Three taps to your next appointment"
          align="center"
          className="mx-auto"
        />

        <div className="relative mt-14 grid grid-cols-1 gap-10 sm:grid-cols-3">
          {/* Connector line behind the numbered steps. */}
          <div className="pointer-events-none absolute inset-x-[16%] top-7 hidden h-px bg-linear-to-r from-rose-200 via-purple-200 to-amber-200 sm:block" />

          {steps.map((step, i) => (
            <div
              key={step.title}
              className="relative flex flex-col items-center gap-3 text-center"
            >
              <span className="font-display relative flex size-14 items-center justify-center rounded-full border border-neutral-100 bg-white text-xl text-rose-600 shadow-[0_10px_30px_-16px_rgba(217,36,88,0.6)]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="font-display text-xl text-ink">{step.title}</h3>
              <p className="max-w-xs text-sm leading-relaxed text-neutral-500">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Why GlowSync */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {highlights.map((item) => (
            <div
              key={item.title}
              className="group ring-gradient relative overflow-hidden rounded-3xl p-7 transition-transform duration-300 hover:-translate-y-1.5"
            >
              <span className="absolute -right-8 -top-8 size-28 rounded-full bg-rose-100/60 blur-2xl transition-all duration-500 group-hover:bg-purple-100" />
              <span className="relative flex size-12 items-center justify-center rounded-2xl bg-linear-to-br from-rose-500 to-purple-600 text-white shadow-[0_10px_24px_-12px_var(--color-purple-600)]">
                <item.icon className="size-5" />
              </span>
              <h3 className="font-display relative mt-5 text-xl text-ink">
                {item.title}
              </h3>
              <p className="relative mt-2 text-sm leading-relaxed text-neutral-500">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative overflow-hidden bg-neutral-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Reviews"
            title="What the glow squad says"
            align="center"
            className="mx-auto"
          />

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {testimonials.map((review) => (
              <figure
                key={review.id}
                className="relative flex flex-col gap-4 rounded-3xl border border-neutral-100 bg-white p-7 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_50px_-32px_rgba(117,54,163,0.6)]"
              >
                <Quote className="size-7 fill-rose-100 text-rose-200" />
                <blockquote className="text-[0.95rem] leading-relaxed text-neutral-700">
                  {review.comment}
                </blockquote>
                <figcaption className="mt-auto flex items-center gap-3 border-t border-neutral-100 pt-4">
                  <span className="font-display flex size-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-rose-100 to-purple-100 text-sm text-rose-700">
                    {review.customerName.charAt(0)}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-ink">
                      {review.customerName}
                    </span>
                    <span className="block truncate text-xs text-neutral-400">
                      {review.serviceName} · {review.salonName}
                    </span>
                  </span>
                  <RatingStars
                    rating={review.rating}
                    size={12}
                    className="ml-auto shrink-0"
                  />
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-y-10 sm:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center gap-1 border-neutral-200 text-center sm:not-last:border-r"
            >
              <span className="font-display font-display-tight text-gradient text-4xl sm:text-5xl">
                {stat.value}
              </span>
              <span className="text-sm text-neutral-500">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Owner CTA */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-4 sm:px-6 lg:px-8">
        <div className="grain relative flex flex-col items-center gap-6 overflow-hidden rounded-[2.5rem] bg-linear-to-br from-rose-500 via-rose-600 to-purple-700 px-6 py-16 text-center text-white sm:px-16 sm:py-20">
          <div className="animate-drift pointer-events-none absolute -left-20 -top-20 size-72 rounded-full bg-amber-300/30 blur-3xl" />
          <div className="animate-drift-slow pointer-events-none absolute -bottom-24 -right-10 size-80 rounded-full bg-purple-400/40 blur-3xl" />

          <span className="eyebrow relative flex items-center gap-2 text-rose-100">
            <Sparkles className="size-3.5" />
            For salon owners
          </span>
          <h2 className="font-display font-display-tight relative max-w-2xl text-[clamp(2rem,5vw,3.5rem)]">
            Own a salon? Grow your business with GlowSync
          </h2>
          <p className="relative max-w-md text-rose-50/90">
            Join thousands of salons managing bookings, staff, and clients in one
            place.
          </p>
          <div className="relative flex flex-wrap items-center justify-center gap-3">
            <Button
              href="/register"
              size="lg"
              className="bg-white bg-none text-rose-600 shadow-[0_12px_30px_-12px_rgba(0,0,0,0.5)] hover:bg-rose-50"
            >
              List your salon
            </Button>
            <Button
              href="/search"
              size="lg"
              variant="ghost"
              className="border border-white/40 text-white hover:bg-white/10"
            >
              Explore salons
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
