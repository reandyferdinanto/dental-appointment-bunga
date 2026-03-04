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

export async function createLogbookEntry(
  data: Omit<LogbookEntry, "id" | "createdAt">
): Promise<LogbookEntry> {
  const result = await gsheet.call("log_create", data as Record<string, unknown>);
  return result as LogbookEntry;
}

export async function getLogbookEntry(id: string): Promise<LogbookEntry | null> {
  const result = await gsheet.call("log_get", { id });
  if (!result) return null;
  return result as LogbookEntry;
}

export async function listLogbookEntries(koasId?: string): Promise<LogbookEntry[]> {
  const result = await gsheet.call("log_list", { koasId: koasId ?? "bunga" });
  return (result as LogbookEntry[]) ?? [];
}

export async function updateLogbookEntry(
  id: string,
  data: Partial<LogbookEntry>
): Promise<LogbookEntry | null> {
  const result = await gsheet.call("log_update", { id, ...data } as Record<string, unknown>);
  if (!result) return null;
  return result as LogbookEntry;
}

export async function deleteLogbookEntry(id: string): Promise<boolean> {
  const result = await gsheet.call("log_delete", { id });
  return !!(result && typeof result === "object" && (result as Record<string, unknown>).success);
}
