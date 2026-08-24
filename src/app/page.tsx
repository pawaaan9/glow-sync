import { HeroSearch } from "@/components/landing/HeroSearch";
import { CategoryIcon } from "@/components/salon/CategoryIcon";
import { RatingStars } from "@/components/salon/RatingStars";
import { SalonCard } from "@/components/salon/SalonCard";
import { Button } from "@/components/ui/Button";
import { getFeaturedSalons } from "@/lib/api";
import { serviceCategories } from "@/lib/mock-data";
import { CalendarCheck, ShieldCheck, Sparkles, Wallet } from "lucide-react";
import Link from "next/link";

const highlights = [
  {
    icon: CalendarCheck,
    title: "Book in seconds",
    description: "Real-time availability across every salon, no phone calls needed.",
  },
  {
    icon: ShieldCheck,
    title: "Verified professionals",
    description: "Every stylist and therapist is vetted and reviewed by real clients.",
  },
  {
    icon: Wallet,
    title: "Transparent pricing",
    description: "See exact prices upfront — no surprises at checkout.",
  },
];

export default async function Home() {
  const featured = await getFeaturedSalons();

  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden bg-linear-to-b from-rose-50 via-white to-white">
        <div className="pointer-events-none absolute -top-24 right-0 size-96 rounded-full bg-purple-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -top-10 left-0 size-72 rounded-full bg-rose-200/40 blur-3xl" />
        <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-8 px-4 py-20 text-center sm:px-6 sm:py-28 lg:px-8">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-xs font-medium text-rose-600 shadow-sm">
            <Sparkles className="size-3.5" />
            Premium beauty &amp; wellness, booked instantly
          </span>
          <h1 className="max-w-2xl font-display text-4xl leading-tight text-neutral-900 sm:text-5xl">
            Look and feel your best, effortlessly
          </h1>
          <p className="max-w-xl text-balance text-neutral-500">
            Discover top-rated salons, spas, and wellness studios near you — then book your
            next appointment in just a few taps.
          </p>
          <HeroSearch />
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-neutral-500">
            <span>Popular:</span>
            {serviceCategories.slice(0, 4).map((c) => (
              <Link key={c.id} href={`/search?category=${c.id}`} className="hover:text-rose-600">
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <h2 className="text-center font-display text-2xl text-neutral-900">Browse by category</h2>
        <div className="mt-8 grid grid-cols-3 gap-3 sm:grid-cols-6">
          {serviceCategories.map((category) => (
            <Link
              key={category.id}
              href={`/search?category=${category.id}`}
              className="group flex flex-col items-center gap-2.5 rounded-2xl border border-neutral-100 bg-white p-4 text-center transition-colors hover:border-rose-200 hover:bg-rose-50/40"
            >
              <span className="flex size-11 items-center justify-center rounded-full bg-linear-to-br from-rose-100 to-purple-100 text-rose-600 transition-transform group-hover:scale-105">
                <CategoryIcon icon={category.icon} className="size-5" />
              </span>
              <span className="text-sm font-medium text-neutral-700">{category.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-neutral-50 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="font-display text-2xl text-neutral-900">Featured salons</h2>
              <p className="mt-1 text-sm text-neutral-500">
                Hand-picked spots loved by the GlowSync community
              </p>
            </div>
            <Button href="/search" variant="outline" size="sm">
              View all
            </Button>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((salon) => (
              <SalonCard key={salon.id} salon={salon} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {highlights.map((item) => (
            <div key={item.title} className="flex flex-col items-center gap-3 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-linear-to-br from-rose-400 to-purple-500 text-white">
                <item.icon className="size-5" />
              </span>
              <h3 className="font-display text-lg text-neutral-900">{item.title}</h3>
              <p className="max-w-xs text-sm text-neutral-500">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 rounded-3xl bg-linear-to-br from-rose-500 to-purple-600 px-6 py-14 text-center text-white sm:px-16">
          <div className="flex items-center gap-1">
            <RatingStars rating={5} size={18} className="text-white" />
          </div>
          <h2 className="max-w-lg font-display text-2xl sm:text-3xl">
            Own a salon? Grow your business with GlowSync
          </h2>
          <p className="max-w-md text-rose-50">
            Join thousands of salons managing bookings, staff, and clients in one place.
          </p>
          <Button href="/register" variant="secondary" size="lg" className="bg-white text-rose-600 hover:bg-rose-50">
            List your salon
          </Button>
        </div>
      </section>
    </div>
  );
}
