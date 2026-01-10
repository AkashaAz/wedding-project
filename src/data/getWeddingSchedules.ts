import { supabase } from "@/lib/supabase";

// Union type for slot keys
export type WeddingScheduleSlot =
  | "ceremony_1"
  | "ceremony_2"
  | "dinner"
  | "after_party";

// Raw database data
export interface WeddingSchedule {
  id: string;
  weddingId: string;
  slotKey: WeddingScheduleSlot;
  startTime: string | null;
  isEnabled: boolean;
}

// Prepared data for UI
export interface PreparedWeddingSchedule {
  id: string;
  slotKey: WeddingScheduleSlot;
  startTime: string | null;
  displayTime: string;
}

// Formatting options
export interface ScheduleFormattingOptions {
  locale?: string;
  timeZone?: string;
}

/**
 * Data layer: Fetch wedding schedules from Supabase
 * Returns raw data only - no formatting or sorting
 */
export async function getWeddingSchedules(
  weddingId: string
): Promise<WeddingSchedule[]> {
  const { data, error } = await supabase
    .from("wedding_schedules")
    .select("*")
    .eq("wedding_id", weddingId);

  if (error || !data) {
    return [];
  }

  return data.map((row) => ({
    id: row.id,
    weddingId: row.wedding_id,
    slotKey: row.slot_key,
    startTime: row.start_time,
    isEnabled: row.is_enabled,
  }));
}

/**
 * Logic layer: Prepare schedules for UI consumption
 * - Filters out disabled schedules
 * - Sorts by start_time (ascending) with fallback to slot order
 * - Formats time as HH:mm using timezone-aware formatter
 * Does NOT fetch data
 */
export function prepareWeddingSchedule(
  schedules: WeddingSchedule[],
  options: ScheduleFormattingOptions = {}
): PreparedWeddingSchedule[] {
  const { locale = "en-US", timeZone = "Asia/Bangkok" } = options;

  // Define slot order for sorting fallback
  const slotOrder: WeddingScheduleSlot[] = [
    "ceremony_1",
    "ceremony_2",
    "dinner",
    "after_party",
  ];

  // Filter enabled schedules
  const enabledSchedules = schedules.filter((schedule) => schedule.isEnabled);

  // Create a new array before sorting to avoid mutation
  const sortedSchedules = [...enabledSchedules].sort((a, b) => {
    // If both have start_time, compare them
    if (a.startTime && b.startTime) {
      return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    }

    // If one has start_time and the other doesn't, prioritize the one with time
    if (a.startTime && !b.startTime) return -1;
    if (!a.startTime && b.startTime) return 1;

    // If neither has start_time, or times are equal, use slot order
    const aIndex = slotOrder.indexOf(a.slotKey);
    const bIndex = slotOrder.indexOf(b.slotKey);
    return aIndex - bIndex;
  });

  // Format time as HH:mm
  return sortedSchedules.map((schedule) => ({
    id: schedule.id,
    slotKey: schedule.slotKey,
    startTime: schedule.startTime,
    displayTime: formatTime(schedule.startTime, locale, timeZone),
  }));
}

/**
 * Helper: Format ISO timestamp to HH:mm using Intl.DateTimeFormat
 * Timezone-aware formatting that respects the specified locale and timeZone
 */
function formatTime(
  isoString: string | null,
  locale: string,
  timeZone: string
): string {
  if (!isoString) return "--:--";

  try {
    const date = new Date(isoString);
    const formatter = new Intl.DateTimeFormat(locale, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone,
    });
    return formatter.format(date);
  } catch {
    return "--:--";
  }
}
