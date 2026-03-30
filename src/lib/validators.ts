import * as yup from "yup";
import { ValidationError } from "yup";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_REGEX = /^\d{2}:\d{2}$/;

const trimString = (value: unknown) => (typeof value === "string" ? value.trim() : value);
const emptyToUndefined = (value: unknown, originalValue: unknown) => {
  if (typeof originalValue === "string" && originalValue.trim() === "") {
    return undefined;
  }
  return trimString(value);
};
const numberFromInput = (value: unknown, originalValue: unknown) => {
  if (originalValue === "" || originalValue === null || typeof originalValue === "undefined") {
    return Number.NaN;
  }

  const parsed = Number(originalValue);
  return Number.isNaN(parsed) ? value : parsed;
};

export type FieldErrors<T extends object = Record<string, unknown>> =
  Partial<Record<Extract<keyof T, string>, string>>;

type ValidationSuccess<T> = {
  success: true;
  data: T;
};

type ValidationFailure = {
  success: false;
  errors: Record<string, string>;
  message: string;
};

export type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure;

export function getYupErrorMap(error: ValidationError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};

  if (error.path && !fieldErrors[error.path]) {
    fieldErrors[error.path] = error.message;
  }

  for (const issue of error.inner) {
    if (issue.path && !fieldErrors[issue.path]) {
      fieldErrors[issue.path] = issue.message;
    }
  }

  return fieldErrors;
}

function toValidationFailure(error: ValidationError): ValidationFailure {
  const errors = getYupErrorMap(error);
  return {
    success: false,
    errors,
    message: error.errors[0] ?? "Data tidak valid",
  };
}

export async function validateSchema<T>(schema: yup.Schema<T>, value: unknown): Promise<ValidationResult<T>> {
  try {
    const data = await schema.validate(value, {
      abortEarly: false,
      stripUnknown: true,
    });
    return { success: true, data };
  } catch (error) {
    if (error instanceof ValidationError) {
      return toValidationFailure(error);
    }
    throw error;
  }
}

export function validateSchemaSync<T>(schema: yup.Schema<T>, value: unknown): ValidationResult<T> {
  try {
    const data = schema.validateSync(value, {
      abortEarly: false,
      stripUnknown: true,
    });
    return { success: true, data };
  } catch (error) {
    if (error instanceof ValidationError) {
      return toValidationFailure(error);
    }
    throw error;
  }
}

export const appointmentSchema = yup.object({
  patientName: yup.string().transform(trimString).min(2, "Nama minimal 2 karakter").required("Nama wajib diisi"),
  patientPhone: yup.string().transform(trimString).min(10, "Nomor HP minimal 10 digit").required("Nomor HP wajib diisi"),
  patientEmail: yup.string().transform(emptyToUndefined).email("Email tidak valid").optional(),
  koasId: yup.string().transform(trimString).default("bunga"),
  date: yup.string().transform(trimString).matches(DATE_REGEX, "Format tanggal: YYYY-MM-DD").required("Tanggal wajib diisi"),
  time: yup.string().transform(trimString).matches(TIME_REGEX, "Format waktu: HH:mm").required("Waktu wajib diisi"),
  complaint: yup.string().transform(trimString).min(5, "Keluhan minimal 5 karakter").required("Keluhan wajib diisi"),
  notes: yup.string().transform(emptyToUndefined).optional(),
});

export const scheduleSchema = yup.object({
  date: yup.string().transform(trimString).matches(DATE_REGEX, "Format tanggal: YYYY-MM-DD").required("Tanggal wajib diisi"),
  slots: yup.array().of(yup.string().matches(TIME_REGEX, "Format waktu: HH:mm").required("Slot waktu wajib diisi")).required().default([]),
});

