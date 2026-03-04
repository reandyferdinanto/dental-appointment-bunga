import { z } from "zod";

export const appointmentSchema = z.object({
  patientName: z.string().min(2, "Nama minimal 2 karakter"),
  patientPhone: z.string().min(10, "Nomor HP minimal 10 digit"),
  patientEmail: z.string().email("Email tidak valid").optional().or(z.literal("")),
  koasId: z.string().default("bunga"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal: YYYY-MM-DD"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Format waktu: HH:mm"),
  complaint: z.string().min(5, "Keluhan minimal 5 karakter"),
  notes: z.string().optional(),
});

export const scheduleSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal: YYYY-MM-DD"),
  slots: z.array(z.string().regex(/^\d{2}:\d{2}$/, "Format waktu: HH:mm")),
});

export const logbookSchema = z.object({
  koasId: z.string().default("bunga"),
  appointmentId: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal: YYYY-MM-DD"),
  patientInitials: z.string().min(1, "Inisial pasien wajib diisi"),
  procedureType: z.string().min(1, "Jenis tindakan wajib diisi"),
  toothNumber: z.string().optional(),
  diagnosis: z.string().min(3, "Diagnosis wajib diisi"),
  treatment: z.string().min(3, "Tindakan wajib diisi"),
  supervisorName: z.string().min(2, "Nama pembimbing wajib diisi"),
  competencyLevel: z.enum(["observed", "assisted", "performed"]),
  notes: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(4, "Password minimal 4 karakter"),
});

export type AppointmentInput = z.infer<typeof appointmentSchema>;
export type ScheduleInput = z.infer<typeof scheduleSchema>;
export type LogbookInput = z.infer<typeof logbookSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

