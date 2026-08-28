"use client";

import { Button } from "@/components/ui/Button";
import { ImageCropModal } from "@/components/ui/ImageCropModal";
import { Input } from "@/components/ui/Input";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { apiPost } from "@/lib/api/http";
import { auth } from "@/lib/firebase/client";
import { uploadSalonLogo, uploadVerificationDocument } from "@/lib/api/salonOwner";
import { cn } from "@/lib/utils";
import { usePublicSalonCategories } from "@/hooks/use-salons";
import { registerSalonOwnerSchema, type RegisterSalonOwnerInput } from "@/lib/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Check, ChevronDown, FileImage, FileText, Lock, Mail, Sparkles, Store, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm, type FieldPath } from "react-hook-form";

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ALLOWED_FILE_TYPES = new Set(["application/pdf", "image/jpeg", "image/png"]);

type FormInput = RegisterSalonOwnerInput;

const STEPS: {
  label: string;
  icon: typeof User;
  fields: FieldPath<FormInput>[];
}[] = [
  {
    label: "Owner",
    icon: User,
    fields: ["owner.fullName", "owner.email", "owner.phone", "owner.password"],
  },
  {
    label: "Salon",
    icon: Store,
    fields: [
      "salon.name",
      "salon.category",
      "salon.businessPhone",
      "salon.businessEmail",
      "salon.address",
      "salon.city",
      "salon.district",
      "salon.numberOfStaff",
      "salon.description",
    ],
  },
  {
    label: "Verification",
    icon: Sparkles,
    fields: [],
  },
];

