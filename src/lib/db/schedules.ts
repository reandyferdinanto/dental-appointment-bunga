/**
 * db/schedules.ts
 *
 * Strategy:
 *   GET  → MongoDB (primary)
 *   POST/SET/DELETE → MongoDB + Google Sheets (backup)
 */
import { getDb, COLLECTIONS } from "@/lib/mongodb";
import { gsheet } from "@/lib/gsheet";

export interface Schedule {
  date: string; // YYYY-MM-DD
  slots: string[]; // ["09:00", "09:30", ...]
}

interface ScheduleDoc {
  koasId: string;
  date: string;
  slots: string[];
}

const DEFAULT_KOAS_ID = "bunga";

// ── WRITE: MongoDB + GSheet backup ──────────────────────────────────────────

export async function setSchedule(
  date: string,
  slots: string[],
  koasId: string = DEFAULT_KOAS_ID
): Promise<void> {
  const db = await getDb();
  await db.collection(COLLECTIONS.schedules).updateOne(
    { koasId, date },
    { $set: { koasId, date, slots } },
    { upsert: true }
  );

  // Backup to Google Sheets
  gsheet.call("sch_set", { koasId, date, slots }).catch(err => {
    console.error("[schedules] GSheet backup error:", err);
  });
}

// ── READ: from MongoDB ──────────────────────────────────────────────────────

export async function getSchedule(
  date: string,
  koasId: string = DEFAULT_KOAS_ID
): Promise<Schedule> {
  const db = await getDb();
  const doc = await db.collection(COLLECTIONS.schedules).findOne({ koasId, date });
  if (!doc) return { date, slots: [] };
  return { date: doc.date as string, slots: (doc.slots as string[]) ?? [] };
}

export async function getWeekSchedules(
  startDate: Date,
  koasId: string = DEFAULT_KOAS_ID
): Promise<Schedule[]> {
  const y = startDate.getFullYear();
  const m = String(startDate.getMonth() + 1).padStart(2, "0");
  const d = String(startDate.getDate()).padStart(2, "0");
  const weekStart = `${y}-${m}-${d}`;

  // Build array of 7 dates
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const dt = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i);
    const yy = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, "0");
    const dd = String(dt.getDate()).padStart(2, "0");
    dates.push(`${yy}-${mm}-${dd}`);
  }

  const db = await getDb();
  const docs = await db.collection(COLLECTIONS.schedules)
    .find({ koasId, date: { $in: dates } })
    .toArray();

  // Return schedules for all 7 days, even if empty
  return dates.map(date => {
    const doc = docs.find(d => d.date === date);
    return { date, slots: doc ? (doc.slots as string[]) : [] };
  });
}

// ── UPDATE slots ────────────────────────────────────────────────────────────

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
  const db = await getDb();
  await db.collection(COLLECTIONS.schedules).updateOne(
    { koasId, date },
    { $pull: { slots: time } as any }
  );

  // Backup to Google Sheets
  gsheet.call("sch_remove_slot", { koasId, date, time }).catch(err => {
    console.error("[schedules] GSheet backup error:", err);
  });
}

export async function getScheduleDates(
  koasId: string = DEFAULT_KOAS_ID
): Promise<string[]> {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, "0");
  const d = String(today.getDate()).padStart(2, "0");
  const todayStr = `${y}-${m}-${d}`;

  // Get dates from the next 30 days
  const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30);
  const ey = endDate.getFullYear();
  const em = String(endDate.getMonth() + 1).padStart(2, "0");
  const ed = String(endDate.getDate()).padStart(2, "0");
  const endStr = `${ey}-${em}-${ed}`;

  const db = await getDb();
  const docs = await db.collection(COLLECTIONS.schedules)
    .find({
      koasId,
      date: { $gte: todayStr, $lte: endStr },
      "slots.0": { $exists: true }, // only dates that have at least 1 slot
    })
    .project({ date: 1, _id: 0 })
    .sort({ date: 1 })
    .toArray();

  return docs.map(d => d.date as string);
}
