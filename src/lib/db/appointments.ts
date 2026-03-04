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

export async function createAppointment(data: Omit<Appointment, "id" | "status" | "createdAt">): Promise<Appointment> {
  const result = await gsheet.call("apt_create", data as Record<string, unknown>);
  if (result && typeof result === "object" && "error" in result) {
    throw new Error((result as { error: string }).error);
  }
  return result as Appointment;
}

export async function getAppointment(id: string): Promise<Appointment | null> {
  const result = await gsheet.call("apt_get", { id });
  if (!result) return null;
  return result as Appointment;
}

export async function listAppointments(): Promise<Appointment[]> {
  const result = await gsheet.call("apt_list");
  return (result as Appointment[]) ?? [];
}

export async function listAppointmentsByDate(date: string): Promise<Appointment[]> {
  const all = await listAppointments();
  return all
    .filter((a) => a.date === date)
    .sort((a, b) => a.time.localeCompare(b.time));
}

export async function updateAppointmentStatus(
  id: string,
  newStatus: Appointment["status"]
): Promise<Appointment | null> {
  const result = await gsheet.call("apt_update_status", { id, status: newStatus });
  if (!result) return null;
  return result as Appointment;
}

export async function deleteAppointment(id: string): Promise<boolean> {
  const result = await gsheet.call("apt_delete", { id });
  return !!(result && typeof result === "object" && (result as Record<string, unknown>).success);
}
