import { NextRequest, NextResponse } from "next/server";
import { gsheet } from "@/lib/gsheet";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const data = await gsheet.call("settings_get");
    if (!data || typeof data !== "object" || "error" in (data as object)) {
      // Return defaults if not set yet
      return NextResponse.json(getDefaultSettings());
    }
    return NextResponse.json({ ...getDefaultSettings(), ...(data as object) });
  } catch {
    return NextResponse.json(getDefaultSettings());
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const result = await gsheet.call("settings_set", body as Record<string, unknown>);
    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal menyimpan pengaturan" }, { status: 500 });
  }
}

function getDefaultSettings() {
  return {
    clinicName: "Klinik Gigi drg. Natasya Bunga Maureen",
    doctorName: "drg. Natasya Bunga Maureen",
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