export const logbookSchema = yup.object({
  koasId: yup.string().transform(trimString).default("bunga"),
  appointmentId: yup.string().transform(emptyToUndefined).optional(),
  date: yup.string().transform(trimString).matches(DATE_REGEX, "Format tanggal: YYYY-MM-DD").required("Tanggal wajib diisi"),
  patientInitials: yup.string().transform(trimString).min(1, "Inisial pasien wajib diisi").required("Inisial pasien wajib diisi"),
  procedureType: yup.string().transform(trimString).min(1, "Jenis tindakan wajib diisi").required("Jenis tindakan wajib diisi"),
  toothNumber: yup.string().transform(emptyToUndefined).optional(),
  diagnosis: yup.string().transform(trimString).min(3, "Diagnosis wajib diisi").required("Diagnosis wajib diisi"),
  treatment: yup.string().transform(trimString).min(3, "Tindakan wajib diisi").required("Tindakan wajib diisi"),
  supervisorName: yup.string().transform(trimString).min(2, "Nama pembimbing wajib diisi").required("Nama pembimbing wajib diisi"),
  competencyLevel: yup.mixed<"observed" | "assisted" | "performed">().oneOf(["observed", "assisted", "performed"], "Tingkat kompetensi tidak valid").required("Tingkat kompetensi wajib diisi"),
  notes: yup.string().transform(emptyToUndefined).optional(),
});

export const loginSchema = yup.object({
  email: yup.string().transform(trimString).email("Email tidak valid").required("Email wajib diisi"),
  password: yup.string().transform(trimString).min(4, "Password minimal 4 karakter").required("Password wajib diisi"),
});

export const symptomAnalysisSchema = yup.object({
  patientName: yup.string().transform(emptyToUndefined).min(2, "Nama minimal 2 karakter").optional(),
  age: yup.number().transform(numberFromInput).integer("Umur harus bilangan bulat").min(1, "Umur minimal 1 tahun").max(120, "Umur tidak valid").required("Umur wajib diisi"),
  sex: yup.mixed<"female" | "male" | "other">().oneOf(["female", "male", "other"], "Jenis kelamin tidak valid").required("Jenis kelamin wajib diisi"),
  chiefComplaint: yup.string().transform(trimString).min(10, "Keluhan utama minimal 10 karakter").required("Keluhan utama wajib diisi"),
  duration: yup.string().transform(trimString).min(2, "Durasi keluhan wajib diisi").required("Durasi keluhan wajib diisi"),
  painScale: yup.number().transform(numberFromInput).integer("Skala nyeri tidak valid").min(0, "Skala nyeri minimal 0").max(10, "Skala nyeri maksimal 10").required("Skala nyeri wajib diisi"),
  hasSwelling: yup.boolean().required(),
  hasFever: yup.boolean().required(),
  hasBleeding: yup.boolean().required(),
  hasBadBreath: yup.boolean().required(),
  hasTrauma: yup.boolean().required(),
  hasDifficultyOpeningMouth: yup.boolean().required(),
  hasDifficultySwallowing: yup.boolean().required(),
  hasPus: yup.boolean().required(),
  hasToothSensitivity: yup.boolean().required(),
  pregnancyStatus: yup.mixed<"no" | "yes" | "unknown">().oneOf(["no", "yes", "unknown"], "Status kehamilan tidak valid").required("Status kehamilan wajib diisi"),
  allergies: yup.string().transform(emptyToUndefined).optional(),
  medications: yup.string().transform(emptyToUndefined).optional(),
  additionalNotes: yup.string().transform(emptyToUndefined).optional(),
});

export const symptomAnalysisResultSchema = yup.object({
  summary: yup.string().transform(trimString).min(1, "Ringkasan hasil wajib diisi").required(),
  urgency: yup.mixed<"darurat" | "segera" | "terjadwal" | "observasi">().oneOf(["darurat", "segera", "terjadwal", "observasi"], "Urgensi tidak valid").required(),
  recommendedAction: yup.string().transform(trimString).min(1, "Saran tindakan wajib diisi").required(),
  possibleConditions: yup.array().of(
    yup.object({
      name: yup.string().transform(trimString).min(1).required(),
      reason: yup.string().transform(trimString).min(1).required(),
    }).required(),
  ).min(1).max(4).required(),
  selfCare: yup.array().of(yup.string().transform(trimString).min(1).required()).min(1).max(6).required(),
  redFlags: yup.array().of(yup.string().transform(trimString).min(1).required()).min(1).max(6).required(),
  followUpQuestions: yup.array().of(yup.string().transform(trimString).min(1).required()).min(1).max(5).required(),
  bookingSuggestion: yup.string().transform(trimString).min(1).required(),
  disclaimer: yup.string().transform(trimString).min(1).required(),
});

