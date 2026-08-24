import { SalonBooking } from "@/app/salons/[slug]/SalonBooking";
import { RatingStars } from "@/components/salon/RatingStars";
import { SalonCard } from "@/components/salon/SalonCard";
import { Badge } from "@/components/ui/Badge";
import { SectionHeading } from "@/components/ui/Card";
import { getSalonBySlug } from "@/lib/api";
import { salons } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Check, Clock, MapPin, Star } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return salons.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/salons/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const salon = salons.find((s) => s.slug === slug);
  if (!salon) return { title: "Salon not found — GlowSync" };
  return {
    title: `${salon.name} — GlowSync`,
    description: salon.tagline,
  };
}

const priceLabel = { 1: "$", 2: "$$", 3: "$$$" } as const;

export default async function SalonPage({ params }: PageProps<"/salons/[slug]">) {
  const { slug } = await params;

  const salon = await getSalonBySlug(slug).catch(() => null);
  if (!salon) notFound();

  const related = salons
    .filter(
      (s) =>
        s.id !== salon.id && s.categories.some((c) => salon.categories.includes(c)),
    )
    .slice(0, 3);

  return (
    <div className="flex flex-col">
      {/* Cover */}
      <section className="relative h-[46vh] min-h-80 w-full overflow-hidden">
        <Image
          src={salon.coverImageUrl}
          alt={salon.name}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-ink via-ink/50 to-ink/10" />

        <div className="absolute inset-x-0 bottom-0">
          <div className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
            <div className="flex flex-wrap gap-2">
              {salon.categories.map((c) => (
                <Badge key={c} variant="glass" className="capitalize">
                  {c}
                </Badge>
              ))}
              {salon.featured && (
                <Badge className="bg-amber-400 text-amber-950">Featured</Badge>
              )}
            </div>

            <h1 className="font-display font-display-tight mt-4 text-[clamp(2.25rem,6vw,4rem)] text-white">
              {salon.name}
            </h1>
            <p className="mt-2 max-w-xl text-white/80">{salon.tagline}</p>

            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/85">
              <span className="flex items-center gap-1.5">
                <Star className="size-4 fill-amber-400 text-amber-400" />
                <strong className="text-white">{salon.rating.toFixed(1)}</strong>
                <span className="text-white/60">
                  ({salon.reviewCount.toLocaleString()} reviews)
                </span>
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="size-4" />
                {salon.address}, {salon.city}
              </span>
              <span className="rounded-full border border-white/30 px-2.5 py-0.5 text-xs">
                {priceLabel[salon.priceLevel]}
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_22rem] lg:px-8">
        {/* Main column */}
        <div className="flex min-w-0 flex-col gap-14">
          <section>
            <SectionHeading eyebrow="About" title="The studio" />
            <p className="mt-5 max-w-2xl leading-relaxed text-neutral-600">
              {salon.description}
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {salon.amenities.map((a) => (
                <span
                  key={a}
                  className="flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-600"
                >
                  <Check className="size-3.5 text-rose-500" />
                  {a}
                </span>
              ))}
            </div>
          </section>

          {salon.galleryImageUrls.length > 0 && (
            <section>
              <SectionHeading eyebrow="Gallery" title="Inside the space" />
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {salon.galleryImageUrls.map((url, i) => (
                  <div
                    key={url}
                    className={cn(
                      "group relative overflow-hidden rounded-3xl bg-neutral-100",
                      // First tile spans two columns for an editorial rhythm.
                      i === 0 ? "col-span-2 aspect-4/3" : "aspect-square",
                    )}
                  >
                    <Image
                      src={url}
                      alt={`${salon.name} gallery image ${i + 1}`}
                      fill
                      sizes="(min-width: 640px) 25vw, 50vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Services + staff + booking all live in one client island. */}
          <SalonBooking salon={salon} />

          <section>
            <SectionHeading
              eyebrow="Reviews"
              title={`${salon.reviewCount.toLocaleString()} client reviews`}
            />
            <div className="mt-6 flex flex-col gap-4">
              {salon.reviews.map((review) => (
                <article
                  key={review.id}
                  className="rounded-3xl border border-neutral-100 bg-white p-6 transition-shadow duration-300 hover:shadow-[0_20px_44px_-32px_rgba(217,36,88,0.5)]"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-display flex size-11 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-rose-100 to-purple-100 text-rose-700">
                      {review.customerName.charAt(0)}
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium text-ink">{review.customerName}</p>
                      <p className="truncate text-xs text-neutral-400">
                        {review.serviceName} ·{" "}
                        {new Date(review.date).toLocaleDateString("en-US", {
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <RatingStars
                      rating={review.rating}
                      size={14}
                      className="ml-auto shrink-0"
                    />
                  </div>
                  <p className="mt-4 leading-relaxed text-neutral-600">
                    {review.comment}
                  </p>
                </article>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-4xl border border-neutral-100 bg-white p-6 shadow-[0_20px_50px_-34px_rgba(217,36,88,0.6)]">
            <h3 className="font-display flex items-center gap-2 text-lg text-ink">
              <Clock className="size-4 text-rose-500" />
              Opening hours
            </h3>
            <ul className="mt-4 flex flex-col gap-2.5 text-sm">
              {salon.openingHours.map((h) => (
                <li key={h.day} className="flex items-center justify-between gap-4">
                  <span className="text-neutral-500">{h.day}</span>
                  {h.closed ? (
                    <span className="text-neutral-400">Closed</span>
                  ) : (
                    <span className="font-medium text-ink">
                      {h.open} – {h.close}
                    </span>
                  )}
                </li>
              ))}
            </ul>

            <div className="mt-6 border-t border-neutral-100 pt-5">
              <h3 className="font-display flex items-center gap-2 text-lg text-ink">
                <MapPin className="size-4 text-purple-500" />
                Location
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                {salon.address}
                <br />
                {salon.city}
              </p>
            </div>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="bg-neutral-50 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="More like this"
              title="You may also like"
              align="center"
              className="mx-auto"
            />
            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((s) => (
                <SalonCard key={s.id} salon={s} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
