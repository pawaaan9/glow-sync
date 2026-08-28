import { AUDIT_ACTIONS, VERIFICATION_HISTORY_ACTIONS } from "@/lib/shared";
import {
  CheckCircle2,
  FilePlus2,
  History,
  PencilLine,
  RotateCcw,
  Send,
  ShieldOff,
  Tags,
  Trash2,
  UserPlus,
  XCircle,
  type LucideIcon,
} from "lucide-react";

/**
 * Presentation for audit-log and verification-history entries: a readable
 * label, an icon, and a chip tone. Keeps the dashboard activity feed, the
 * audit log, and the verification timeline visually consistent.
 */
export interface ActionMeta {
  label: string;
  icon: LucideIcon;
  /** Tailwind classes for the icon chip. */
  tone: string;
}

const APPROVE = "bg-emerald-100 text-emerald-700";
const REJECT = "bg-red-100 text-red-700";
const NEUTRAL = "bg-neutral-100 text-neutral-600";
const CREATE = "bg-purple-100 text-purple-700";
const UPDATE = "bg-sky-100 text-sky-700";
const WARN = "bg-amber-100 text-amber-700";

const actionMeta: Record<string, ActionMeta> = {
  [AUDIT_ACTIONS.SALON_OWNER_REGISTERED]: {
    label: "Salon owner registered",
    icon: UserPlus,
    tone: CREATE,
  },
  [AUDIT_ACTIONS.APPLICATION_APPROVED]: {
    label: "Application approved",
    icon: CheckCircle2,
    tone: APPROVE,
  },
  [AUDIT_ACTIONS.APPLICATION_REJECTED]: {
    label: "Application rejected",
    icon: XCircle,
    tone: REJECT,
  },
  [AUDIT_ACTIONS.APPLICATION_RESUBMITTED]: {
    label: "Application resubmitted",
    icon: Send,
    tone: CREATE,
  },
  [AUDIT_ACTIONS.SALON_SUSPENDED]: {
    label: "Salon suspended",
    icon: ShieldOff,
    tone: WARN,
  },
  [AUDIT_ACTIONS.SALON_REACTIVATED]: {
    label: "Salon reactivated",
    icon: RotateCcw,
    tone: APPROVE,
  },
  [AUDIT_ACTIONS.CATEGORY_CREATED]: { label: "Category created", icon: Tags, tone: CREATE },
  [AUDIT_ACTIONS.CATEGORY_UPDATED]: { label: "Category updated", icon: PencilLine, tone: UPDATE },
  [AUDIT_ACTIONS.CATEGORY_DELETED]: { label: "Category deleted", icon: Trash2, tone: REJECT },

  // Verification-history actions overlap by name with some of the above.
  [VERIFICATION_HISTORY_ACTIONS.SUBMITTED]: {
    label: "Application submitted",
    icon: FilePlus2,
    tone: CREATE,
  },
  [VERIFICATION_HISTORY_ACTIONS.APPROVED]: {
    label: "Approved",
    icon: CheckCircle2,
    tone: APPROVE,
  },
  [VERIFICATION_HISTORY_ACTIONS.REJECTED]: { label: "Rejected", icon: XCircle, tone: REJECT },
  [VERIFICATION_HISTORY_ACTIONS.RESUBMITTED]: { label: "Resubmitted", icon: Send, tone: CREATE },
  [VERIFICATION_HISTORY_ACTIONS.SUSPENDED]: { label: "Suspended", icon: ShieldOff, tone: WARN },
  [VERIFICATION_HISTORY_ACTIONS.REACTIVATED]: {
    label: "Reactivated",
    icon: RotateCcw,
    tone: APPROVE,
  },
};

/** Falls back to a title-cased label so a newly added action still reads well. */
export function getActionMeta(action: string): ActionMeta {
  return (
    actionMeta[action] ?? {
      label: action
        .toLowerCase()
        .split("_")
        .map((w, i) => (i === 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w))
        .join(" "),
      icon: History,
      tone: NEUTRAL,
    }
  );
}

/** "2 hours ago" / "3 days ago", falling back to a date past a week. */
export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";

  const seconds = Math.round((Date.now() - then) / 1000);
  if (seconds < 60) return "just now";

  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;

  return new Date(iso).toLocaleDateString();
}
