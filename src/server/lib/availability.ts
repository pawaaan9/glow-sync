import "server-only";
import { defaultWeeklyHours, type DayOfWeek } from "@/lib/shared";
import { ApiError } from "@/server/lib/apiError";
import type { SalonDocument, StaffDocument } from "@/server/types/firestore";

/** Sri Lanka is a fixed UTC+5:30 offset year-round — no DST to account for. */
const COLOMBO_OFFSET_MINUTES = 5 * 60 + 30;

const DAY_INDEX: DayOfWeek[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

export interface ColomboLocal {
  dayOfWeek: DayOfWeek;
  /** "HH:mm" wall-clock time in Asia/Colombo. */
  time: string;
  /** "YYYY-MM-DD" wall-clock date in Asia/Colombo. */
  date: string;
}

export function toColomboLocal(date: Date): ColomboLocal {
  const shifted = new Date(date.getTime() + COLOMBO_OFFSET_MINUTES * 60_000);
  const hh = String(shifted.getUTCHours()).padStart(2, "0");
  const mm = String(shifted.getUTCMinutes()).padStart(2, "0");
  const yyyy = shifted.getUTCFullYear();
  const mo = String(shifted.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(shifted.getUTCDate()).padStart(2, "0");
  return {
    dayOfWeek: DAY_INDEX[shifted.getUTCDay()]!,
    time: `${hh}:${mm}`,
    date: `${yyyy}-${mo}-${dd}`,
  };
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

function rangesOverlap(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && aEnd > bStart;
}

/** Throws if [start, end) falls outside the salon's opening hours, on a closed day, or during a closure/break. */
export function assertWithinSalonHours(salon: SalonDocument, start: Date, end: Date) {
  const startLocal = toColomboLocal(start);
  const endLocal = toColomboLocal(end);

  for (const closure of salon.closures ?? []) {
    if (startLocal.date >= closure.startDate && startLocal.date <= closure.endDate) {
      throw ApiError.conflict(`The salon is closed during this period: ${closure.reason}`);
    }
  }

  const special = (salon.specialHours ?? []).find((s) => s.date === startLocal.date);
  const dayHours = special
    ? special.isClosed
      ? null
      : { open: special.open ?? "00:00", close: special.close ?? "23:59", breaks: [] as { start: string; end: string }[] }
    : (salon.weeklyHours ?? defaultWeeklyHours())[startLocal.dayOfWeek];

  if (!dayHours || ("isOpen" in dayHours && !dayHours.isOpen)) {
    throw ApiError.conflict("The salon is closed on the selected day");
  }

  const openMin = timeToMinutes(dayHours.open);
  const closeMin = timeToMinutes(dayHours.close);
  const startMin = timeToMinutes(startLocal.time);
  const endMin = endLocal.date === startLocal.date ? timeToMinutes(endLocal.time) : 24 * 60;

  if (startMin < openMin || endMin > closeMin) {
    throw ApiError.conflict("The selected time is outside the salon's working hours");
  }

  for (const b of dayHours.breaks) {
    if (rangesOverlap(startMin, endMin, timeToMinutes(b.start), timeToMinutes(b.end))) {
      throw ApiError.conflict("The selected time overlaps a break period");
    }
  }
}

/** Throws if [start, end) falls outside this staff member's own weekly schedule. */
export function assertStaffAvailable(staff: StaffDocument, start: Date, end: Date) {
  const startLocal = toColomboLocal(start);
  const endLocal = toColomboLocal(end);
  const day = staff.weeklyAvailability[startLocal.dayOfWeek];

  if (!day.isWorking) {
    throw ApiError.conflict(`${staff.fullName} is not scheduled to work on this day`);
  }

  const openMin = timeToMinutes(day.start);
  const closeMin = timeToMinutes(day.end);
  const startMin = timeToMinutes(startLocal.time);
  const endMin = endLocal.date === startLocal.date ? timeToMinutes(endLocal.time) : 24 * 60;

  if (startMin < openMin || endMin > closeMin) {
    throw ApiError.conflict(`${staff.fullName} is not working at the selected time`);
  }

  for (const b of day.breaks) {
    if (rangesOverlap(startMin, endMin, timeToMinutes(b.start), timeToMinutes(b.end))) {
      throw ApiError.conflict(`${staff.fullName} has a break during the selected time`);
    }
  }
}

export { rangesOverlap };
