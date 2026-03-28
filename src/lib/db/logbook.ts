/**
 * db/logbook.ts
 *
 * Strategy:
 *   GET  → MongoDB (primary)
 *   POST/PATCH/DELETE → MongoDB + Google Sheets (backup)
 */
import { getDb, COLLECTIONS } from "@/lib/mongodb";
import { gsheet } from "@/lib/gsheet";

export interface LogbookEntry {
  id: string;
  koasId: string;
  appointmentId?: string;
  date: string;
  patientInitials: string;
  procedureType: string;
  toothNumber?: string;
  diagnosis: string;
  treatment: string;
  supervisorName: string;
  competencyLevel: "observed" | "assisted" | "performed";
  notes?: string;
  createdAt: string;
}

// ── WRITE: MongoDB + GSheet backup ──────────────────────────────────────────

export async function createLogbookEntry(
  data: Omit<LogbookEntry, "id" | "createdAt">
): Promise<LogbookEntry> {
  const { v4: uuidv4 } = await import("uuid");
  const now = new Date().toISOString();
  const entry: LogbookEntry = {
    id: uuidv4(),
    ...data,
    createdAt: now,
  };

  const db = await getDb();
  await db.collection(COLLECTIONS.logbook).insertOne({ ...entry, _id: entry.id as unknown as import("mongodb").ObjectId });

  // Backup to Google Sheets
  gsheet.call("log_create", data as Record<string, unknown>).catch(err => {
    console.error("[logbook] GSheet backup error:", err);
  });

  return entry;
}

// ── READ: from MongoDB ──────────────────────────────────────────────────────

export async function getLogbookEntry(id: string): Promise<LogbookEntry | null> {
  const db = await getDb();
  const doc = await db.collection(COLLECTIONS.logbook).findOne({ id });
  if (!doc) return null;
  const { _id, ...rest } = doc;
  void _id;
  return rest as unknown as LogbookEntry;
}

export async function listLogbookEntries(koasId?: string): Promise<LogbookEntry[]> {
  const db = await getDb();
  const filter = koasId ? { koasId } : {};
  const docs = await db.collection(COLLECTIONS.logbook)
    .find(filter)
    .sort({ createdAt: -1 })
    .toArray();
  return docs.map(({ _id, ...rest }) => { void _id; return rest as unknown as LogbookEntry; });
}

// ── UPDATE: MongoDB + GSheet backup ─────────────────────────────────────────

export async function updateLogbookEntry(
  id: string,
  data: Partial<LogbookEntry>
): Promise<LogbookEntry | null> {
  const db = await getDb();
  const result = await db.collection(COLLECTIONS.logbook).findOneAndUpdate(
    { id },
    { $set: data },
    { returnDocument: "after" }
  );
  if (!result) return null;

  // Backup to Google Sheets
  gsheet.call("log_update", { id, ...data } as Record<string, unknown>).catch(err => {
    console.error("[logbook] GSheet backup error:", err);
  });

  const { _id, ...rest } = result;
  void _id;
  return rest as unknown as LogbookEntry;
}

// ── DELETE: MongoDB + GSheet backup ─────────────────────────────────────────

export async function deleteLogbookEntry(id: string): Promise<boolean> {
  const db = await getDb();
  const result = await db.collection(COLLECTIONS.logbook).deleteOne({ id });

  // Backup to Google Sheets
  gsheet.call("log_delete", { id }).catch(err => {
    console.error("[logbook] GSheet backup error:", err);
  });

  return result.deletedCount > 0;
}
