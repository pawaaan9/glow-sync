"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { apiPost } from "@/lib/api/http";
import { auth } from "@/lib/firebase/client";
import { uploadSalonLogo, uploadVerificationDocument } from "@/lib/api/salonOwner";
import {
  ALL_SALON_CATEGORIES,
  SALON_CATEGORY_LABELS,
  registerSalonOwnerSchema,
  type RegisterSalonOwnerInput,
} from "@/lib/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInWithEmailAndPassword } from "firebase/auth";
import { FileImage, FileText, Lock, Mail, Phone, Sparkles, Store, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ALLOWED_FILE_TYPES = new Set(["application/pdf", "image/jpeg", "image/png"]);

export function RegisterSalonOwnerForm() {
  const router = useRouter();
  const [logo, setLogo] = useState<File | null>(null);
  const [document, setDocument] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // No explicit useForm<T> generic: registerSalonOwnerSchema coerces
  // numberOfStaff (string input -> number output), so the form's input
  // shape and RegisterSalonOwnerInput (the parsed output shape) differ —
  // letting the resolver infer the field types avoids fighting that.
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(registerSalonOwnerSchema) });

  function handleFile(file: File | null, setter: (f: File | null) => void) {
    setFileError(null);
    if (!file) return setter(null);
    if (!ALLOWED_FILE_TYPES.has(file.type)) {
      setFileError("Only PDF, JPG, and PNG files are allowed.");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setFileError("Files must be 5MB or smaller.");
      return;
    }
    setter(file);
  }

  async function onSubmit(values: RegisterSalonOwnerInput) {
    setSubmitError(null);
    try {
      await apiPost("/api/auth/register-salon-owner", values, { auth: false });

      // Registration creates the Firebase Auth user server-side (Admin
      // SDK) — the browser was never signed in, so sign in now with the
      // credentials the owner just entered to get an authenticated
      // session for the optional file uploads and the status pages.
      await signInWithEmailAndPassword(auth, values.owner.email, values.owner.password);

      if (logo) await uploadSalonLogo(logo).catch(() => undefined);
      if (document) await uploadVerificationDocument(document).catch(() => undefined);

      router.push("/salon-owner/verification-pending");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-10">
      <section>
        <h2 className="font-display flex items-center gap-2 text-xl text-ink">
          <User className="size-5 text-rose-500" />
          Owner information
        </h2>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Full name"
            icon={<User className="size-4" />}
            error={errors.owner?.fullName?.message}
            {...register("owner.fullName")}
          />
          <Input
            label="Email"
            type="email"
            icon={<Mail className="size-4" />}
            error={errors.owner?.email?.message}
            {...register("owner.email")}
          />
          <Input
            label="Phone number"
            icon={<Phone className="size-4" />}
            error={errors.owner?.phone?.message}
            {...register("owner.phone")}
          />
          <Input
            label="Password"
            type="password"
            icon={<Lock className="size-4" />}
            hint="At least 8 characters"
            error={errors.owner?.password?.message}
            {...register("owner.password")}
          />
        </div>
      </section>

      <section>
        <h2 className="font-display flex items-center gap-2 text-xl text-ink">
          <Store className="size-5 text-purple-500" />
          Salon information
        </h2>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Salon name"
            error={errors.salon?.name?.message}
            {...register("salon.name")}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-neutral-800">Category</label>
            <select
              defaultValue=""
              className="h-12 w-full rounded-2xl border border-neutral-200 bg-white px-4 text-sm text-ink outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
              {...register("salon.category")}
            >
              <option value="" disabled>
                Select a category
              </option>
              {ALL_SALON_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {SALON_CATEGORY_LABELS[c]}
                </option>
              ))}
            </select>
            {errors.salon?.category && (
              <p className="text-xs text-red-600">{errors.salon.category.message}</p>
            )}
          </div>

          <Input
            label="Business phone"
            error={errors.salon?.businessPhone?.message}
            {...register("salon.businessPhone")}
          />
          <Input
            label="Business email"
            type="email"
            error={errors.salon?.businessEmail?.message}
            {...register("salon.businessEmail")}
          />

          <Input
            label="Address"
            className="sm:col-span-2"
            error={errors.salon?.address?.message}
            {...register("salon.address")}
          />
          <Input label="City" error={errors.salon?.city?.message} {...register("salon.city")} />
          <Input
            label="District"
            error={errors.salon?.district?.message}
            {...register("salon.district")}
          />

          <Input
            label="Business registration number"
            hint="Optional"
            {...register("salon.businessRegistrationNumber")}
          />
          <Input
            label="Number of staff"
            type="number"
            min={1}
            error={errors.salon?.numberOfStaff?.message}
            {...register("salon.numberOfStaff")}
          />

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="text-sm font-medium text-neutral-800">Short description</label>
            <textarea
              rows={3}
              className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-ink outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
              {...register("salon.description")}
            />
            {errors.salon?.description && (
              <p className="text-xs text-red-600">{errors.salon.description.message}</p>
            )}
          </div>
        </div>
      </section>

      <section>
        <h2 className="font-display flex items-center gap-2 text-xl text-ink">
          <Sparkles className="size-5 text-amber-500" />
          Branding &amp; verification
          <span className="text-sm font-normal text-neutral-400">(optional for now)</span>
        </h2>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex cursor-pointer flex-col gap-2 rounded-2xl border border-dashed border-neutral-300 p-4 text-sm text-neutral-600 hover:border-rose-300">
            <span className="flex items-center gap-2 font-medium text-ink">
              <FileImage className="size-4 text-rose-500" />
              Salon logo
            </span>
            {logo ? logo.name : "PNG or JPG, up to 5MB"}
            <input
              type="file"
              accept="image/jpeg,image/png"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0] ?? null, setLogo)}
            />
          </label>

          <label className="flex cursor-pointer flex-col gap-2 rounded-2xl border border-dashed border-neutral-300 p-4 text-sm text-neutral-600 hover:border-rose-300">
            <span className="flex items-center gap-2 font-medium text-ink">
              <FileText className="size-4 text-purple-500" />
              Verification document
            </span>
            {document ? document.name : "PDF, JPG, or PNG, up to 5MB"}
            <input
              type="file"
              accept="application/pdf,image/jpeg,image/png"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0] ?? null, setDocument)}
            />
          </label>
        </div>
        {fileError && <p className="mt-2 text-xs text-red-600">{fileError}</p>}
      </section>

      {submitError && (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{submitError}</p>
      )}

      <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
        Submit application
      </Button>
      <p className="text-center text-xs leading-relaxed text-neutral-400">
        Your application will be reviewed by a GlowSync platform administrator before you can
        access salon-management features.
      </p>
    </form>
  );
}
