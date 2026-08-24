export const DAYS_OF_WEEK = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
export type DayOfWeek = (typeof DAYS_OF_WEEK)[number];

export const DAY_LABELS: Record<DayOfWeek, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

/** A break period within a working day, e.g. lunch. "HH:mm" 24h, Asia/Colombo local time. */
export interface DayBreak {
  start: string;
  end: string;
}

export interface DayHours {
  isOpen: boolean;
  open: string;
  close: string;
  breaks: DayBreak[];
}

export type WeeklyHours = Record<DayOfWeek, DayHours>;

/** A one-off override for a specific calendar date — a holiday's special hours. */
export interface SpecialDayHours {
  id: string;
  date: string; // YYYY-MM-DD
  label: string;
  isClosed: boolean;
  open: string | null;
  close: string | null;
}

/** A multi-day temporary closure, e.g. renovation. */
export interface SalonClosure {
  id: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  reason: string;
}

const DEFAULT_DAY_HOURS: DayHours = { isOpen: true, open: "09:00", close: "18:00", breaks: [] };
const DEFAULT_WEEKEND_HOURS: DayHours = { isOpen: true, open: "09:00", close: "17:00", breaks: [] };

export function defaultWeeklyHours(): WeeklyHours {
  return {
    mon: { ...DEFAULT_DAY_HOURS, breaks: [] },
    tue: { ...DEFAULT_DAY_HOURS, breaks: [] },
    wed: { ...DEFAULT_DAY_HOURS, breaks: [] },
    thu: { ...DEFAULT_DAY_HOURS, breaks: [] },
    fri: { ...DEFAULT_DAY_HOURS, breaks: [] },
    sat: { ...DEFAULT_WEEKEND_HOURS, breaks: [] },
    sun: { isOpen: false, open: "09:00", close: "17:00", breaks: [] },
  };
}
