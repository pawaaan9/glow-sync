import { Marquee } from "@/components/landing/Marquee";
import { HeroSearch } from "@/components/landing/HeroSearch";
import { CategoryIcon } from "@/components/salon/CategoryIcon";
import { SalonCard } from "@/components/salon/SalonCard";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/Card";
import { SALON_CATEGORY_LABELS } from "@/lib/shared";
import { cn } from "@/lib/utils";
import {
  getPublicFilters,
  listPublicSalons,
} from "@/server/services/publicCatalogService";
import {
  ArrowRight,
  CalendarCheck,
  ShieldCheck,
  Sparkles,
  Store,
  Wallet,
} from "lucide-react";
import Link from "next/link";

/** Product promises, not data — these describe how GlowSync works. */
const highlights = [
  {
    icon: CalendarCheck,
    title: "One place for every salon",
    description:
      "Browse verified salons, their real service menus, and their opening hours in one directory.",
  },
  {
    icon: ShieldCheck,
    title: "Reviewed before listing",
    description:
      "Every salon is checked and approved by a GlowSync administrator before it appears here.",
  },
  {
    icon: Wallet,
    title: "Transparent pricing",
    description:
      "Prices come straight from the salon — you see what they charge before you get in touch.",
  },
];

const steps = [
  {
    title: "Discover",
    description: "Filter by treatment, city, or category until you find your match.",
  },
  {
    title: "Compare the menu",
    description: "See each salon's real services, durations, and prices side by side.",
  },
  {
    title: "Get in touch",
    description: "Call or message the salon directly to lock in your appointment.",
  },
];

export default async function Home() {
  const [salons, filters] = await Promise.all([listPublicSalons(), getPublicFilters()]);

  const totalServices = salons.reduce((sum, s) => sum + s.serviceCount, 0);
  const featured = salons.slice(0, 6);

  // Placeholder hints and the marquee both come from live categories, so the
  // page never advertises a treatment no listed salon actually offers.
  const categoryLabels = filters.categories.map((c) => SALON_CATEGORY_LABELS[c]);

  const stats = [
    { value: String(salons.length), label: salons.length === 1 ? "Listed salon" : "Listed salons" },
    { value: String(totalServices), label: totalServices === 1 ? "Service" : "Services" },
    {
      value: String(filters.cities.length),
      label: filters.cities.length === 1 ? "City" : "Cities",
    },
    {
      value: String(filters.categories.length),
      label: filters.categories.length === 1 ? "Category" : "Categories",
    },
  ];

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
            Sri Lanka&apos;s salon &amp; wellness directory
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
            Discover salons, spas, and wellness studios near you — see their real service
            menus and prices, then book directly with them.
          </p>

          <div
            className="animate-rise flex w-full justify-center"
            style={{ animationDelay: "240ms" }}
          >
            <HeroSearch suggestions={categoryLabels} />
          </div>

          {filters.categories.length > 0 && (
            <div
              className="animate-rise flex flex-wrap items-center justify-center gap-2 text-sm"
              style={{ animationDelay: "320ms" }}
            >
              <span className="text-neutral-500">Browse:</span>
              {filters.categories.slice(0, 4).map((c) => (
                <Link
                  key={c}
                  href={`/search?category=${c}`}
                  className="rounded-full border border-neutral-200/80 bg-white/70 px-3 py-1 text-neutral-600 backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-rose-300 hover:text-rose-700"
                >
                  {SALON_CATEGORY_LABELS[c]}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {categoryLabels.length > 0 && <Marquee items={categoryLabels} />}

      {/* Categories */}
      {filters.categories.length > 0 && (
        <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Explore"
            title="Browse by category"
            description="Pick a lane and we will show you every listed salon in it."
            align="center"
            className="mx-auto"
          />

          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {filters.categories.map((category, i) => (
              <Link
                key={category}
                href={`/search?category=${category}`}
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
                  <CategoryIcon category={category} className="size-6" />
                </span>
                <span className="font-display relative text-base text-ink">
                  {SALON_CATEGORY_LABELS[category]}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Listed salons */}
      <section className="relative overflow-hidden bg-neutral-50 py-20">
        <div className="pointer-events-none absolute -left-40 top-1/3 size-96 rounded-full bg-purple-200/30 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
            <SectionHeading
              eyebrow="On GlowSync"
              title={salons.length === 1 ? "Our first salon" : "Salons on GlowSync"}
              description="Every studio here has been verified by our team."
            />
            {salons.length > featured.length && (
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
            )}
          </div>

          {featured.length > 0 ? (
            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((salon) => (
                <SalonCard key={salon.id} salon={salon} />
              ))}
            </div>
          ) : (
            <div className="mt-12 flex flex-col items-center gap-4 rounded-3xl border border-dashed border-neutral-300 bg-white p-14 text-center">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-linear-to-br from-rose-100 to-purple-100 text-rose-600">
                <Store className="size-6" />
              </span>
              <h3 className="font-display text-xl text-ink">No salons listed yet</h3>
              <p className="max-w-sm text-sm text-neutral-500">
                GlowSync is just getting started. If you run a salon, you could be the
                first one here.
              </p>
              <Button href="/register/salon-owner">List your salon</Button>
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="How it works"
          title="Three steps to your next appointment"
          align="center"
          className="mx-auto"
        />

        <div className="relative mt-14 grid grid-cols-1 gap-10 sm:grid-cols-3">
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
              <h3 className="font-display relative mt-5 text-xl text-ink">{item.title}</h3>
              <p className="relative mt-2 text-sm leading-relaxed text-neutral-500">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Live counts — these move as real salons join. */}
      {salons.length > 0 && (
        <section className="mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
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
      )}

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
            List your salon, publish your service menu, and manage bookings, staff, and
            clients in one place.
          </p>
          <div className="relative flex flex-wrap items-center justify-center gap-3">
            <Button
              href="/register/salon-owner"
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
