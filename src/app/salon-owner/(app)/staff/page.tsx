"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Pagination } from "@/components/ui/Pagination";
import { QueryStates } from "@/components/ui/QueryStates";
import {
  useAddStaffLeave,
  useCreateStaffMember,
  useRemoveStaffLeave,
  useServices,
  useSetStaffActive,
  useStaffLeave,
  useStaffList,
  useUpdateStaffMember,
  useUploadStaffPhoto,
} from "@/hooks/use-salon-owner";
import {
  DAYS_OF_WEEK,
  DAY_LABELS,
  type StaffDTO,
  type StaffInput,
  type StaffWeeklyAvailability,
} from "@/lib/shared";
import { Pencil, Plus, Search, Trash2, UploadCloud } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

function defaultAvailability(): StaffWeeklyAvailability {
  return Object.fromEntries(
    DAYS_OF_WEEK.map((d) => [
      d,
      { isWorking: d !== "sun", start: "09:00", end: "18:00", breaks: [] },
    ]),
  ) as unknown as StaffWeeklyAvailability;
}

const EMPTY_FORM: StaffInput = {
  fullName: "",
  phone: "",
  email: null,
  jobTitle: "",
  bio: null,
  assignedServiceIds: [],
  weeklyAvailability: defaultAvailability(),
  isActive: true,
  canAcceptBookings: true,
};

function LeavePanel({ staffId }: { staffId: string }) {
  const { data: leave } = useStaffLeave(staffId);
  const addLeave = useAddStaffLeave();
  const removeLeave = useRemoveStaffLeave();
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [reason, setReason] = useState("");

  return (
    <div className="rounded-2xl border border-neutral-100 bg-neutral-50/60 p-4">
      <p className="text-sm font-medium text-neutral-800">Leave / time off</p>
      <ul className="mt-2 flex flex-col gap-1.5">
        {(leave ?? []).map((l) => (
          <li key={l.id} className="flex items-center justify-between gap-2 text-xs text-neutral-600">
            <span>
              {new Date(l.startAt).toLocaleDateString("en-LK")} –{" "}
              {new Date(l.endAt).toLocaleDateString("en-LK")} · {l.reason}
            </span>
            <button
              type="button"
              onClick={() => removeLeave.mutate({ staffId, leaveId: l.id })}
              className="cursor-pointer text-neutral-400 hover:text-red-600"
            >
              <Trash2 className="size-3.5" />
            </button>
          </li>
        ))}
        {(leave ?? []).length === 0 && <li className="text-xs text-neutral-400">No leave recorded.</li>}
      </ul>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <input
          type="date"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          className="rounded-xl border border-neutral-200 px-2 py-1.5 text-xs"
        />
        <input
          type="date"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          className="rounded-xl border border-neutral-200 px-2 py-1.5 text-xs"
        />
        <input
          type="text"
          placeholder="Reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="col-span-2 rounded-xl border border-neutral-200 px-2 py-1.5 text-xs"
        />
        <Button
          type="button"
          size="sm"
          className="col-span-2"
          disabled={!start || !end || !reason || addLeave.isPending}
          onClick={() => {
            addLeave.mutate(
              {
                staffId,
                input: {
                  startAt: new Date(`${start}T00:00:00+05:30`).toISOString(),
                  endAt: new Date(`${end}T23:59:59+05:30`).toISOString(),
                  reason,
                },
              },
              { onSuccess: () => { setStart(""); setEnd(""); setReason(""); } },
            );
          }}
        >
          Add leave
        </Button>
      </div>
    </div>
  );
}

