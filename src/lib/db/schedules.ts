import { gsheet } from "@/lib/gsheet";

export interface Schedule {
  date: string; // YYYY-MM-DD
  slots: string[]; // ["09:00", "09:30", ...]
}

const DEFAULT_KOAS_ID = "bunga";

export async function setSchedule(
  date: string,
  slots: string[],
  koasId: string = DEFAULT_KOAS_ID
): Promise<void> {
  await gsheet.call("sch_set", { koasId, date, slots });
}

export async function getSchedule(
  date: string,
  koasId: string = DEFAULT_KOAS_ID
): Promise<Schedule> {
  const result = await gsheet.call("sch_get", { koasId, date });
  if (!result) return { date, slots: [] };
  return result as Schedule;
}

export async function getWeekSchedules(
  startDate: Date,
  koasId: string = DEFAULT_KOAS_ID
): Promise<Schedule[]> {
  const y = startDate.getFullYear();
  const m = String(startDate.getMonth() + 1).padStart(2, "0");
  const d = String(startDate.getDate()).padStart(2, "0");
  const weekStart = `${y}-${m}-${d}`;
  const result = await gsheet.call("sch_get_week", { koasId, weekStart });
  return (result as Schedule[]) ?? [];
}

export async function addSlot(
  date: string,
  time: string,
  koasId: string = DEFAULT_KOAS_ID
): Promise<void> {
  const current = await getSchedule(date, koasId);
  if (!current.slots.includes(time)) {
    await setSchedule(date, [...current.slots, time].sort(), koasId);
  }
}

export async function removeSlot(
  date: string,
  time: string,
  koasId: string = DEFAULT_KOAS_ID
): Promise<void> {
  await gsheet.call("sch_remove_slot", { koasId, date, time });
}

export async function getScheduleDates(
  koasId: string = DEFAULT_KOAS_ID
): Promise<string[]> {
  // Get dates from the next 30 days that have schedules
  const today = new Date();
  const dates: string[] = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
    const y = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, "0");
    const dy = String(d.getDate()).padStart(2, "0");
    const dateStr = `${y}-${mo}-${dy}`;
    const sch = await getSchedule(dateStr, koasId);
    if (sch.slots.length > 0) dates.push(dateStr);
  }
  return dates;
}
