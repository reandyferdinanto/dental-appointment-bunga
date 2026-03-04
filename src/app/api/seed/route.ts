import { NextResponse } from "next/server";
import { setSchedule } from "@/lib/db/schedules";
import { db } from "@/lib/redis";
import { keys } from "@/lib/db/keys";
import { generateId } from "@/lib/utils";

// Seed demo data - only for development
export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not allowed in production" }, { status: 403 });
  }

  const today = new Date();
  const slots = ["09:00", "09:30", "10:00", "10:30", "11:00", "13:00", "13:30", "14:00", "14:30", "15:00"];

  // Seed schedules for the next 14 days (except Sundays)
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    if (d.getDay() !== 0) {
      const dateStr = d.toISOString().split("T")[0];
      await setSchedule(dateStr, slots);
    }
  }

  // Seed sample appointments
  const sampleAppointments = [
    {
      id: generateId(),
      patientName: "Budi Santoso",
      patientPhone: "081234567890",
      koasId: "bunga",
      date: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      time: "09:00",
      complaint: "Gigi geraham kiri bawah berlubang dan sakit saat makan",
      status: "confirmed",
      createdAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      patientName: "Siti Rahayu",
      patientPhone: "082345678901",
      koasId: "bunga",
      date: today.toISOString().split("T")[0],
      time: "10:00",
      complaint: "Ingin pembersihan karang gigi rutin",
      status: "pending",
      createdAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      patientName: "Ahmad Fauzi",
      patientPhone: "083456789012",
      koasId: "bunga",
      date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      time: "13:00",
      complaint: "Gigi depan atas patah akibat kecelakaan",
      status: "completed",
      createdAt: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  for (const apt of sampleAppointments) {
    await db.set(keys.appointment(apt.id), JSON.stringify(apt));
    await db.sadd(keys.appointmentsAll(), apt.id);
    await db.sadd(keys.appointmentsByDate(apt.date), apt.id);
    await db.sadd(keys.appointmentsByStatus(apt.status), apt.id);
    await db.sadd(keys.koasAppointments(apt.koasId), apt.id);
  }

  // Seed sample logbook entries
  const sampleLogbook = [
    {
      id: generateId(),
      koasId: "bunga",
      date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      patientInitials: "Tn. AF",
      procedureType: "Penambalan Komposit",
      toothNumber: "11",
      diagnosis: "Fraktur mahkota Ellis kelas II",
      treatment: "Penambalan komposit kelas IV dengan etsa dan bonding",
      supervisorName: "drg. Hendra Wijaya, Sp.KG",
      competencyLevel: "performed",
      notes: "Pasien kooperatif, hasil baik",
      createdAt: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: generateId(),
      koasId: "bunga",
      date: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      patientInitials: "Ny. DR",
      procedureType: "Scaling / Pembersihan Karang Gigi",
      toothNumber: "",
      diagnosis: "Kalkulus supragingival generalisata",
      treatment: "Scaling ultrasonik full arch, diikuti polishing",
      supervisorName: "drg. Anita Kusuma, Sp.Perio",
      competencyLevel: "assisted",
      notes: "Perdarahan minimal, OH pasien perlu ditingkatkan",
      createdAt: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  for (const entry of sampleLogbook) {
    await db.set(keys.logbook(entry.id), JSON.stringify(entry));
    await db.sadd(keys.logbooksAll(), entry.id);
    await db.sadd(keys.koasLogbooks(entry.koasId), entry.id);
  }

  return NextResponse.json({
    success: true,
    message: "Demo data berhasil diseed!",
    data: {
      scheduleDays: 14,
      appointments: sampleAppointments.length,
      logbookEntries: sampleLogbook.length,
    }
  });
}

