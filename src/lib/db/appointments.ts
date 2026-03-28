/**
 * db/appointments.ts
 *
 * Strategy:
 *   GET  → MongoDB (primary)
 *   POST/PATCH/DELETE → MongoDB + Google Sheets (backup)
 */
import { getDb, COLLECTIONS } from "@/lib/mongodb";
import { gsheet } from "@/lib/gsheet";

export interface Appointment {
  id: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  koasId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  complaint: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  notes?: string;
  createdAt: string;
}

// ── READ: from MongoDB ──────────────────────────────────────────────────────

export async function createAppointment(data: Omit<Appointment, "id" | "status" | "createdAt">): Promise<Appointment> {
  const { v4: uuidv4 } = await import("uuid");
  const now = new Date().toISOString();
  const appointment: Appointment = {
    id: uuidv4(),
    ...data,
    status: "pending",
    createdAt: now,
  };

  // Write to MongoDB
  const db = await getDb();
  await db.collection(COLLECTIONS.appointments).insertOne({ ...appointment, _id: appointment.id as unknown as import("mongodb").ObjectId });

  // Backup to Google Sheets (fire-and-forget, don't block)
  gsheet.call("apt_create", data as Record<string, unknown>).catch(err => {
    console.error("[appointments] GSheet backup error:", err);
  });

  return appointment;
}

export async function getAppointment(id: string): Promise<Appointment | null> {
  const db = await getDb();
  const doc = await db.collection(COLLECTIONS.appointments).findOne({ id });
  if (!doc) return null;
  const { _id, ...rest } = doc;
  void _id;
  return rest as unknown as Appointment;
}

export async function listAppointments(): Promise<Appointment[]> {
  const db = await getDb();
  const docs = await db.collection(COLLECTIONS.appointments)
    .find({})
    .sort({ createdAt: -1 })
    .toArray();
  return docs.map(({ _id, ...rest }) => { void _id; return rest as unknown as Appointment; });
}

export async function listAppointmentsByDate(date: string): Promise<Appointment[]> {
  const db = await getDb();
  const docs = await db.collection(COLLECTIONS.appointments)
    .find({ date })
    .sort({ time: 1 })
    .toArray();
  return docs.map(({ _id, ...rest }) => { void _id; return rest as unknown as Appointment; });
}

export async function updateAppointmentStatus(
  id: string,
  newStatus: Appointment["status"]
): Promise<Appointment | null> {
  const db = await getDb();
  const result = await db.collection(COLLECTIONS.appointments).findOneAndUpdate(
    { id },
    { $set: { status: newStatus } },
    { returnDocument: "after" }
  );
  if (!result) return null;

  // Backup to Google Sheets
  gsheet.call("apt_update_status", { id, status: newStatus }).catch(err => {
    console.error("[appointments] GSheet backup error:", err);
  });

  const { _id, ...rest } = result;
  void _id;
  return rest as unknown as Appointment;
}

export async function deleteAppointment(id: string): Promise<boolean> {
  const db = await getDb();
  const result = await db.collection(COLLECTIONS.appointments).deleteOne({ id });

  // Backup to Google Sheets
  gsheet.call("apt_delete", { id }).catch(err => {
    console.error("[appointments] GSheet backup error:", err);
  });

  return result.deletedCount > 0;
}
