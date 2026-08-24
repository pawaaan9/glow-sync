"use client";

import { FullPageLoader } from "@/components/auth/FullPageLoader";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import {
  useAddGalleryImage,
  useMySalon,
  useRemoveGalleryImage,
  useUpdateSalonProfile,
  useUploadSalonCover,
  useUploadSalonLogo,
} from "@/hooks/use-salon-owner";
import type { SalonDTO, SalonProfileInput } from "@/lib/shared";
import { ImagePlus, Trash2, UploadCloud } from "lucide-react";
import { useState } from "react";

function ImageUploadButton({
  label,
  onUpload,
  loading,
}: {
  label: string;
  onUpload: (file: File) => void;
  loading: boolean;
}) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-neutral-200 bg-white/60 px-4 py-2 text-sm font-medium text-neutral-800 backdrop-blur transition-colors hover:border-rose-300 hover:bg-rose-50/60">
      <UploadCloud className="size-4" />
      {loading ? "Uploading..." : label}
      <input
        type="file"
        accept="image/jpeg,image/png"
        className="hidden"
        disabled={loading}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onUpload(file);
          e.target.value = "";
        }}
      />
    </label>
  );
}

export default function SalonProfilePage() {
  const { data: salon, isLoading } = useMySalon();

  if (isLoading || !salon) return <FullPageLoader />;

  // Keyed by salon.id so the form's local state is (re-)computed fresh from
  // the loaded salon exactly once, without syncing it via an effect.
  return <SalonProfileForm key={salon.id} salon={salon} />;
}