function StaffFormModal({
  open,
  onClose,
  editing,
}: {
  open: boolean;
  onClose: () => void;
  editing: StaffDTO | null;
}) {
  const { data: servicesData } = useServices({ isActive: true, limit: 100 });
  const createStaff = useCreateStaffMember();
  const updateStaff = useUpdateStaffMember();
  const uploadPhoto = useUploadStaffPhoto();
  const [form, setForm] = useState<StaffInput>(() =>
    editing
      ? {
          fullName: editing.fullName,
          phone: editing.phone,
          email: editing.email,
          jobTitle: editing.jobTitle,
          bio: editing.bio,
          assignedServiceIds: editing.assignedServiceIds,
          weeklyAvailability: editing.weeklyAvailability,
          isActive: editing.isActive,
          canAcceptBookings: editing.canAcceptBookings,
        }
      : EMPTY_FORM,
  );
  const [error, setError] = useState<string | null>(null);

  const services = servicesData?.items ?? [];
  const isSubmitting = createStaff.isPending || updateStaff.isPending;

  function toggleService(id: string) {
    setForm((f) => ({
      ...f,
      assignedServiceIds: f.assignedServiceIds.includes(id)
        ? f.assignedServiceIds.filter((s) => s !== id)
        : [...f.assignedServiceIds, id],
    }));
  }

  function setDay(day: keyof StaffWeeklyAvailability, patch: Partial<StaffWeeklyAvailability[typeof day]>) {
    setForm((f) => ({
      ...f,
      weeklyAvailability: { ...f.weeklyAvailability, [day]: { ...f.weeklyAvailability[day], ...patch } },
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      if (editing) {
        await updateStaff.mutateAsync({ staffId: editing.id, input: form });
      } else {
        await createStaff.mutateAsync(form);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the staff member.");
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? "Edit staff" : "Add staff"} className="max-w-2xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {editing && (
          <div className="flex items-center gap-3">
            {editing.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={editing.photoUrl} alt="" className="size-14 rounded-full object-cover" />
            ) : (
              <div className="flex size-14 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
                {editing.fullName.charAt(0)}
              </div>
            )}
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:border-rose-300">
              <UploadCloud className="size-3.5" />
              {uploadPhoto.isPending ? "Uploading..." : "Change photo"}
              <input
                type="file"
                accept="image/jpeg,image/png"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadPhoto.mutate({ staffId: editing.id, file });
                  e.target.value = "";
                }}
              />
            </label>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Full name"
            required
            value={form.fullName}
            onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
          />
          <Input
            label="Job title"
            required
            value={form.jobTitle}
            onChange={(e) => setForm((f) => ({ ...f, jobTitle: e.target.value }))}
          />
          <Input
            label="Phone"
            required
            placeholder="+94XXXXXXXXX"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
          <Input
            label="Email"
            type="email"
            value={form.email ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value || null }))}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium tracking-tight text-neutral-800">Biography</label>
          <textarea
            rows={2}
            maxLength={1000}
            value={form.bio ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value || null }))}
            className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-ink outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
          />
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-neutral-800">Services provided</p>
          {services.length === 0 ? (
            <p className="text-sm text-neutral-400">No active services yet — add services first.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {services.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleService(s.id)}
                  className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    form.assignedServiceIds.includes(s.id)
                      ? "border-rose-300 bg-rose-50 text-rose-700"
                      : "border-neutral-200 text-neutral-600 hover:border-rose-200"
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-neutral-800">Weekly working hours</p>
          <div className="flex flex-col gap-2">
            {DAYS_OF_WEEK.map((day) => {
              const d = form.weeklyAvailability[day];
              return (
                <div key={day} className="flex items-center gap-2 text-sm">
                  <label className="flex w-28 shrink-0 items-center gap-2">
                    <input
                      type="checkbox"
                      checked={d.isWorking}
                      onChange={(e) => setDay(day, { isWorking: e.target.checked })}
                    />
                    {DAY_LABELS[day]}
                  </label>
                  <input
                    type="time"
                    disabled={!d.isWorking}
                    value={d.start}
                    onChange={(e) => setDay(day, { start: e.target.value })}
                    className="rounded-xl border border-neutral-200 px-2 py-1 text-xs disabled:opacity-40"
                  />
                  <span className="text-neutral-400">to</span>
                  <input
                    type="time"
                    disabled={!d.isWorking}
                    value={d.end}
                    onChange={(e) => setDay(day, { end: e.target.value })}
                    className="rounded-xl border border-neutral-200 px-2 py-1 text-xs disabled:opacity-40"
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
            />
            Active
          </label>
          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input
              type="checkbox"
              checked={form.canAcceptBookings}
              onChange={(e) => setForm((f) => ({ ...f, canAcceptBookings: e.target.checked }))}
            />
            Can accept/reject bookings
          </label>
        </div>

        {editing && <LeavePanel staffId={editing.id} />}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="mt-2 flex gap-3">
          <Button type="button" variant="outline" fullWidth onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" fullWidth loading={isSubmitting}>
            {editing ? "Save changes" : "Add staff"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default function StaffPage() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(() => searchParams.get("new") === "1");
  const [editing, setEditing] = useState<StaffDTO | null>(null);

  const { data, isLoading, isError } = useStaffList({ search: search || undefined, page, limit: 20 });
  const setActive = useSetStaffActive();

  const items = data?.items ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-ink sm:text-3xl">Staff</h1>
          <p className="mt-1 text-sm text-neutral-500">Manage your team, availability, and leave.</p>
        </div>
        <Button
          icon={<Plus className="size-4" />}
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        >
          Add staff
        </Button>
      </div>

      <div className="mt-6 max-w-sm">
        <Input
          icon={<Search className="size-4" />}
          placeholder="Search staff..."
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
                <th className="px-4 py-3">Staff</th>
                <th className="px-4 py-3">Job title</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              <QueryStates
                isLoading={isLoading}
                isError={isError}
                isEmpty={items.length === 0}
                emptyMessage="No staff yet. Add your first team member."
                colSpan={5}
              >
                {items.map((s) => (
                  <tr key={s.id} className="border-b border-neutral-50 last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {s.photoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={s.photoUrl} alt="" className="size-9 rounded-full object-cover" />
                        ) : (
                          <div className="flex size-9 items-center justify-center rounded-full bg-neutral-100 text-xs text-neutral-500">
                            {s.fullName.charAt(0)}
                          </div>
                        )}
                        <p className="font-medium text-ink">{s.fullName}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-neutral-600">{s.jobTitle}</td>
                    <td className="px-4 py-3 text-neutral-600">{s.phone}</td>
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
                          onClick={() => setActive.mutate({ staffId: s.id, isActive: !s.isActive })}
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

      <StaffFormModal
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
