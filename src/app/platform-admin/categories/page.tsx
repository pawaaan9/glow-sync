"use client";

import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { QueryStates } from "@/components/ui/QueryStates";
import {
  useCreateSalonCategory,
  useDeleteSalonCategory,
  useSalonCategories,
  useUpdateSalonCategory,
} from "@/hooks/use-platform-admin";
import type { SalonCategoryDTO } from "@/lib/shared";
import { Plus, Tags, Trash2 } from "lucide-react";
import { useState } from "react";

export default function CategoriesPage() {
  const { data, isLoading, isError } = useSalonCategories();
  const createCategory = useCreateSalonCategory();
  const updateCategory = useUpdateSalonCategory();
  const deleteCategory = useDeleteSalonCategory();

  const [addOpen, setAddOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<SalonCategoryDTO | null>(null);
  const [rowError, setRowError] = useState<string | null>(null);

  function openAdd() {
    setLabel("");
    setFormError(null);
    setAddOpen(true);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    const trimmed = label.trim();
    if (trimmed.length < 2) {
      setFormError("Enter a category name of at least 2 characters.");
      return;
    }
    try {
      await createCategory.mutateAsync({ label: trimmed, isActive: true });
      setAddOpen(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not add the category.");
    }
  }

  async function toggleActive(category: SalonCategoryDTO) {
    setRowError(null);
    try {
      await updateCategory.mutateAsync({
        id: category.id,
        input: { isActive: !category.isActive },
      });
    } catch (err) {
      setRowError(err instanceof Error ? err.message : "Could not update the category.");
    }
  }

  async function handleDelete() {
    if (!toDelete) return;
    setRowError(null);
    try {
      await deleteCategory.mutateAsync(toDelete.id);
      setToDelete(null);
    } catch (err) {
      setRowError(err instanceof Error ? err.message : "Could not delete the category.");
      setToDelete(null);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display flex items-center gap-2 text-2xl text-ink">
            <Tags className="size-6 text-rose-500" />
            Salon categories
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-neutral-500">
            The categories a salon owner picks from when registering (Spa, Nail Salon, and so on).
            Deactivate one to hide it from new registrations without affecting existing salons.
          </p>
        </div>
        <Button icon={<Plus className="size-4" />} onClick={openAdd}>
          Add category
        </Button>
      </div>

      {rowError && (
        <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{rowError}</p>
      )}

      <div className="mt-6 overflow-hidden rounded-3xl border border-neutral-100 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-neutral-100 bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Salons</th>
                <th className="px-4 py-3 font-medium">Shown at registration</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              <QueryStates
                isLoading={isLoading}
                isError={isError}
                isEmpty={!isLoading && (data?.length ?? 0) === 0}
                emptyMessage="No categories yet. Add one to show it on the salon registration form."
                colSpan={5}
              >
                {data?.map((category) => (
                  <tr key={category.id} className="transition-colors hover:bg-neutral-50">
                    <td className="px-4 py-3 font-medium text-ink">{category.label}</td>
                    <td className="px-4 py-3 font-mono text-xs text-neutral-500">{category.slug}</td>
                    <td className="px-4 py-3 text-neutral-600">{category.salonCount}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={category.isActive}
                        onClick={() => toggleActive(category)}
                        disabled={updateCategory.isPending}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors disabled:opacity-50 ${
                          category.isActive ? "bg-rose-500" : "bg-neutral-200"
                        }`}
                      >
                        <span
                          className={`inline-block size-5 transform rounded-full bg-white shadow transition-transform ${
                            category.isActive ? "translate-x-5" : "translate-x-0.5"
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setToDelete(category)}
                        disabled={category.salonCount > 0}
                        title={
                          category.salonCount > 0
                            ? "In use by a salon — deactivate instead"
                            : "Delete category"
                        }
                        className="inline-flex size-8 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:pointer-events-none disabled:opacity-30"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </QueryStates>
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add category">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <Input
            autoFocus
            label="Category name"
            placeholder="e.g. Massage Therapy"
            value={label}
            onChange={(e) => {
              setLabel(e.target.value);
              if (formError) setFormError(null);
            }}
            error={formError ?? undefined}
            hint="A URL-friendly slug is generated from this name automatically."
          />
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              fullWidth
              onClick={() => setAddOpen(false)}
              disabled={createCategory.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" fullWidth loading={createCategory.isPending}>
              Add category
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={toDelete !== null}
        onClose={() => setToDelete(null)}
        onConfirm={handleDelete}
        title="Delete category?"
        description={`"${toDelete?.label}" will no longer be offered at registration. This can't be undone.`}
        confirmLabel="Delete"
        variant="danger"
        isSubmitting={deleteCategory.isPending}
      />
    </div>
  );
}
