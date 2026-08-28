"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useResubmitApplication } from "@/hooks/use-salon-owner";
import { usePublicSalonCategories } from "@/hooks/use-salons";
import {
  resubmitSalonApplicationSchema,
  salonCategoryLabel,
  type SalonDTO,
} from "@/lib/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send } from "lucide-react";
import { useForm } from "react-hook-form";

export function ResubmitForm({ salon, onDone }: Readonly<{ salon: SalonDTO; onDone: () => void }>) {
  const resubmit = useResubmitApplication();
  const { data: categories } = usePublicSalonCategories();

  const activeOptions = (categories ?? []).map((c) => ({ value: c.slug, label: c.label }));
  // Keep the salon's current category selectable even if it was since deactivated.
  const categoryOptions = activeOptions.some((o) => o.value === salon.category)
    ? activeOptions
    : [{ value: salon.category, label: salonCategoryLabel(salon.category) }, ...activeOptions];

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resubmitSalonApplicationSchema),
    defaultValues: {
      salon: {
        name: salon.name,
        businessPhone: salon.businessPhone,
        businessEmail: salon.businessEmail,
        address: salon.address,
        city: salon.city,
        district: salon.district,
        businessRegistrationNumber: salon.businessRegistrationNumber ?? undefined,
        description: salon.description,
        category: salon.category,
        numberOfStaff: salon.numberOfStaff,
      },
    },
  });

  async function onSubmit(values: { salon: Record<string, unknown> }) {
    await resubmit.mutateAsync(values as never);
    onDone();
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-3 text-left"
    >
      <Input label="Salon name" {...register("salon.name")} error={errors.salon?.name?.message} />
      <Input
        label="Description"
        {...register("salon.description")}
        error={errors.salon?.description?.message}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Business phone"
          {...register("salon.businessPhone")}
          error={errors.salon?.businessPhone?.message}
        />
        <Input
          label="Business email"
          {...register("salon.businessEmail")}
          error={errors.salon?.businessEmail?.message}
        />
      </div>
      <Input label="Address" {...register("salon.address")} error={errors.salon?.address?.message} />
      <div className="grid grid-cols-2 gap-3">
        <Input label="City" {...register("salon.city")} error={errors.salon?.city?.message} />
        <Input
          label="District"
          {...register("salon.district")}
          error={errors.salon?.district?.message}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-neutral-800">Category</label>
          <select
            {...register("salon.category")}
            className="h-12 w-full rounded-2xl border border-neutral-200 bg-white px-4 text-sm text-ink outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
          >
            {categoryOptions.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <Input
          label="Number of staff"
          type="number"
          {...register("salon.numberOfStaff")}
          error={errors.salon?.numberOfStaff?.message}
        />
      </div>

      <Button type="submit" fullWidth loading={isSubmitting} icon={<Send className="size-4" />}>
        Resubmit for review
      </Button>
      {resubmit.isError && (
        <p className="text-sm text-red-600">
          {(resubmit.error as Error)?.message ?? "Something went wrong. Please try again."}
        </p>
      )}
    </form>
  );
}
