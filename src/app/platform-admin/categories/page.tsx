"use client";

import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  useCreateSalonCategory,
  useDeleteSalonCategory,
  useSalonCategories,
  useUpdateSalonCategory,
} from "@/hooks/use-platform-admin";
import type { SalonCategoryDTO } from "@/lib/shared";
import { cn } from "@/lib/utils";
import { Plus, Tags, Trash2 } from "lucide-react";
import { useState } from "react";

/** Live preview of the slug the server will derive from the typed label. */
function previewSlug(label: string) {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

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

  const activeCount = data?.filter((c) => c.isActive).length ?? 0;
  const slug = previewSlug(label);

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

  const columns: DataTableColumn<SalonCategoryDTO>[] = [
    {
      key: "name",
      header: "Name",
      cardSlot: "primary",
      cell: (category) => <span className="font-medium text-ink">{category.label}</span>,
    },
    {
      key: "slug",
      header: "Slug",
      cell: (category) => (
        <code className="rounded-md bg-neutral-100 px-1.5 py-0.5 font-mono text-xs text-neutral-600">
          {category.slug}
        </code>
      ),
    },
    {
      key: "salons",
      header: "Salons",
      cell: (category) => (
        <span
          className={cn(
            "inline-flex min-w-7 justify-center rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums",
            category.salonCount > 0
              ? "bg-purple-100 text-purple-700"
              : "bg-neutral-100 text-neutral-400",
          )}
        >
          {category.salonCount}
        </span>
      ),
    },
    {
      key: "active",
      header: "Shown at registration",
      cell: (category) => (
        <button
          type="button"
          role="switch"
          aria-checked={category.isActive}
          aria-label={`${category.isActive ? "Hide" : "Show"} ${category.label} at registration`}
          onClick={() => toggleActive(category)}
          disabled={updateCategory.isPending}
          className={cn(
            "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors disabled:opacity-50",
            category.isActive ? "bg-rose-500" : "bg-neutral-200",
          )}
        >
          <span
            className={cn(
              "inline-block size-5 transform rounded-full bg-white shadow transition-transform",
              category.isActive ? "translate-x-5" : "translate-x-0.5",
            )}
          />
        </button>
      ),
    },
  ];

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <PageHeader
        eyebrow="Catalogue"
        title="Salon categories"
        description="The categories a salon owner picks from when registering. Deactivate one to hide it from new registrations without affecting existing salons."
        icon={Tags}
        actions={
          <Button icon={<Plus className="size-4" />} onClick={openAdd}>
            Add category
          </Button>
        }
      />

      {/* Quick read on the catalogue's shape. */}
      {!isLoading && data && data.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[
            { label: "Categories", value: data.length, tone: "text-ink" },
            { label: "Shown at registration", value: activeCount, tone: "text-emerald-600" },
            { label: "Hidden", value: data.length - activeCount, tone: "text-neutral-400" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-neutral-100 bg-white px-4 py-3"
            >
              <p className={cn("font-display text-2xl", stat.tone)}>{stat.value}</p>
              <p className="mt-0.5 text-xs text-neutral-500">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {rowError && (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{rowError}</p>
      )}

      <DataTable
        columns={columns}
        rows={data ?? []}
        rowKey={(category) => category.id}
        isLoading={isLoading}
        isError={isError}
        emptyMessage="No categories yet. Add one to show it on the salon registration form."
        emptyIcon={Tags}
        actions={(category) => (
          <button
            type="button"
            onClick={() => setToDelete(category)}
            disabled={category.salonCount > 0}
            title={
              category.salonCount > 0
                ? "In use by a salon — deactivate instead"
                : "Delete category"
            }
            className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:pointer-events-none disabled:opacity-30"
          >
            <Trash2 className="size-4" />
            <span className="sr-only">Delete {category.label}</span>
          </button>
        )}
      />

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
            hint="Shown to salon owners on the registration form."
          />

          {slug && !formError && (
            <p className="flex flex-wrap items-center gap-2 rounded-2xl bg-neutral-50 px-4 py-3 text-xs text-neutral-500">
              Saved as
              <code className="rounded-md bg-white px-1.5 py-0.5 font-mono text-neutral-700 ring-1 ring-neutral-200">
                {slug}
              </code>
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row">
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
