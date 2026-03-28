import { NextRequest, NextResponse } from "next/server";
import { getDb, COLLECTIONS } from "@/lib/mongodb";
import { gsheet } from "@/lib/gsheet";

/**
 * Google Sheets stores time values as Date objects serialized to ISO strings
 * anchored at 1899-12-30 (e.g. "1899-12-30T08:00:00.000Z").
 * This helper extracts a clean "HH:mm" string from any format.
 */
function normalizeTimeStr(val: unknown, fallback: string): string {
  if (!val) return fallback;
  const str = String(val);
  // Already HH:mm or HH:mm:ss
  if (/^\d{1,2}:\d{2}/.test(str)) {
    return str.slice(0, 5);
  }
  // ISO date string — extract UTC time portion
  const match = str.match(/T(\d{2}):(\d{2})/);
  if (match) {
    return `${match[1]}:${match[2]}`;
  }
  return fallback;
}

function normalizeSettings(raw: Record<string, unknown>) {
  const defaults = getDefaultSettings();
  return {
    ...defaults,
    ...raw,
    // Always normalize time fields regardless of how Sheets serialized them
    workHourStart: normalizeTimeStr(raw.workHourStart, defaults.workHourStart),
    workHourEnd: normalizeTimeStr(raw.workHourEnd, defaults.workHourEnd),
    breakStart: normalizeTimeStr(raw.breakStart, defaults.breakStart),
    breakEnd: normalizeTimeStr(raw.breakEnd, defaults.breakEnd),
    slotDurationMinutes: Number(raw.slotDurationMinutes) || defaults.slotDurationMinutes,
    services: Array.isArray(raw.services)
      ? raw.services
      : typeof raw.services === "string"
        ? (() => { try { return JSON.parse(raw.services as string); } catch { return defaults.services; } })()
        : defaults.services,
  };
}

// ── GET: Read from MongoDB ──────────────────────────────────────────────────
export async function GET() {
  try {
    const db = await getDb();
    const data = await db.collection(COLLECTIONS.settings).findOne({ _id: "main" as unknown as import("mongodb").ObjectId });
    if (!data) {
      return NextResponse.json(getDefaultSettings());
    }
    const { _id, ...rest } = data;
    void _id;
    return NextResponse.json(normalizeSettings(rest as Record<string, unknown>));
  } catch {
    return NextResponse.json(getDefaultSettings());
  }
}

// ── POST: Write to MongoDB + Google Sheets (backup) ─────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Sanitize: ensure time fields are plain HH:mm strings
    const sanitized = {
      ...body,
      workHourStart: normalizeTimeStr(body.workHourStart, "08:00"),
      workHourEnd: normalizeTimeStr(body.workHourEnd, "16:00"),
      breakStart: normalizeTimeStr(body.breakStart, "12:00"),
      breakEnd: normalizeTimeStr(body.breakEnd, "13:00"),
      slotDurationMinutes: Number(body.slotDurationMinutes) || 30,
      services: Array.isArray(body.services) ? body.services : [],
    };

    // Write to MongoDB
    const db = await getDb();
    await db.collection(COLLECTIONS.settings).updateOne(
      { _id: "main" as unknown as import("mongodb").ObjectId },
      { $set: sanitized },
      { upsert: true }
    );

    // Backup to Google Sheets (fire-and-forget)
    gsheet.call("settings_set", sanitized as Record<string, unknown>).catch(err => {
      console.error("[settings] GSheet backup error:", err);
    });
    gsheet.invalidate("settings_set");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[settings POST]", error);
    return NextResponse.json({ error: "Gagal menyimpan pengaturan" }, { status: 500 });
  }
}

function getDefaultSettings() {
  return {
    clinicName: "Klinik Gigi drg. Natasya Bunga Maureen",
    doctorName: "Natasya Bunga Maureen",
    phone: "08xxxxxxxxxx",
    whatsapp: "08xxxxxxxxxx",
    email: "bunga@dentist.com",
    address: "Klinik Gigi RSGM / Puskesmas",
    slotDurationMinutes: 30,
    workHourStart: "08:00",
    workHourEnd: "16:00",
    breakStart: "12:00",
    breakEnd: "13:00",
    services: [
      "Pemeriksaan Gigi",
      "Pencabutan Gigi",
      "Penambalan Gigi",
      "Pembersihan Karang Gigi",
      "Perawatan Saluran Akar",
      "Pencetakan Gigi",
      "Konsultasi Ortodonti",
    ],
    instagramUrl: "",
    lineId: "",
    announcement: "",
  };
}