function SalonProfileForm({ salon }: { salon: SalonDTO }) {
  const updateProfile = useUpdateSalonProfile();
  const uploadLogo = useUploadSalonLogo();
  const uploadCover = useUploadSalonCover();
  const addGalleryImage = useAddGalleryImage();
  const removeGalleryImage = useRemoveGalleryImage();

  const [form, setForm] = useState<SalonProfileInput>(() => ({
    name: salon.name,
    description: salon.description,
    businessEmail: salon.businessEmail,
    businessPhone: salon.businessPhone,
    whatsappNumber: salon.whatsappNumber,
    address: salon.address,
    city: salon.city,
    district: salon.district,
    googleMapsUrl: salon.googleMapsUrl,
    socialLinks: salon.socialLinks,
    bookingInstructions: salon.bookingInstructions,
    cancellationPolicy: salon.cancellationPolicy,
    depositPolicy: salon.depositPolicy,
  }));
  const [facilitiesText, setFacilitiesText] = useState(() => salon.facilities.join(", "));
  const [languagesText, setLanguagesText] = useState(() => salon.languages.join(", "));
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function field<K extends keyof SalonProfileInput>(key: K, value: SalonProfileInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function nullableOrValue(v: string) {
    const trimmed = v.trim();
    return trimmed === "" ? null : trimmed;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSaved(false);
    try {
      await updateProfile.mutateAsync({
        ...form,
        facilities: facilitiesText
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        languages: languagesText
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      });
      setSaved(true);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not save changes.");
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl text-ink sm:text-3xl">Salon Profile</h1>
      <p className="mt-1 text-sm text-neutral-500">
        This is what customers see. Your approval status, verification, and account role are
        managed by GlowSync and can&apos;t be edited here.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-6">
        <Card>
          <CardBody className="flex flex-col gap-4">
            <h2 className="font-display text-lg text-ink">Media</h2>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex flex-col items-center gap-2">
                {salon.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={salon.logoUrl} alt="" className="size-20 rounded-2xl object-cover" />
                ) : (
                  <div className="flex size-20 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-400">
                    <ImagePlus className="size-6" />
                  </div>
                )}
                <ImageUploadButton
                  label="Logo"
                  loading={uploadLogo.isPending}
                  onUpload={(f) => uploadLogo.mutate(f)}
                />
              </div>
              <div className="flex flex-col items-center gap-2">
                {salon.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={salon.coverImageUrl}
                    alt=""
                    className="h-20 w-36 rounded-2xl object-cover"
                  />
                ) : (
                  <div className="flex h-20 w-36 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-400">
                    <ImagePlus className="size-6" />
                  </div>
                )}
                <ImageUploadButton
                  label="Cover"
                  loading={uploadCover.isPending}
                  onUpload={(f) => uploadCover.mutate(f)}
                />
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-neutral-800">Gallery</p>
              <div className="flex flex-wrap gap-3">
                {salon.galleryUrls.map((url) => (
                  <div key={url} className="group relative size-20 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="size-20 rounded-2xl object-cover" />
                    <button
                      type="button"
                      onClick={() => removeGalleryImage.mutate(url)}
                      className="absolute -right-1.5 -top-1.5 flex size-6 cursor-pointer items-center justify-center rounded-full bg-red-600 text-white opacity-0 transition-opacity group-hover:opacity-100"
                      aria-label="Remove image"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                ))}
                <label className="flex size-20 shrink-0 cursor-pointer items-center justify-center rounded-2xl border border-dashed border-neutral-300 text-neutral-400 hover:border-rose-300 hover:text-rose-500">
                  <ImagePlus className="size-5" />
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    className="hidden"
                    disabled={addGalleryImage.isPending}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) addGalleryImage.mutate(file);
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex flex-col gap-4">
            <h2 className="font-display text-lg text-ink">Basic info</h2>
            <Input
              label="Salon name"
              required
              maxLength={120}
              value={form.name ?? ""}
              onChange={(e) => field("name", e.target.value)}
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium tracking-tight text-neutral-800">
                Description
              </label>
              <textarea
                required
                minLength={10}
                maxLength={1000}
                rows={4}
                value={form.description ?? ""}
                onChange={(e) => field("description", e.target.value)}
                className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-ink outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
              />
            </div>
            <Input
              label="Facilities (comma-separated)"
              placeholder="Parking, Air conditioning, Wi-Fi"
              value={facilitiesText}
              onChange={(e) => setFacilitiesText(e.target.value)}
            />
            <Input
              label="Supported languages (comma-separated)"
              placeholder="Sinhala, Tamil, English"
              value={languagesText}
              onChange={(e) => setLanguagesText(e.target.value)}
            />
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex flex-col gap-4">
            <h2 className="font-display text-lg text-ink">Contact & location</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Business email"
                type="email"
                required
                value={form.businessEmail ?? ""}
                onChange={(e) => field("businessEmail", e.target.value)}
              />
              <Input
                label="Business phone"
                required
                placeholder="+94XXXXXXXXX"
                value={form.businessPhone ?? ""}
                onChange={(e) => field("businessPhone", e.target.value)}
              />
              <Input
                label="WhatsApp number"
                placeholder="+94XXXXXXXXX"
                value={form.whatsappNumber ?? ""}
                onChange={(e) => field("whatsappNumber", nullableOrValue(e.target.value))}
              />
              <Input
                label="Google Maps link"
                placeholder="https://maps.google.com/..."
                value={form.googleMapsUrl ?? ""}
                onChange={(e) => field("googleMapsUrl", nullableOrValue(e.target.value))}
              />
            </div>
            <Input
              label="Address"
              required
              value={form.address ?? ""}
              onChange={(e) => field("address", e.target.value)}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="City"
                required
                value={form.city ?? ""}
                onChange={(e) => field("city", e.target.value)}
              />
              <Input
                label="District"
                required
                value={form.district ?? ""}
                onChange={(e) => field("district", e.target.value)}
              />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex flex-col gap-4">
            <h2 className="font-display text-lg text-ink">Social media</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Instagram"
                placeholder="https://instagram.com/..."
                value={form.socialLinks?.instagram ?? ""}
                onChange={(e) =>
                  field("socialLinks", {
                    instagram: nullableOrValue(e.target.value),
                    facebook: form.socialLinks?.facebook ?? null,
                    tiktok: form.socialLinks?.tiktok ?? null,
                    website: form.socialLinks?.website ?? null,
                  })
                }
              />
              <Input
                label="Facebook"
                placeholder="https://facebook.com/..."
                value={form.socialLinks?.facebook ?? ""}
                onChange={(e) =>
                  field("socialLinks", {
                    instagram: form.socialLinks?.instagram ?? null,
                    facebook: nullableOrValue(e.target.value),
                    tiktok: form.socialLinks?.tiktok ?? null,
                    website: form.socialLinks?.website ?? null,
                  })
                }
              />
              <Input
                label="TikTok"
                placeholder="https://tiktok.com/@..."
                value={form.socialLinks?.tiktok ?? ""}
                onChange={(e) =>
                  field("socialLinks", {
                    instagram: form.socialLinks?.instagram ?? null,
                    facebook: form.socialLinks?.facebook ?? null,
                    tiktok: nullableOrValue(e.target.value),
                    website: form.socialLinks?.website ?? null,
                  })
                }
              />
              <Input
                label="Website"
                placeholder="https://..."
                value={form.socialLinks?.website ?? ""}
                onChange={(e) =>
                  field("socialLinks", {
                    instagram: form.socialLinks?.instagram ?? null,
                    facebook: form.socialLinks?.facebook ?? null,
                    tiktok: form.socialLinks?.tiktok ?? null,
                    website: nullableOrValue(e.target.value),
                  })
                }
              />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex flex-col gap-4">
            <h2 className="font-display text-lg text-ink">Booking policies</h2>
            {(
              [
                ["bookingInstructions", "Booking instructions"],
                ["cancellationPolicy", "Cancellation policy"],
                ["depositPolicy", "Deposit policy"],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="flex flex-col gap-1.5">
                <label className="text-sm font-medium tracking-tight text-neutral-800">{label}</label>
                <textarea
                  rows={3}
                  maxLength={1000}
                  value={form[key] ?? ""}
                  onChange={(e) => field(key, nullableOrValue(e.target.value))}
                  className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-ink outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                />
              </div>
            ))}
          </CardBody>
        </Card>

        {formError && <p className="text-sm text-red-600">{formError}</p>}
        {saved && !formError && <p className="text-sm text-emerald-600">Saved.</p>}

        <Button type="submit" size="lg" loading={updateProfile.isPending} className="w-fit">
          Save changes
        </Button>
      </form>
    </div>
  );
}