function StepIndicator({ step }: { step: number }) {
  return (
    <div className="flex items-center">
      {STEPS.map((s, i) => (
        <div key={s.label} className="flex flex-1 items-center last:flex-none">
          <div className="flex flex-col items-center gap-1.5">
            <span
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                i < step
                  ? "bg-rose-500 text-white"
                  : i === step
                    ? "bg-linear-to-br from-rose-500 to-purple-600 text-white shadow-[0_6px_16px_-6px_var(--color-rose-500)]"
                    : "bg-neutral-100 text-neutral-400",
              )}
            >
              {i < step ? <Check className="size-4" /> : i + 1}
            </span>
            <span
              className={cn(
                "hidden text-xs font-medium sm:block",
                i <= step ? "text-ink" : "text-neutral-400",
              )}
            >
              {s.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <span
              className={cn(
                "mx-2 h-px flex-1 sm:mx-3",
                i < step ? "bg-rose-400" : "bg-neutral-200",
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export function RegisterSalonOwnerForm() {
  const router = useRouter();
  const { data: categories } = usePublicSalonCategories();
  const categoryOptions = (categories ?? []).map((c) => ({ value: c.slug, label: c.label }));
  const [step, setStep] = useState(0);
  const [logo, setLogo] = useState<File | null>(null);
  const [document, setDocument] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [logoCropSrc, setLogoCropSrc] = useState<string | null>(null);
  const logoPreviewUrl = useMemo(() => (logo ? URL.createObjectURL(logo) : null), [logo]);

  useEffect(() => {
    return () => {
      if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl);
    };
  }, [logoPreviewUrl]);

  // No explicit useForm<T> generic: registerSalonOwnerSchema coerces
  // numberOfStaff (string input -> number output), so the form's input
  // shape and RegisterSalonOwnerInput (the parsed output shape) differ —
  // letting the resolver infer the field types avoids fighting that.
  const {
    register,
    control,
    handleSubmit,
    trigger,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(registerSalonOwnerSchema), mode: "onBlur" });

  const isLastStep = step === STEPS.length - 1;

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

  function handleLogoFile(file: File | null) {
    setFileError(null);
    if (!file) return;
    if (file.type !== "image/jpeg" && file.type !== "image/png") {
      setFileError("Only JPG and PNG files are allowed.");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setFileError("Files must be 5MB or smaller.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setLogoCropSrc(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleLogoCropped(file: File) {
    setLogo(file);
    setLogoCropSrc(null);
  }

  async function handleNext() {
    const valid = await trigger(STEPS[step]!.fields);
    if (step === 0) {
      if (confirmPassword !== getValues("owner.password")) {
        setConfirmPasswordError("Passwords do not match");
        return;
      }
      setConfirmPasswordError(null);
    }
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1));
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
    <form
      onSubmit={handleSubmit(onSubmit)}
      onKeyDown={(e) => {
        // Enter shouldn't submit the whole application from an earlier step.
        if (e.key === "Enter" && !isLastStep) e.preventDefault();
      }}
      className="flex flex-col gap-8"
    >
      <StepIndicator step={step} />

      {step === 0 && (
        <section>
          <h2 className="font-display flex items-center gap-2 text-xl text-ink">
            <User className="size-5 text-rose-500" />
            Owner information
          </h2>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Full name"
              placeholder="e.g. Ama Perera"
              icon={<User className="size-4" />}
              error={errors.owner?.fullName?.message}
              {...register("owner.fullName")}
            />
            <Input
              label="Email"
              type="email"
              placeholder="e.g. ama@roseatelier.lk"
              icon={<Mail className="size-4" />}
              error={errors.owner?.email?.message}
              {...register("owner.email")}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              icon={<Lock className="size-4" />}
              hint="At least 8 characters"
              error={errors.owner?.password?.message}
              {...register("owner.password")}
            />
            <Input
              label="Confirm password"
              type="password"
              placeholder="••••••••"
              icon={<Lock className="size-4" />}
              error={confirmPasswordError ?? undefined}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (confirmPasswordError) setConfirmPasswordError(null);
              }}
            />
            <Controller
              name="owner.phone"
              control={control}
              render={({ field }) => (
                <PhoneInput
                  label="Phone number"
                  placeholder="77 123 4567"
                  name={field.name}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={errors.owner?.phone?.message}
                  wrapperClassName="sm:col-span-2"
                />
              )}
            />
          </div>
        </section>
      )}

      {step === 1 && (
        <section>
          <h2 className="font-display flex items-center gap-2 text-xl text-ink">
            <Store className="size-5 text-purple-500" />
            Salon information
          </h2>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Salon name"
              placeholder="e.g. The Rose Atelier"
              error={errors.salon?.name?.message}
              {...register("salon.name")}
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-neutral-800">Category</label>
              <div className="relative">
                <select
                  defaultValue=""
                  className="h-12 w-full appearance-none rounded-2xl border border-neutral-200 bg-white px-4 pr-9 text-sm text-ink outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100 [&::-ms-expand]:hidden"
                  {...register("salon.category")}
                >
                  <option value="" disabled>
                    {categoryOptions.length ? "Select a category" : "No categories available"}
                  </option>
                  {categoryOptions.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
              </div>
              {errors.salon?.category && (
                <p className="text-xs text-red-600">{errors.salon.category.message}</p>
              )}
            </div>

            <Controller
              name="salon.businessPhone"
              control={control}
              render={({ field }) => (
                <PhoneInput
                  label="Business phone"
                  placeholder="11 234 5678"
                  name={field.name}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={errors.salon?.businessPhone?.message}
                />
              )}
            />
            <Input
              label="Business email"
              type="email"
              placeholder="e.g. hello@roseatelier.lk"
              error={errors.salon?.businessEmail?.message}
              {...register("salon.businessEmail")}
            />

            <Input
              label="Address"
              placeholder="e.g. 12 Galle Road, Colombo 03"
              className="sm:col-span-2"
              error={errors.salon?.address?.message}
              {...register("salon.address")}
            />
            <Input
              label="City"
              placeholder="e.g. Colombo"
              error={errors.salon?.city?.message}
              {...register("salon.city")}
            />
            <Input
              label="District"
              placeholder="e.g. Colombo"
              error={errors.salon?.district?.message}
              {...register("salon.district")}
            />

            <Input
              label="Business registration number"
              placeholder="e.g. PV 00123456"
              hint="Optional"
              {...register("salon.businessRegistrationNumber")}
            />
            <Input
              label="Number of staff"
              type="number"
              min={1}
              placeholder="e.g. 5"
              error={errors.salon?.numberOfStaff?.message}
              {...register("salon.numberOfStaff")}
            />

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-sm font-medium text-neutral-800">Short description</label>
              <textarea
                rows={3}
                placeholder="e.g. A cosy neighbourhood salon specialising in balayage and bridal styling."
                className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-ink outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                {...register("salon.description")}
              />
              {errors.salon?.description && (
                <p className="text-xs text-red-600">{errors.salon.description.message}</p>
              )}
            </div>
          </div>
        </section>
      )}

      {step === 2 && (
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
                <span className="font-normal text-neutral-400">(optional)</span>
              </span>
              <span className="flex items-center gap-3">
                {logoPreviewUrl && (
                  // eslint-disable-next-line @next/next/no-img-element -- transient blob preview of a locally selected file
                  <img
                    src={logoPreviewUrl}
                    alt="Salon logo preview"
                    className="size-10 shrink-0 rounded-full object-cover"
                  />
                )}
                {logo ? "Change photo" : "PNG or JPG, up to 5MB"}
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png"
                className="hidden"
                onChange={(e) => {
                  handleLogoFile(e.target.files?.[0] ?? null);
                  e.target.value = "";
                }}
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

          <ImageCropModal
            key={logoCropSrc}
            open={logoCropSrc !== null}
            imageSrc={logoCropSrc}
            onClose={() => setLogoCropSrc(null)}
            onCropped={handleLogoCropped}
            fileName="salon-logo.jpg"
            title="Adjust your salon logo"
          />
        </section>
      )}

      {submitError && (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{submitError}</p>
      )}

      <div className="flex gap-3">
        {step > 0 && (
          <Button
            type="button"
            variant="outline"
            fullWidth
            onClick={() => setStep((s) => Math.max(s - 1, 0))}
            disabled={isSubmitting}
          >
            Back
          </Button>
        )}
        {isLastStep ? (
          <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
            Submit application
          </Button>
        ) : (
          <Button type="button" size="lg" fullWidth onClick={handleNext}>
            Continue
          </Button>
        )}
      </div>

      {isLastStep && (
        <p className="text-center text-xs leading-relaxed text-neutral-400">
          Your application will be reviewed by a GlowSync platform administrator before you can
          access salon-management features.
        </p>
      )}
    </form>
  );
}