export const settingsSchema = yup.object({
  clinicName: yup.string().transform(trimString).min(2, "Nama klinik wajib diisi").required("Nama klinik wajib diisi"),
  doctorName: yup.string().transform(trimString).min(2, "Nama dokter wajib diisi").required("Nama dokter wajib diisi"),
  phone: yup.string().transform(trimString).min(10, "No. telepon minimal 10 digit").required("No. telepon wajib diisi"),
  whatsapp: yup.string().transform(trimString).min(10, "No. WhatsApp minimal 10 digit").required("No. WhatsApp wajib diisi"),
  email: yup.string().transform(trimString).email("Email tidak valid").required("Email wajib diisi"),
  address: yup.string().transform(trimString).min(5, "Alamat praktik wajib diisi").required("Alamat praktik wajib diisi"),
  slotDurationMinutes: yup.number().transform(numberFromInput).oneOf([15, 20, 30, 45, 60], "Durasi slot tidak valid").required("Durasi slot wajib diisi"),
  workHourStart: yup.string().transform(trimString).matches(TIME_REGEX, "Format jam mulai: HH:mm").required("Jam mulai wajib diisi"),
  workHourEnd: yup.string().transform(trimString).matches(TIME_REGEX, "Format jam selesai: HH:mm").required("Jam selesai wajib diisi"),
  breakStart: yup.string().transform(trimString).matches(TIME_REGEX, "Format jam istirahat: HH:mm").required("Jam istirahat mulai wajib diisi"),
  breakEnd: yup.string().transform(trimString).matches(TIME_REGEX, "Format jam istirahat: HH:mm").required("Jam istirahat selesai wajib diisi"),
  services: yup.array().of(yup.string().transform(trimString).min(1, "Layanan tidak boleh kosong").required()).required().default([]),
  instagramUrl: yup.string().transform(emptyToUndefined).url("URL Instagram tidak valid").optional(),
  lineId: yup.string().transform(emptyToUndefined).optional(),
  announcement: yup.string().transform(emptyToUndefined).optional(),
});

export const adminAddSchema = yup.object({
  name: yup.string().transform(trimString).min(2, "Nama admin minimal 2 karakter").required("Nama admin wajib diisi"),
  email: yup.string().transform(trimString).email("Email admin tidak valid").required("Email admin wajib diisi"),
  password: yup.string().transform(trimString).min(6, "Password minimal 6 karakter").required("Password wajib diisi"),
  role: yup.mixed<"admin" | "superadmin">().oneOf(["admin", "superadmin"], "Role admin tidak valid").required("Role admin wajib diisi"),
});

export const adminChangePasswordSchema = yup.object({
  id: yup.string().transform(trimString).required("ID admin wajib diisi"),
  newPassword: yup.string().transform(trimString).min(6, "Password minimal 6 karakter").required("Password baru wajib diisi"),
});

export const adminDeleteSchema = yup.object({
  id: yup.string().transform(trimString).required("ID admin wajib diisi"),
});

export const adminUpdateSchema = yup.object({
  id: yup.string().transform(trimString).required("ID admin wajib diisi"),
  name: yup.string().transform(emptyToUndefined).min(2, "Nama admin minimal 2 karakter").optional(),
  email: yup.string().transform(emptyToUndefined).email("Email admin tidak valid").optional(),
});

export type AppointmentInput = yup.InferType<typeof appointmentSchema>;
export type ScheduleInput = yup.InferType<typeof scheduleSchema>;
export type LogbookInput = yup.InferType<typeof logbookSchema>;
export type LoginInput = yup.InferType<typeof loginSchema>;
export type SymptomAnalysisInput = yup.InferType<typeof symptomAnalysisSchema>;
export type SymptomAnalysisResult = yup.InferType<typeof symptomAnalysisResultSchema>;
export type SettingsInput = yup.InferType<typeof settingsSchema>;
export type AdminAddInput = yup.InferType<typeof adminAddSchema>;
export type AdminChangePasswordInput = yup.InferType<typeof adminChangePasswordSchema>;
