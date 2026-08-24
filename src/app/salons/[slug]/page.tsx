import { CategoryIcon } from "@/components/salon/CategoryIcon";
import { SalonCard } from "@/components/salon/SalonCard";
import { ServiceCard } from "@/components/salon/ServiceCard";
import { StaffCard } from "@/components/salon/StaffCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/Card";
import { DAYS_OF_WEEK, DAY_LABELS, SALON_CATEGORY_LABELS } from "@/lib/shared";
import { cn } from "@/lib/utils";
import {
  getPublicSalonBySlug,
  listPublicSalons,
} from "@/server/services/publicCatalogService";
import { Check, Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: PageProps<"/salons/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const salon = await getPublicSalonBySlug(slug).catch(() => null);
  if (!salon) return { title: "Salon not found — GlowSync" };
  return {
    title: `${salon.name} — GlowSync`,
    description: salon.description,
  };
}

export default async function SalonPage({ params }: PageProps<"/salons/[slug]">) {
  const { slug } = await params;

  const salon = await getPublicSalonBySlug(slug).catch(() => null);
  if (!salon) notFound();

  // Other live salons in the same category, for the "more like this" rail.
  const related = (await listPublicSalons({ category: salon.category }))
    .filter((s) => s.id !== salon.id)
    .slice(0, 3);

  const cover = salon.coverImageUrl ?? salon.logoUrl;
  const socials = [
    { href: salon.socialLinks.instagram, label: "Instagram" },
    { href: salon.socialLinks.facebook, label: "Facebook" },
    { href: salon.socialLinks.tiktok, label: "TikTok" },
    { href: salon.socialLinks.website, label: "Website" },
  ].filter((s): s is { href: string; label: string } => Boolean(s.href));

  return (
    <div className="flex flex-col">
      {/* Cover */}
      <section className="relative h-[46vh] min-h-80 w-full overflow-hidden">
        {cover ? (
          <Image src={cover} alt={salon.name} fill priority sizes="100vw" className="object-cover" />
        ) : (
          <div className="size-full bg-linear-to-br from-rose-200 via-purple-200 to-amber-100" />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-ink via-ink/50 to-ink/10" />

        <div className="absolute inset-x-0 bottom-0">
          <div className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
            <Badge variant="glass" className="inline-flex items-center gap-1.5">
              <CategoryIcon category={salon.category} className="size-3.5" />
              {SALON_CATEGORY_LABELS[salon.category]}
            </Badge>

            <h1 className="font-display font-display-tight mt-4 text-[clamp(2.25rem,6vw,4rem)] text-white">
              {salon.name}
            </h1>

            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/85">
              <span className="flex items-center gap-1.5">
                <MapPin className="size-4" />
                {salon.address}, {salon.city}
              </span>
              <a
                href={`tel:${salon.businessPhone}`}
                className="flex items-center gap-1.5 transition-colors hover:text-white"
              >
                <Phone className="size-4" />
                {salon.businessPhone}
              </a>
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

            {salon.facilities.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {salon.facilities.map((f) => (
                  <span
                    key={f}
                    className="flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-600"
                  >
                    <Check className="size-3.5 text-rose-500" />
                    {f}
                  </span>
                ))}
              </div>
            )}

            {salon.languages.length > 0 && (
              <p className="mt-4 text-sm text-neutral-500">
                Spoken here: <span className="text-ink">{salon.languages.join(", ")}</span>
              </p>
            )}
          </section>

          {salon.galleryUrls.length > 0 && (
            <section>
              <SectionHeading eyebrow="Gallery" title="Inside the space" />
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {salon.galleryUrls.map((url, i) => (
                  <div
                    key={url}
                    className={cn(
                      "group relative overflow-hidden rounded-3xl bg-neutral-100",
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

          {/* Service menu */}
          <section id="services">
            <SectionHeading
              eyebrow="Menu"
              title={
                salon.services.length
                  ? `${salon.services.length} service${salon.services.length === 1 ? "" : "s"}`
                  : "Services"
              }
            />
            {salon.services.length > 0 ? (
              <div className="mt-6 flex flex-col gap-3">
                {salon.services.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            ) : (
              <p className="mt-6 rounded-3xl border border-dashed border-neutral-200 bg-neutral-50 p-8 text-center text-sm text-neutral-500">
                {salon.name} has not published a service menu yet. Call them to ask what
                they offer.
              </p>
            )}
          </section>

          {/* Team */}
          {salon.staff.length > 0 && (
            <section>
              <SectionHeading eyebrow="The team" title="Who you will meet" />
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {salon.staff.map((member) => (
                  <StaffCard key={member.id} staff={member} />
                ))}
              </div>
            </section>
          )}

          {(salon.bookingInstructions || salon.cancellationPolicy) && (
            <section>
              <SectionHeading eyebrow="Good to know" title="Booking & cancellation" />
              <div className="mt-6 flex flex-col gap-4">
                {salon.bookingInstructions && (
                  <div className="rounded-3xl border border-neutral-100 bg-white p-6">
                    <h3 className="font-display text-lg text-ink">How to book</h3>
                    <p className="mt-2 leading-relaxed text-neutral-600">
                      {salon.bookingInstructions}
                    </p>
                  </div>
                )}
                {salon.cancellationPolicy && (
                  <div className="rounded-3xl border border-neutral-100 bg-white p-6">
                    <h3 className="font-display text-lg text-ink">Cancellation policy</h3>
                    <p className="mt-2 leading-relaxed text-neutral-600">
                      {salon.cancellationPolicy}
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-4xl border border-neutral-100 bg-white p-6 shadow-[0_20px_50px_-34px_rgba(217,36,88,0.6)]">
            <h3 className="font-display text-lg text-ink">Book with {salon.name}</h3>
            <p className="mt-1 text-sm text-neutral-500">
              Online booking is coming soon — reach the salon directly for now.
            </p>

            <div className="mt-4 flex flex-col gap-2.5">
              <Button href={`tel:${salon.businessPhone}`} fullWidth icon={<Phone className="size-4" />}>
                Call the salon
              </Button>
              {salon.whatsappNumber && (
                <Button
                  href={`https://wa.me/${salon.whatsappNumber.replace(/[^\d]/g, "")}`}
                  variant="outline"
                  fullWidth
                  icon={<MessageCircle className="size-4" />}
                >
                  WhatsApp
                </Button>
              )}
              <Button
                href={`mailto:${salon.businessEmail}`}
                variant="outline"
                fullWidth
                icon={<Mail className="size-4" />}
              >
                Email
              </Button>
            </div>

            <div className="mt-6 border-t border-neutral-100 pt-5">
              <h3 className="font-display flex items-center gap-2 text-lg text-ink">
                <Clock className="size-4 text-rose-500" />
                Opening hours
              </h3>
              <ul className="mt-4 flex flex-col gap-2.5 text-sm">
                {DAYS_OF_WEEK.map((day) => {
                  const hours = salon.weeklyHours[day];
                  return (
                    <li key={day} className="flex items-center justify-between gap-4">
                      <span className="text-neutral-500">{DAY_LABELS[day]}</span>
                      {hours.isOpen ? (
                        <span className="font-medium text-ink">
                          {hours.open} – {hours.close}
                        </span>
                      ) : (
                        <span className="text-neutral-400">Closed</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="mt-6 border-t border-neutral-100 pt-5">
              <h3 className="font-display flex items-center gap-2 text-lg text-ink">
                <MapPin className="size-4 text-purple-500" />
                Location
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                {salon.address}
                <br />
                {salon.city}, {salon.district}
              </p>
              {salon.googleMapsUrl && (
                <a
                  href={salon.googleMapsUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mt-2 inline-block text-sm font-medium text-rose-600 hover:underline"
                >
                  Open in Google Maps
                </a>
              )}
            </div>

            {socials.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2 border-t border-neutral-100 pt-5">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:border-rose-300 hover:text-rose-600"
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            )}
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
