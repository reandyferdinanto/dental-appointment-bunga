import { db } from "@/lib/redis";
import { keys } from "./keys";

export interface Schedule {
  date: string; // YYYY-MM-DD
  slots: string[]; // ["09:00", "09:30", "10:00", ...]
}

const DEFAULT_KOAS_ID = "bunga";

export async function setSchedule(date: string, slots: string[], koasId: string = DEFAULT_KOAS_ID): Promise<void> {
  // Clear existing slots for this date
  const existingSlots = await db.smembers(keys.schedule(koasId, date));
  if (existingSlots.length > 0) {
    for (const slot of existingSlots) {
      await db.srem(keys.schedule(koasId, date), slot);
    }
  }

  // Add new slots
  if (slots.length > 0) {
    for (const slot of slots) {
      await db.sadd(keys.schedule(koasId, date), slot);
    }
    await db.sadd(keys.scheduleDates(koasId), date);
  } else {
    await db.srem(keys.scheduleDates(koasId), date);
  }
}

export async function getSchedule(date: string, koasId: string = DEFAULT_KOAS_ID): Promise<Schedule> {
  const slots: string[] = await db.smembers(keys.schedule(koasId, date));
  return {
    date,
    slots: slots.sort(),
  };
}

export async function getScheduleDates(koasId: string = DEFAULT_KOAS_ID): Promise<string[]> {
  const dates: string[] = await db.smembers(keys.scheduleDates(koasId));
  return dates.sort();
}

export async function getWeekSchedules(
  startDate: Date,
  koasId: string = DEFAULT_KOAS_ID
): Promise<Schedule[]> {
  const schedules: Schedule[] = [];
  for (let i = 0; i < 7; i++) {
    // Use local date arithmetic — new Date(y, m, d+i) stays in local timezone
    const d = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i, 0, 0, 0, 0);
    const y = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const dateStr = `${y}-${mo}-${day}`;
    const schedule = await getSchedule(dateStr, koasId);
    schedules.push(schedule);
  }
  return schedules;
}

export async function addSlot(date: string, time: string, koasId: string = DEFAULT_KOAS_ID): Promise<void> {
  await db.sadd(keys.schedule(koasId, date), time);
  await db.sadd(keys.scheduleDates(koasId), date);
}

export async function removeSlot(date: string, time: string, koasId: string = DEFAULT_KOAS_ID): Promise<void> {
  await db.srem(keys.schedule(koasId, date), time);
  const remaining = await db.smembers(keys.schedule(koasId, date));
  if (remaining.length === 0) {
    await db.srem(keys.scheduleDates(koasId), date);
  }
}
