import { db } from "@/lib/redis";
import { keys } from "./keys";
import { generateId } from "@/lib/utils";

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

export async function createLogbookEntry(
  data: Omit<LogbookEntry, "id" | "createdAt">
): Promise<LogbookEntry> {
  const id = generateId();
  const entry: LogbookEntry = {
    ...data,
    id,
    createdAt: new Date().toISOString(),
  };

  await db.set(keys.logbook(id), JSON.stringify(entry));
  await db.sadd(keys.logbooksAll(), id);
  await db.sadd(keys.koasLogbooks(data.koasId), id);

  return entry;
}

export async function getLogbookEntry(id: string): Promise<LogbookEntry | null> {
  const data = await db.get(keys.logbook(id));
  if (!data) return null;
  return typeof data === "string" ? JSON.parse(data) : data;
}

export async function listLogbookEntries(koasId?: string): Promise<LogbookEntry[]> {
  const key = koasId ? keys.koasLogbooks(koasId) : keys.logbooksAll();
  const ids: string[] = await db.smembers(key);
  if (!ids.length) return [];

  const entries: LogbookEntry[] = [];
  for (const id of ids) {
    const entry = await getLogbookEntry(id);
    if (entry) entries.push(entry);
  }

  return entries.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function updateLogbookEntry(
  id: string,
  data: Partial<LogbookEntry>
): Promise<LogbookEntry | null> {
  const entry = await getLogbookEntry(id);
  if (!entry) return null;

  const updated = { ...entry, ...data, id: entry.id };
  await db.set(keys.logbook(id), JSON.stringify(updated));
  return updated;
}

export async function deleteLogbookEntry(id: string): Promise<boolean> {
  const entry = await getLogbookEntry(id);
  if (!entry) return false;

  await db.del(keys.logbook(id));
  await db.srem(keys.logbooksAll(), id);
  await db.srem(keys.koasLogbooks(entry.koasId), id);

  return true;
}

