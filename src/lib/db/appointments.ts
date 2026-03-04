import { db } from "@/lib/redis";
import { keys } from "./keys";
import { generateId } from "@/lib/utils";

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

export async function createAppointment(data: Omit<Appointment, "id" | "status" | "createdAt">): Promise<Appointment> {
  const id = generateId();
  const appointment: Appointment = {
    ...data,
    id,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  // Atomic: remove slot from schedule to prevent double booking
  const removed = await db.srem(keys.schedule(data.koasId, data.date), data.time);
  if (removed === 0) {
    throw new Error("Slot sudah tidak tersedia");
  }

  // Save appointment data
  await db.set(keys.appointment(id), JSON.stringify(appointment));

  // Add to indices
  await db.sadd(keys.appointmentsAll(), id);
  await db.sadd(keys.appointmentsByDate(data.date), id);
  await db.sadd(keys.appointmentsByStatus("pending"), id);
  await db.sadd(keys.koasAppointments(data.koasId), id);

  return appointment;
}

export async function getAppointment(id: string): Promise<Appointment | null> {
  const data = await db.get(keys.appointment(id));
  if (!data) return null;
  return typeof data === "string" ? JSON.parse(data) : data;
}

export async function listAppointments(): Promise<Appointment[]> {
  const ids: string[] = await db.smembers(keys.appointmentsAll());
  if (!ids.length) return [];

  const appointments: Appointment[] = [];
  for (const id of ids) {
    const apt = await getAppointment(id);
    if (apt) appointments.push(apt);
  }

  return appointments.sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function listAppointmentsByDate(date: string): Promise<Appointment[]> {
  const ids: string[] = await db.smembers(keys.appointmentsByDate(date));
  if (!ids.length) return [];

  const appointments: Appointment[] = [];
  for (const id of ids) {
    const apt = await getAppointment(id);
    if (apt) appointments.push(apt);
  }

  return appointments.sort((a, b) => a.time.localeCompare(b.time));
}

export async function updateAppointmentStatus(
  id: string,
  newStatus: Appointment["status"]
): Promise<Appointment | null> {
  const apt = await getAppointment(id);
  if (!apt) return null;

  const oldStatus = apt.status;
  apt.status = newStatus;

  await db.set(keys.appointment(id), JSON.stringify(apt));

  // Update status indices
  await db.srem(keys.appointmentsByStatus(oldStatus), id);
  await db.sadd(keys.appointmentsByStatus(newStatus), id);

  // If cancelled, restore the slot
  if (newStatus === "cancelled") {
    await db.sadd(keys.schedule(apt.koasId, apt.date), apt.time);
  }

  return apt;
}

export async function deleteAppointment(id: string): Promise<boolean> {
  const apt = await getAppointment(id);
  if (!apt) return false;

  await db.del(keys.appointment(id));
  await db.srem(keys.appointmentsAll(), id);
  await db.srem(keys.appointmentsByDate(apt.date), id);
  await db.srem(keys.appointmentsByStatus(apt.status), id);
  await db.srem(keys.koasAppointments(apt.koasId), id);

  // Restore slot
  await db.sadd(keys.schedule(apt.koasId, apt.date), apt.time);

  return true;
}

