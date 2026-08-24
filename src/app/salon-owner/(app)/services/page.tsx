"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Pagination } from "@/components/ui/Pagination";
import { QueryStates } from "@/components/ui/QueryStates";
import {
  useCreateService,
  useDuplicateService,
  useServices,
  useSetServiceActive,
  useStaffList,
  useUpdateService,
} from "@/hooks/use-salon-owner";
import type { ServiceDTO, ServiceInput } from "@/lib/shared";
import { Copy, Pencil, Plus, Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

function formatLkr(amount: number) {
  return `Rs. ${amount.toLocaleString("en-LK", { maximumFractionDigits: 0 })}`;
}

const EMPTY_FORM: ServiceInput = {
  name: "",
  category: "",
  description: "",
  durationMinutes: 30,
  priceLkr: 0,
  discountedPriceLkr: null,
  depositLkr: null,
  assignedStaffIds: [],
  isActive: true,
};

function ServiceFormModal({
  open,
  onClose,
  editing,
}: {
  open: boolean;
  onClose: () => void;
  editing: ServiceDTO | null;
}) {
  const { data: staffData } = useStaffList({ isActive: true, limit: 100 });
  const createService = useCreateService();
  const updateService = useUpdateService();
  const [form, setForm] = useState<ServiceInput>(() =>
    editing
      ? {
          name: editing.name,
          category: editing.category,
          description: editing.description,
          durationMinutes: editing.durationMinutes,
          priceLkr: editing.priceLkr,
          discountedPriceLkr: editing.discountedPriceLkr,
          depositLkr: editing.depositLkr,
          assignedStaffIds: editing.assignedStaffIds,
          isActive: editing.isActive,
        }
      : EMPTY_FORM,
  );
  const [error, setError] = useState<string | null>(null);

  const staff = staffData?.items ?? [];
  const isSubmitting = createService.isPending || updateService.isPending;

  function toggleStaff(id: string) {
    setForm((f) => ({
      ...f,
      assignedStaffIds: f.assignedStaffIds.includes(id)
        ? f.assignedStaffIds.filter((s) => s !== id)
        : [...f.assignedStaffIds, id],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      if (editing) {
        await updateService.mutateAsync({ serviceId: editing.id, input: form });
      } else {
        await createService.mutateAsync(form);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the service.");
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? "Edit service" : "Add service"}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Name"
          required
          maxLength={120}
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
        <Input
          label="Category"
          required
          placeholder="e.g. Hair, Nails, Facial"
          maxLength={60}
          value={form.category}
          onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium tracking-tight text-neutral-800">Description</label>
          <textarea
            rows={3}
            maxLength={1000}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-ink outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Duration (minutes)"
            type="number"
            required
            min={5}
            max={600}
            value={form.durationMinutes}
            onChange={(e) => setForm((f) => ({ ...f, durationMinutes: Number(e.target.value) }))}
          />
          <Input
            label="Price (LKR)"
            type="number"
            required
            min={0}
            value={form.priceLkr}
            onChange={(e) => setForm((f) => ({ ...f, priceLkr: Number(e.target.value) }))}
          />
          <Input
            label="Discounted price (LKR)"
            type="number"
            min={0}
            value={form.discountedPriceLkr ?? ""}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                discountedPriceLkr: e.target.value === "" ? null : Number(e.target.value),
              }))
            }
          />
          <Input
            label="Deposit (LKR)"
            type="number"
            min={0}
            value={form.depositLkr ?? ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, depositLkr: e.target.value === "" ? null : Number(e.target.value) }))
            }
          />
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-neutral-800">Assigned staff</p>
          {staff.length === 0 ? (
            <p className="text-sm text-neutral-400">No active staff yet — add staff first.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {staff.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleStaff(s.id)}
                  className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    form.assignedStaffIds.includes(s.id)
                      ? "border-rose-300 bg-rose-50 text-rose-700"
                      : "border-neutral-200 text-neutral-600 hover:border-rose-200"
                  }`}
                >
                  {s.fullName}
                </button>
              ))}
            </div>
          )}
        </div>

        <label className="flex items-center gap-2 text-sm text-neutral-700">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
          />
          Active — visible for new bookings
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="mt-2 flex gap-3">
          <Button type="button" variant="outline" fullWidth onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" fullWidth loading={isSubmitting}>
            {editing ? "Save changes" : "Add service"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default function ServicesPage() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(() => searchParams.get("new") === "1");
  const [editing, setEditing] = useState<ServiceDTO | null>(null);

  const { data, isLoading, isError } = useServices({ search: search || undefined, page, limit: 20 });
  const setActive = useSetServiceActive();
  const duplicate = useDuplicateService();

  const items = data?.items ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-ink sm:text-3xl">Services</h1>
          <p className="mt-1 text-sm text-neutral-500">Manage what your salon offers customers.</p>
        </div>
        <Button
          icon={<Plus className="size-4" />}
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        >
          Add service
        </Button>
      </div>

      <div className="mt-6 max-w-sm">
        <Input
          icon={<Search className="size-4" />}
          placeholder="Search services..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <Card className="mt-4 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-neutral-100 text-xs uppercase tracking-wide text-neutral-400">
              <tr>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              <QueryStates
                isLoading={isLoading}
                isError={isError}
                isEmpty={items.length === 0}
                emptyMessage="No services yet. Add your first one."
                colSpan={6}
              >
                {items.map((s) => (
                  <tr key={s.id} className="border-b border-neutral-50 last:border-0">
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink">{s.name}</p>
                      <p className="text-xs text-neutral-400">{s.assignedStaffIds.length} staff assigned</p>
                    </td>
                    <td className="px-4 py-3 text-neutral-600">{s.category}</td>
                    <td className="px-4 py-3 text-neutral-600">{s.durationMinutes} min</td>
                    <td className="px-4 py-3 text-neutral-600">
                      {s.discountedPriceLkr ? (
                        <>
                          <span className="text-neutral-400 line-through">{formatLkr(s.priceLkr)}</span>{" "}
                          {formatLkr(s.discountedPriceLkr)}
                        </>
                      ) : (
                        formatLkr(s.priceLkr)
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={s.isActive ? "success" : "neutral"}>
                        {s.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setEditing(s);
                            setModalOpen(true);
                          }}
                          className="flex size-8 cursor-pointer items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100"
                          aria-label="Edit"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          onClick={() => duplicate.mutate(s.id)}
                          className="flex size-8 cursor-pointer items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100"
                          aria-label="Duplicate"
                        >
                          <Copy className="size-4" />
                        </button>
                        <button
                          onClick={() => setActive.mutate({ serviceId: s.id, isActive: !s.isActive })}
                          className="rounded-full border border-neutral-200 px-3 py-1 text-xs font-medium text-neutral-600 hover:border-rose-300"
                        >
                          {s.isActive ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </QueryStates>
            </tbody>
          </table>
        </div>
        {data && (
          <Pagination page={data.page} totalPages={data.totalPages} total={data.total} onPageChange={setPage} />
        )}
      </Card>

      <ServiceFormModal
        key={`${modalOpen}-${editing?.id ?? "new"}`}
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        editing={editing}
      />
    </div>
  );
}
